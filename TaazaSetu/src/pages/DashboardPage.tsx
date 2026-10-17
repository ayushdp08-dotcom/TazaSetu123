import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CalendarX,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles,
  RotateCcw,
  Coffee,
  Store,
  UtensilsCrossed,
  Cake,
  CheckCircle2,
  ChevronRight,
  Flame,
  Clock,
  ShieldCheck,
  ScanLine,
  Database,
  Activity,
  RefreshCw,
  ShoppingCart,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIGS } from '../data/initialData';
import { apiService, DashboardMetricsResponse } from '../utils/apiService';

export const DashboardPage: React.FC = () => {
  const {
    selectedBusinessType,
    products,
    recipes,
    purchaseOrders,
    wasteRecords,
    setCurrentRoute,
    setActiveProductId,
    sellMenuItem,
    recordDirectSale,
    getFreshnessRecommendations,
    getReorderRecommendations
  } = useApp();

  const config = BUSINESS_CONFIGS[selectedBusinessType];

  const [serverMetrics, setServerMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [dbMode, setDbMode] = useState<string>('demo_mode_memory');

  const fetchLiveMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const res = await apiService.getDashboardMetrics(selectedBusinessType);
      if (res && res.success) {
        setServerMetrics(res.metrics);
        setDbMode(res.databaseMode || 'demo_mode_memory');
      }
    } catch (err: any) {
      console.warn('Backend metrics fetch failed, using computed local state:', err);
      setMetricsError('Server metrics offline. Showing real-time client state.');
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, [selectedBusinessType, products]);

  // Key Metric Calculations (fallback or client synced)
  const totalStockValue = serverMetrics ? serverMetrics.totalInventoryValue : products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderLevel);

  // Expiry counts across batches
  const now = new Date('2026-10-17').getTime();
  let expiringSoonCount = 0;
  let expiredCount = 0;

  products.forEach((p) => {
    p.batches.forEach((b) => {
      const exp = new Date(b.expiryDate).getTime();
      const diff = Math.ceil((exp - now) / 86400000);
      if (diff < 0) expiredCount++;
      else if (diff <= 3) expiringSoonCount++;
    });
  });

  const displayExpiringSoon = serverMetrics ? serverMetrics.expiringSoonCount : expiringSoonCount;
  const displayLowStock = serverMetrics ? serverMetrics.lowStockCount : lowStockProducts.length;

  const totalWasteLoss = wasteRecords.reduce((acc, w) => acc + w.costLost, 0);
  const freshnessRecs = getFreshnessRecommendations();
  const reorderRecs = getReorderRecommendations().filter((r) => r.suggestedReorderQuantity > 0);

  // Quick Sale Modal State for Direct POS
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleProductId, setSaleProductId] = useState<string>('');
  const [saleQty, setSaleQty] = useState<number | ''>(1);
  const [saleChannel, setSaleChannel] = useState('In-Store POS');
  const [saleFeedback, setSaleFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [saleSubmitting, setSaleSubmitting] = useState(false);

  // Quick POS / Production Action Handler (Records recipe sale and decrements stock)
  const handleQuickAction = async (recipeId: string) => {
    const res = sellMenuItem(recipeId, 1);
    if (!res.success) {
      alert(res.message);
    } else {
      // Refresh dashboard metrics
      fetchLiveMetrics();
    }
  };

  // Direct Product Sale Handler (Decrements stock via FEFO and syncs to backend)
  const handleQuickDirectSale = async (productId: string, quantity: number, channel = 'Direct Counter Sale') => {
    const res = await recordDirectSale(productId, quantity, channel);
    if (!res.success) {
      alert(res.message);
    } else {
      fetchLiveMetrics();
    }
    return res;
  };

  const handleSaleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === saleProductId);
    if (!prod) return;
    if (saleQty === '' || Number(saleQty) <= 0) {
      setSaleFeedback({ type: 'error', message: 'Quantity sold must be greater than zero.' });
      return;
    }
    if (Number(saleQty) > prod.currentStock) {
      setSaleFeedback({
        type: 'error',
        message: `Insufficient inventory! Available: ${prod.currentStock} ${prod.unit}. Requested: ${saleQty}. Negative stock is prevented.`
      });
      return;
    }

    setSaleSubmitting(true);
    const res = await recordDirectSale(prod.id, Number(saleQty), saleChannel);
    setSaleSubmitting(false);

    if (res.success) {
      setSaleFeedback({ type: 'success', message: res.message });
      fetchLiveMetrics();
      setTimeout(() => {
        setShowSaleModal(false);
        setSaleFeedback(null);
      }, 1200);
    } else {
      setSaleFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Business-Specific Role Context */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {config.badge}
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>{dbMode === 'mongodb' ? 'MongoDB Persistent' : 'Demo Mode (Local Persistence)'}</span>
            </span>
            <button
              onClick={fetchLiveMetrics}
              title="Refresh live metrics"
              className="p-1 text-neutral-400 hover:text-emerald-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${metricsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            {config.name} Operations Hub
          </h1>
          <p className="text-xs text-neutral-600 mt-1 max-w-xl">
            {config.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              if (products.length > 0) {
                setSaleProductId(products[0].id);
                setSaleQty(1);
                setSaleFeedback(null);
                setShowSaleModal(true);
              } else {
                alert('No products available to sell. Please add products first.');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
          <button
            onClick={() => setCurrentRoute('scanner')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <ScanLine className="w-4 h-4 text-emerald-400" />
            <span>Scan Product</span>
          </button>
          <button
            onClick={() => setCurrentRoute('freshness')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold shadow-2xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Freshness AI</span>
          </button>
          <button
            onClick={() => setCurrentRoute('inventory')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 text-xs font-bold shadow-2xs transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Manage Stock</span>
          </button>
        </div>
      </div>

      {/* 4 Core Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Value</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            ₹{totalStockValue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{products.length} Active SKUs tracked</span>
          </div>
        </div>

        <div
          onClick={() => setCurrentRoute('reorders')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {metricsLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
            ) : (
              displayLowStock
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700 font-semibold">
            <span>{reorderRecs.length} reorders recommended</span>
          </div>
        </div>

        <div
          onClick={() => setCurrentRoute('freshness')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-emerald-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Expiring ≤ 3 Days</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <CalendarX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {metricsLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
            ) : (
              displayExpiringSoon
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-600 font-semibold">
            <span>{freshnessRecs.length} FEFO action(s) active</span>
          </div>
        </div>

        <div
          onClick={() => setCurrentRoute('analytics')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-neutral-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Food Waste Loss</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            ₹{totalWasteLoss.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neutral-500 font-medium">
            <span>{wasteRecords.length} incidents logged</span>
          </div>
        </div>
      </div>

      {/* Business-Tailored Interactive Widget Row */}
      {selectedBusinessType === 'grocery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fast Moving vs Slow Moving */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">High-Turnover Perishables & Milk Rotations</h3>
                <p className="text-xs text-neutral-500">Monitor batch run-rates before next scheduled dairy delivery</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200/60">
                FEFO Priority
              </span>
            </div>

            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{p.name}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Stock: <span className="font-semibold text-neutral-800">{p.currentStock} {p.unit}</span> • Reorder Threshold: {p.reorderLevel} {p.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickDirectSale(p.id, 1, 'Grocery POS Quick Sale')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition-colors flex items-center gap-1"
                      title="Sell 1 unit & deduct stock via FEFO"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Sell 1x</span>
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.currentStock <= p.reorderLevel ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.currentStock <= p.reorderLevel ? 'Reorder Needed' : 'Healthy Stock'}
                    </span>
                    <button
                      onClick={() => {
                        setActiveProductId(p.id);
                        setCurrentRoute('inventory');
                      }}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Supplier Pending Deliveries */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Incoming Purchase Orders</h3>
              <p className="text-xs text-neutral-500 mb-4">Refrigerated trucks scheduled</p>

              <div className="space-y-3">
                {purchaseOrders.slice(0, 2).map((po) => (
                  <div key={po.id} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
                      <span>{po.orderNumber}</span>
                      <span className="text-emerald-700">₹{po.totalAmount}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">{po.supplierName}</p>
                    <div className="mt-2 text-[10px] text-neutral-600 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>Delivery: {po.expectedDeliveryDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentRoute('purchase_orders')}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              View All Purchase Orders
            </button>
          </div>
        </div>
      )}

      {selectedBusinessType === 'cafe' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* POS Recipe Simulation for Café */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Barista POS Recipe Deduction</h3>
                <p className="text-xs text-neutral-500">
                  Simulate drink sales: automatically decrements fresh milk, roast beans & takeaway cups via FEFO
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
                Interactive POS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {recipes.map((rec) => (
                <div key={rec.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-neutral-900">{rec.menuItemName}</span>
                      <span className="text-xs font-bold text-emerald-700">₹{rec.sellingPrice}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-2">{rec.category} • Margin: {rec.marginPercent}%</p>
                    <div className="space-y-1 text-[11px] text-neutral-600 mb-3 bg-white p-2 rounded-lg border border-neutral-100">
                      {rec.ingredients.map((ing, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{ing.productName.slice(0, 22)}...</span>
                          <span className="font-semibold">{ing.quantityNeeded} {ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickAction(rec.id)}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Sell 1x (Auto-Deduct Stock)</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time test: Click "Sell 1x" to watch raw milk and espresso bean stocks decrement live in inventory!</span>
            </div>
          </div>

          {/* Short-Life Milk Alert Widget */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-red-600 mb-1">
                <Flame className="w-4 h-4" />
                <span>Short-Shelf-Life Milk Monitor</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 mb-3">Fresh Dairy Cold-Chain</h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-red-100 bg-red-50/50">
                  <div className="text-xs font-bold text-neutral-900">Barista Whole Milk (LOT-BAR-801)</div>
                  <div className="text-[11px] text-neutral-600 mt-1">12 Litres expiring in 24 hours</div>
                  <div className="mt-2 text-[10px] text-red-700 font-bold bg-white px-2 py-1 rounded inline-block border border-red-200">
                    Action: Steam for flat whites or prep cold brews
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                  <div className="text-xs font-bold text-neutral-900">French Croissants Display</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">18 pieces remaining from morning bake</div>
                  <div className="mt-2 text-[10px] text-emerald-700 font-semibold">
                    Expected day clearance: 100% by 6 PM
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentRoute('freshness')}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              Simulate Waste Prevention
            </button>
          </div>
        </div>
      )}

      {selectedBusinessType === 'restaurant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Restaurant Kitchen Prep & Recipe Hub */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Chef's Daily Kitchen Prep & Ingredient Burn</h3>
                <p className="text-xs text-neutral-500">Deduct raw chicken breast, mozzarella & basil directly from dinner service orders</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
                Prep & Service
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {recipes.map((rec) => (
                <div key={rec.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-neutral-900">{rec.menuItemName}</span>
                      <span className="text-xs font-bold text-emerald-700">₹{rec.sellingPrice}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-2">Prep Time: {rec.preparationTimeMinutes}m • Food Cost Margin: {rec.marginPercent}%</p>
                    <div className="space-y-1 text-[11px] text-neutral-600 mb-3 bg-white p-2 rounded-lg border border-neutral-100">
                      {rec.ingredients.map((ing, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{ing.productName.slice(0, 20)}...</span>
                          <span className="font-semibold">{ing.quantityNeeded} {ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickAction(rec.id)}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Cook & Deduct 1 Portion</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
              <span>Tomorrow's Expected Pizza Demand: <strong>38 Margherita pies</strong></span>
              <span className="font-semibold text-emerald-700">Required Mozzarella: ~6.08 kg</span>
            </div>
          </div>

          {/* Walk-in Cold Storage Status */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Walk-in Cold Storage</h3>
              <p className="text-xs text-neutral-500 mb-3">Meat & Herb Crisper Temperature Zones</p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-neutral-100 bg-neutral-50">
                  <div className="flex justify-between items-center text-xs font-bold text-neutral-900">
                    <span>Meat Chiller Box 1</span>
                    <span className="text-emerald-700">2.4°C (Safe)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Chicken breast: 18.5 kg in stock</p>
                </div>

                <div className="p-3 rounded-xl border border-neutral-100 bg-neutral-50">
                  <div className="flex justify-between items-center text-xs font-bold text-neutral-900">
                    <span>Herb Crisper Bin 4</span>
                    <span className="text-emerald-700">4.1°C (Safe)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Basil: 450g (Batch LOT-BAS-11)</p>
                </div>

                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50">
                  <div className="flex justify-between items-center text-xs font-bold text-amber-900">
                    <span>Mozzarella Stock</span>
                    <span className="text-amber-800 font-extrabold">9 kg left</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1">Below safety margin for weekend bookings</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentRoute('reorders')}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
            >
              Generate Restaurant PO
            </button>
          </div>
        </div>
      )}

      {selectedBusinessType === 'bakery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bakery Production & Batch Yields */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Daily Oven Production & Conversion</h3>
                <p className="text-xs text-neutral-500">Transform raw flour and butter into daily fresh sourdough loaves</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
                Oven Batching
              </span>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black text-neutral-900">Oven Batch: Artisan Sourdough (10 Loaves)</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Consumes 5.5 kg Bread Flour Type 55</div>
                <div className="mt-2 text-xs font-bold text-emerald-700">Batch Value: ₹1,600 (Revenue) • Cost: ₹286</div>
              </div>
              <button
                onClick={() => handleQuickAction('rec-5')}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
              >
                <Cake className="w-4 h-4" />
                <span>Bake Batch & Convert</span>
              </button>
            </div>

            {/* Shelf-Life Alert for Baked Goods */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 border-b border-neutral-200">
                Finished Breads on Display (Strict 24-48h Shelf Life)
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">Artisan Country Sourdough Loaf</span>
                  <span className="text-neutral-600">24 loaves remaining (Batch OVEN-SDR-17A)</span>
                  <span className="text-red-600 font-bold">Expires: Tomorrow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tomorrow's Baking Recommendation */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-emerald-700 mb-1">
                AI Morning Oven Schedule
              </div>
              <h3 className="text-sm font-bold text-neutral-900 mb-3">Predicted Bread Demand</h3>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 mb-4">
                <div className="font-bold mb-1">Tomorrow's Target: 34 Loaves</div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Considering existing 24 loaves and customer pickup curves, recommend baking <strong>2 batches (20 loaves)</strong> at 5:00 AM.
                </p>
              </div>

              <div className="text-xs space-y-1.5 text-neutral-600">
                <div className="flex justify-between">
                  <span>Flour Available:</span>
                  <span className="font-bold text-neutral-900">140 kg (Sufficient)</span>
                </div>
                <div className="flex justify-between">
                  <span>Pastry Butter:</span>
                  <span className="font-bold text-neutral-900">32 kg</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentRoute('freshness')}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              Freshness Intelligence Advisor
            </button>
          </div>
        </div>
      )}

      {/* Freshness Intelligence Highlights Bar */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900">Freshness Intelligence AI Engine</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                Signature USP
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Interactive waste prevention simulator active with {freshnessRecs.length} batch-level recommendations.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentRoute('freshness')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-emerald-600 transition-colors shrink-0"
        >
          Open Waste Prevention Simulator
        </button>
      </div>

      {/* QUICK SALE MODAL */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Record Sales Order</h3>
                  <p className="text-xs text-neutral-500">Auto-decrements inventory stock using FEFO batch rules</p>
                </div>
              </div>
              <button onClick={() => setShowSaleModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {saleFeedback && (
              <div
                className={`mb-3 p-3 rounded-xl text-xs font-medium ${
                  saleFeedback.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}
              >
                {saleFeedback.message}
              </div>
            )}

            <form onSubmit={handleSaleModalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Select Product *</label>
                <select
                  value={saleProductId}
                  onChange={(e) => {
                    setSaleProductId(e.target.value);
                    setSaleFeedback(null);
                  }}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.currentStock} {p.unit} in stock - ₹{p.sellingPrice})
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const selectedProd = products.find(p => p.id === saleProductId);
                if (!selectedProd) return null;
                const totalRev = saleQty === '' ? 0 : Math.round(Number(saleQty) * selectedProd.sellingPrice);

                return (
                  <>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Available Stock:</span>
                        <span className="font-bold text-neutral-900">{selectedProd.currentStock} {selectedProd.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Unit Selling Price:</span>
                        <span className="font-bold text-emerald-700">₹{selectedProd.sellingPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Safety Threshold:</span>
                        <span className="font-medium text-neutral-600">{selectedProd.reorderLevel} {selectedProd.unit}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Quantity to Sell ({selectedProd.unit}) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProd.currentStock}
                        required
                        value={saleQty}
                        onChange={(e) => setSaleQty(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Sales Channel</label>
                      <select
                        value={saleChannel}
                        onChange={(e) => setSaleChannel(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white"
                      >
                        <option value="In-Store POS">In-Store Register / POS</option>
                        <option value="Online Delivery">Online Delivery App</option>
                        <option value="Takeaway Counter">Takeaway Counter</option>
                        <option value="B2B Wholesale">B2B Wholesale</option>
                      </select>
                    </div>

                    <div className="pt-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-900 font-semibold">Total Sale Revenue:</span>
                      <span className="font-black text-emerald-800 text-sm">₹{totalRev.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                );
              })()}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saleSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {saleSubmitting ? 'Recording...' : 'Confirm Sale & Deduct Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
