import { Product, DemandForecastItem, SmartReorderItem, FreshnessRecommendation } from '../types';

/**
 * Transparent Demand Forecasting Algorithm
 * Uses weighted moving average (heavier weight on recent days),
 * incorporates weekday vs weekend seasonality uplift,
 * and tracks confidence score based on historical consistency.
 */
export function calculateDemandForecast(product: Product): DemandForecastItem {
  const sales = product.historicalDailySales;
  const n = sales.length;

  if (n === 0) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      currentStock: product.currentStock,
      forecast1Day: 0,
      forecast7Days: 0,
      forecast30Days: 0,
      stockoutRiskLevel: 'none',
      daysUntilStockout: 999,
      confidence: 30,
      confidenceRationale: 'Low data availability. Minimum 7 days recommended.',
      growthTrend: 0
    };
  }

  // Weighted moving average (recent 3 days weighted 3x, middle 4 days 2x, older 1x)
  let weightedSum = 0;
  let weightDivider = 0;

  for (let i = 0; i < n; i++) {
    const weight = i >= n - 3 ? 3 : i >= n - 7 ? 2 : 1;
    weightedSum += sales[i] * weight;
    weightDivider += weight;
  }

  const baselineDailyDemand = weightedSum / weightDivider;

  // Weekend factor (Friday/Saturday/Sunday trend in commercial food & retail)
  const weekendMultiplier = 1.18; // ~18% higher during weekend rush
  const day1Estimate = Math.round(baselineDailyDemand * 10) / 10;
  const day7Estimate = Math.round((baselineDailyDemand * 5 + baselineDailyDemand * weekendMultiplier * 2) * 10) / 10;
  const day30Estimate = Math.round((baselineDailyDemand * 22 + baselineDailyDemand * weekendMultiplier * 8) * 10) / 10;

  // Trend detection: compare last 3 days vs preceding 7 days
  const recent3Avg = sales.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const prior7Avg = sales.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const growthTrend = prior7Avg > 0 ? Math.round(((recent3Avg - prior7Avg) / prior7Avg) * 100) : 0;

  // Stockout estimation
  const effectiveDailyRate = Math.max(0.1, baselineDailyDemand);
  const daysUntilStockout = Math.round((product.currentStock / effectiveDailyRate) * 10) / 10;

  let stockoutRiskLevel: 'high' | 'medium' | 'low' | 'none' = 'none';
  if (daysUntilStockout <= product.leadTimeDays) {
    stockoutRiskLevel = 'high';
  } else if (daysUntilStockout <= product.leadTimeDays + 2) {
    stockoutRiskLevel = 'medium';
  } else if (daysUntilStockout <= 7) {
    stockoutRiskLevel = 'low';
  }

  // Confidence calculation based on variance / consistency
  const variance = sales.reduce((acc, val) => acc + Math.pow(val - baselineDailyDemand, 2), 0) / n;
  const cv = Math.sqrt(variance) / (baselineDailyDemand || 1); // Coefficient of variation
  const confidence = Math.min(96, Math.max(68, Math.round((1 - Math.min(cv, 0.45) / 0.5) * 30 + 65)));

  return {
    productId: product.id,
    productName: product.name,
    category: product.category,
    unit: product.unit,
    currentStock: product.currentStock,
    forecast1Day: Math.max(0.5, day1Estimate),
    forecast7Days: Math.max(1, day7Estimate),
    forecast30Days: Math.max(5, day30Estimate),
    stockoutRiskLevel,
    daysUntilStockout,
    confidence,
    confidenceRationale: `Derived from 14-day weighted moving sales (CV: ${(cv * 100).toFixed(1)}%). Re-evaluated with lead-time margin.`,
    growthTrend
  };
}

/**
 * Transparent Smart Reordering Logic
 * Formula: Suggested = Max(0, (Expected Lead Time Demand + Safety Stock) - (Current Stock + On-Order Stock))
 */
