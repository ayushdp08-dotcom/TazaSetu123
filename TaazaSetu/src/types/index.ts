export type BusinessType = 'grocery' | 'cafe' | 'restaurant' | 'bakery';

export interface BusinessConfig {
  id: BusinessType;
  name: string;
  tagline: string;
  badge: string;
  icon: string;
  color: string;
  description: string;
  categories: string[];
  units: string[];
  sampleHighlights: string[];
}

export interface BusinessProfile {
  id: string;
  businessType: BusinessType;
  businessName: string;
  ownerName: string;
  phone: string;
  location: string;
  timezone: string;
  currency: string;
  defaultUnit: string;
  isDemoSession?: boolean;
}

export interface ProductBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  receivedDate: string;
  expiryDate: string;
  costPrice: number;
  initialQuantity: number;
  storageLocation?: string;
  status: 'active' | 'depleted' | 'expired' | 'discounted';
}

export interface RecipeIngredient {
  productId: string;
  productName: string;
  quantityNeeded: number;
  unit: string;
}

export interface Recipe {
  id: string;
  businessType: BusinessType;
  menuItemName: string;
  category: string;
  sellingPrice: number;
  preparationTimeMinutes: number;
  ingredients: RecipeIngredient[];
  marginPercent: number;
  popularityScore: number;
}

export interface Product {
  id: string;
  businessType: BusinessType;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  targetStock: number;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  supplierName: string;
  leadTimeDays: number;
  shelfLifeDays: number;
  storageCondition: 'ambient' | 'chilled' | 'frozen' | 'dry_dark';
  barcode?: string;
  brand?: string;
  imageUrl?: string;
  batches: ProductBatch[];
  historicalDailySales: number[]; // Last 14 days
  tags: string[];
  lastAuditDate?: string;
}

export interface ScannedProduct {
  id: string;
  businessType: BusinessType;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  sizeOrQuantity: string;
  unit: string;
  quantity: number;
  imageUrl?: string;
  expiryDate: string;
  scanDate: string;
  notes?: string;
  costPrice?: number;
  sellingPrice?: number;
  batchNumber?: string;
  source: 'database_match' | 'manual_entry';
}

export interface StockTransaction {
  id: string;
  businessType: BusinessType;
  productId: string;
  productName: string;
  type: 'stock_in' | 'sale_deduction' | 'recipe_deduction' | 'waste_writeoff' | 'adjustment';
  quantityChange: number;
  newBalance: number;
  timestamp: string;
  reason: string;
  batchId?: string;
  costImpact?: number;
}

export interface Supplier {
  id: string;
  businessType: BusinessType;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  leadTimeDays: number;
  reliabilityScore: number;
  categoriesSupplied: string[];
  activeOrdersCount: number;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  businessType: BusinessType;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'pending' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate?: string;
  notes?: string;
}

export interface WasteRecord {
  id: string;
  businessType: BusinessType;
  productId: string;
  productName: string;
  category: string;
  batchId: string;
  quantity: number;
  unit: string;
  costLost: number;
  reason: 'expired' | 'damaged' | 'prep_spoilage' | 'customer_return' | 'temperature_abuse';
  loggedDate: string;
  recordedBy: string;
}

export interface FreshnessRecommendation {
  id: string;
  businessType: BusinessType;
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  quantityAtRisk: number;
  unit: string;
  expiryDate: string;
  daysRemaining: number;
  predictedDemandBeforeExpiry: number;
  surplusRiskQuantity: number;
  suggestedAction: 'FEFO_PRIORITY' | 'DYNAMIC_PROMO_20' | 'DYNAMIC_PROMO_40' | 'KITCHEN_SPECIAL_PREP' | 'BAKERY_COMBO_PACK' | 'REDUCE_NEXT_ORDER';
  actionTitle: string;
  actionExplanation: string;
  avoidableLossAmount: number;
  confidenceScore: number;
  storageWarning?: string;
  applied?: boolean;
}

export interface DemandForecastItem {
  productId: string;
  productName: string;
  category: string;
  unit: string;
  currentStock: number;
  forecast1Day: number;
  forecast7Days: number;
  forecast30Days: number;
  stockoutRiskLevel: 'high' | 'medium' | 'low' | 'none';
  daysUntilStockout: number;
  confidence: number;
  confidenceRationale: string;
  growthTrend: number; // percentage
}

export interface SmartReorderItem {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  unit: string;
  currentStock: number;
  onOrderStock: number;
  expectedDemandLeadTime: number;
  safetyStock: number;
  suggestedReorderQuantity: number;
  leadTimeDays: number;
  estimatedCost: number;
  urgency: 'critical' | 'moderate' | 'upcoming';
  suggestedOrderDate: string;
  status: 'suggested' | 'approved' | 'ordered';
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'expiry' | 'low_stock' | 'reorder' | 'forecast' | 'system';
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  linkRoute?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  structuredData?: {
    type: 'expiry_alert' | 'reorder_summary' | 'waste_insight' | 'recipe_demand';
    items: Array<{ label: string; value: string | number; badge?: string }>;
  };
}
