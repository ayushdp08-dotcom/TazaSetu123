import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Percent,
  RefreshCw,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIGS } from '../data/initialData';

export const FreshnessPage: React.FC = () => {
  const {
    selectedBusinessType,
    products,
    getFreshnessRecommendations,
    applyFreshnessAction
  } = useApp();

  const config = BUSINESS_CONFIGS[selectedBusinessType];
  const recommendations = getFreshnessRecommendations();

  // Waste Prevention Simulator Interactive Parameters
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [demandUpliftPercent, setDemandUpliftPercent] = useState<number>(45);
  const [selectedSimProduct, setSelectedSimProduct] = useState<string>(
    recommendations[0]?.productId || products[0]?.id || ''
  );

  const activeRec = recommendations.find((r) => r.productId === selectedSimProduct) || recommendations[0];
  const targetProduct = products.find((p) => p.id === (activeRec?.productId || selectedSimProduct)) || products[0];

  // Simulation Computations
  const batchQtyAtRisk = activeRec ? activeRec.quantityAtRisk : 10;
  const unitCost = targetProduct ? targetProduct.costPrice : 50;
  const sellingPrice = targetProduct ? targetProduct.sellingPrice : 80;

  // Under current plan: standard baseline velocity
  const baselineSalesRemaining = activeRec ? activeRec.predictedDemandBeforeExpiry : 4;
  const currentUnsoldWasteQty = Math.max(0, batchQtyAtRisk - baselineSalesRemaining);
  const currentEstimatedWasteCost = Math.round(currentUnsoldWasteQty * unitCost);

  // Under proposed plan: demand uplift from dynamic promotional action or kitchen conversion
  const proposedSales = Math.min(batchQtyAtRisk, baselineSalesRemaining * (1 + demandUpliftPercent / 100));
  const proposedUnsoldWasteQty = Math.max(0, Math.round((batchQtyAtRisk - proposedSales) * 10) / 10);
  const proposedWasteCost = Math.round(proposedUnsoldWasteQty * unitCost);

  const estimatedSavedQty = Math.round((currentUnsoldWasteQty - proposedUnsoldWasteQty) * 10) / 10;
  const avoidedLossAmount = Math.max(0, currentEstimatedWasteCost - proposedWasteCost);

  const discountedSellingPrice = Math.round(sellingPrice * (1 - discountPercent / 100));
  const recoveredRevenue = Math.round(estimatedSavedQty * discountedSellingPrice);

  const handleApply = (recId: string) => {
    applyFreshnessAction(recId);
    alert('Freshness Intelligence recommendation approved! Logged to floor operations & smart discount tags.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & USP Explanation */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Signature USP: Freshness Intelligence AI</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Proactive Perishable Rescue & Waste Prevention
            </h1>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              Cross-references batch expiry dates, current physical stock, shelf-life velocity, and predicted demand to eliminate commercial food waste before it happens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-neutral-400 font-medium">Potential Waste Preventable</div>
              <div className="text-2xl font-black text-emerald-600">
                ₹{recommendations.reduce((sum, r) => sum + r.avoidableLossAmount, 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prioritized "Save These Products First" Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Prioritized "Save These Products First" Queue
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800">
              {recommendations.length} Active Batches At Risk
            </span>
          </div>
          <span className="text-xs text-neutral-500">FEFO Standard Enforced</span>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-neutral-900">Zero Critical Batch Expiry Risks</h3>
            <p className="text-xs text-neutral-500 mt-1">All current inventory batches have adequate demand coverage within shelf-life.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => {
              const isSelected = selectedSimProduct === rec.productId;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedSimProduct(rec.productId)}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-neutral-200/80 shadow-2xs hover:border-neutral-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Batch {rec.batchNumber}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-900 line-clamp-1">
                          {rec.productName}
                        </h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        rec.daysRemaining <= 1 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.daysRemaining <= 0 ? 'Expires Today' : `${rec.daysRemaining}d remaining`}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-neutral-600 my-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="flex justify-between">
                        <span>Quantity at Risk:</span>
                        <span className="font-bold text-neutral-900">{rec.quantityAtRisk} {rec.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Predicted Demand:</span>
                        <span className="font-medium text-neutral-700">{rec.predictedDemandBeforeExpiry} {rec.unit}</span>
                      </div>
                      <div className="flex justify-between text-red-600 font-semibold">
                        <span>Surplus Expiry Threat:</span>
                        <span>{rec.surplusRiskQuantity} {rec.unit}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 mb-4">
                      <div className="text-[11px] font-bold text-emerald-900 mb-0.5">
                        {rec.actionTitle}
                      </div>
                      <p className="text-[10px] text-emerald-800 leading-relaxed">
                        {rec.actionExplanation}
                      </p>
                    </div>

                    {rec.storageWarning && (
                      <div className="text-[10px] text-amber-700 font-medium mb-3 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>{rec.storageWarning}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-neutral-400">Avoidable Loss</div>
                      <div className="text-xs font-bold text-neutral-900">₹{rec.avoidableLossAmount}</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(rec.id);
                      }}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold bg-neutral-900 hover:bg-emerald-600 text-white transition-colors"
                    >
                      Apply Action
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Waste Prevention Simulator */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-neutral-900">
                Interactive Waste Prevention Simulator
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Adjust hypothetical demand elasticity and promotional parameters to simulate prevented food waste.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium">Selected Batch SKU:</span>
            <select
              value={selectedSimProduct}
              onChange={(e) => setSelectedSimProduct(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-neutral-900"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Slider Controls */}
          <div className="lg:col-span-5 space-y-5 bg-neutral-50/70 p-5 rounded-2xl border border-neutral-200/70">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Target Discount / Value Bundle
                </label>
                <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                  {discountPercent}% OFF
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={discountPercent}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDiscountPercent(val);
                  // Adjust anticipated demand uplift proportionally
                  setDemandUpliftPercent(Math.round(val * 1.5));
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>0% (Standard)</span>
                <span>30% (Recommended)</span>
                <span>60% (Clearance)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Hypothetical Demand Uplift
                </label>
                <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                  +{demandUpliftPercent}% Velocity
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={demandUpliftPercent}
                onChange={(e) => setDemandUpliftPercent(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Estimated increase in customer uptake driven by FEFO fronting & promotional tag.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
              <div className="flex justify-between">
                <span>Original Price:</span>
                <span className="font-semibold text-neutral-900">₹{sellingPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Simulated Price:</span>
                <span className="font-bold text-emerald-700">₹{discountedSellingPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Cost Basis:</span>
                <span className="text-neutral-500">₹{unitCost}</span>
              </div>
            </div>
          </div>

          {/* Before vs After Impact Comparison */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Without Freshness AI */}
              <div className="p-5 rounded-2xl border border-red-200 bg-red-50/30">
                <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1">
                  Status Quo (No Action)
                </div>
                <div className="text-2xl font-black text-neutral-900 mb-1">
                  {currentUnsoldWasteQty} {targetProduct?.unit || 'units'}
                </div>
                <div className="text-xs text-red-700 font-semibold mb-3">
                  Loss: ₹{currentEstimatedWasteCost}
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Product reaches expiry before regular baseline sales can clear the batch. Full batch cost lost to bin.
                </p>
              </div>

              {/* With Freshness AI */}
              <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50/50">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  Proposed AI Action
                </div>
                <div className="text-2xl font-black text-emerald-700 mb-1">
                  {proposedUnsoldWasteQty} {targetProduct?.unit || 'units'}
                </div>
                <div className="text-xs text-emerald-800 font-semibold mb-3">
                  Residual Waste: ₹{proposedWasteCost}
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  FEFO front-facing + dynamic promotion absorbs inventory before expiry date.
                </p>
              </div>
            </div>

            {/* Bottom Avoided Loss Highlight Banner */}
            <div className="p-4 rounded-xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-neutral-400 font-medium">Estimated Net Waste Avoided</div>
                <div className="text-xl font-black text-emerald-400">
                  ₹{avoidedLossAmount} Saved ({estimatedSavedQty} {targetProduct?.unit || 'units'})
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-neutral-400 font-medium">Recovered Revenue</div>
                <div className="text-base font-bold text-white">₹{recoveredRevenue}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible AI Disclaimer */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-start gap-2 text-[11px] text-neutral-500 leading-relaxed">
          <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> Predictions and estimated savings are probabilistic simulations derived from historical sales velocities and assumed promotional elasticities. Taaza Setu enforces strict food safety: expired products must never be sold or consumed.
          </span>
        </div>
      </div>
    </div>
  );
};