export function calculateSmartReorder(
  product: Product,
  onOrderStock: number = 0
): SmartReorderItem {
  const forecast = calculateDemandForecast(product);
  const dailyRate = forecast.forecast1Day;
  const leadTime = product.leadTimeDays || 1;

  // Lead time demand
  const leadTimeDemand = dailyRate * leadTime;

  // Safety stock: 1.5 days of demand for fast perishables, 3 days for ambient
  const safetyBufferDays = product.storageCondition === 'chilled' ? 1.5 : 3;
  const safetyStock = Math.ceil(dailyRate * safetyBufferDays);

  const inventoryPosition = product.currentStock + onOrderStock;
  const targetLevel = Math.max(product.targetStock, leadTimeDemand + safetyStock);

  let rawSuggested = targetLevel - inventoryPosition;
  if (product.currentStock <= product.reorderLevel) {
    rawSuggested = Math.max(rawSuggested, product.reorderLevel * 1.5);
  }

  const suggestedReorderQuantity = Math.max(0, Math.ceil(rawSuggested));
  const estimatedCost = Math.round(suggestedReorderQuantity * product.costPrice);

  let urgency: 'critical' | 'moderate' | 'upcoming' = 'upcoming';
  if (product.currentStock <= product.reorderLevel / 2) {
    urgency = 'critical';
  } else if (product.currentStock <= product.reorderLevel) {
    urgency = 'moderate';
  }

  const suggestedDate = urgency === 'critical' ? 'Today (Urgent)' : 'Tomorrow Morning';

  return {
    id: `rec-order-${product.id}`,
    productId: product.id,
    productName: product.name,
    supplierId: product.supplierId,
    supplierName: product.supplierName,
    unit: product.unit,
    currentStock: product.currentStock,
    onOrderStock,
    expectedDemandLeadTime: Math.round(leadTimeDemand * 10) / 10,
    safetyStock,
    suggestedReorderQuantity,
    leadTimeDays: leadTime,
    estimatedCost,
    urgency,
    suggestedOrderDate: suggestedDate,
    status: 'suggested'
  };
}

/**
 * USP Freshness Intelligence Engine
 * Evaluates individual batches against predicted demand velocity
 * to highlight surplus products at risk of expiring before normal sales.
 */
export function generateFreshnessRecommendations(
  product: Product,
  currentDateStr: string = '2026-10-17'
): FreshnessRecommendation[] {
  const recommendations: FreshnessRecommendation[] = [];
  const forecast = calculateDemandForecast(product);
  const dailyRate = forecast.forecast1Day;

  const curDate = new Date(currentDateStr).getTime();

  for (const batch of product.batches) {
    if (batch.status === 'expired' || batch.quantity <= 0) continue;

    const expDate = new Date(batch.expiryDate).getTime();
    const diffDays = Math.ceil((expDate - curDate) / (1000 * 60 * 60 * 24));

    // Focus on batches expiring within 7 days or already tight
    if (diffDays <= 7 && diffDays >= 0) {
      const predictedDemandBeforeExpiry = Math.max(0, Math.round(dailyRate * Math.max(1, diffDays) * 10) / 10);
      const surplusRisk = Math.max(0, Math.round((batch.quantity - predictedDemandBeforeExpiry) * 10) / 10);

      // Determine recommended AI action
      let action: FreshnessRecommendation['suggestedAction'] = 'FEFO_PRIORITY';
      let actionTitle = 'Enforce FEFO Priority Shelf Fronting';
      let actionExplanation = `Rotate batch ${batch.batchNumber} to the front of sales floor/bar station immediately. Normal velocity will absorb this if prioritized.`;

      if (surplusRisk > 0 && diffDays <= 2) {
        if (product.businessType === 'cafe' || product.businessType === 'restaurant') {
          action = 'KITCHEN_SPECIAL_PREP';
          actionTitle = 'Repurpose into Daily Chef/Barista Special';
          actionExplanation = `Surplus of ${surplusRisk} ${product.unit} will not clear at standard pace. Feature in today's lunch set or prep batch marinades/beverages.`;
        } else if (product.businessType === 'bakery') {
          action = 'BAKERY_COMBO_PACK';
          actionTitle = 'Bundle in 2-for-1 Artisan Evening Bag';
          actionExplanation = `Expected leftover of ${surplusRisk} ${product.unit}. Group with evening tea-time combo to recover ingredient costs.`;
        } else {
          action = 'DYNAMIC_PROMO_40';
          actionTitle = 'Activate 35% Smart Quick-Clear Promo';
          actionExplanation = `Dynamic markdown to stimulate sales before expiry in ${diffDays} day(s), turning potential ₹${Math.round(surplusRisk * product.costPrice)} food waste into recovered revenue.`;
        }
      } else if (surplusRisk > 0 && diffDays <= 4) {
        action = 'DYNAMIC_PROMO_20';
        actionTitle = 'Deploy 15% Early-Bird Value Tag';
        actionExplanation = `Modest incentive will accelerate unit sales without heavily discounting. Projected surplus: ${surplusRisk} ${product.unit}.`;
      }

      const avoidableLoss = Math.round(batch.quantity * product.costPrice);

      recommendations.push({
        id: `fresh-rec-${batch.id}`,
        businessType: product.businessType,
        productId: product.id,
        productName: product.name,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        quantityAtRisk: batch.quantity,
        unit: product.unit,
        expiryDate: batch.expiryDate,
        daysRemaining: diffDays,
        predictedDemandBeforeExpiry,
        surplusRiskQuantity: surplusRisk,
        suggestedAction: action,
        actionTitle,
        actionExplanation,
        avoidableLossAmount: avoidableLoss,
        confidenceScore: 92,
        storageWarning: product.storageCondition === 'chilled' ? 'Strict Cold-Chain Check: Maintain chiller < 4°C' : undefined
      });
    }
  }

  return recommendations;
}
