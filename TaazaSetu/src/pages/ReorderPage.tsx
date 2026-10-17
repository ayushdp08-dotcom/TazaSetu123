import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SmartReorderItem } from '../types';

export const ReorderPage: React.FC = () => {
  const { getReorderRecommendations, createPurchaseOrder, setCurrentRoute } = useApp();
  const recommendations = getReorderRecommendations();

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    recommendations.forEach((r) => {
      map[r.productId] = r.suggestedReorderQuantity;
    });
    return map;
  });

  const handleQtyChange = (productId: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const handleCreatePOFromReorder = (item: SmartReorderItem) => {
    const orderQty = quantities[item.productId] ?? item.suggestedReorderQuantity;
    if (orderQty <= 0) {
      alert('Order quantity must be greater than zero.');
      return;
    }

    createPurchaseOrder({
      supplierId: item.supplierId,
      supplierName: item.supplierName,
      status: 'pending',
      items: [
        {
          productId: item.productId,
          productName: item.productName,
          quantity: orderQty,
          unit: item.unit,
          unitCost: Math.round(item.estimatedCost / (item.suggestedReorderQuantity || 1)),
          totalCost: Math.round(orderQty * (item.estimatedCost / (item.suggestedReorderQuantity || 1)))
        }
      ],
      totalAmount: Math.round(orderQty * (item.estimatedCost / (item.suggestedReorderQuantity || 1))),
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + (item.leadTimeDays || 2) * 86400000).toISOString().split('T')[0],
      notes: `Generated via Smart Reorder AI with ${item.leadTimeDays}-day lead time buffer.`
    });

    alert(`Purchase Order drafted & submitted to ${item.supplierName}!`);
    setCurrentRoute('purchase_orders');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transparent Inventory Reordering Logic</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Smart Purchase Reorders
            </h1>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              Formula: <code>Suggested = Max(0, [Lead Time Demand + Safety Stock] - [Current Stock + On-Order Stock])</code>. Edit quantities before converting into vendor purchase orders.
            </p>
          </div>

          <button
            onClick={() => setCurrentRoute('purchase_orders')}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors self-start md:self-auto"
          >
            View Existing POs
          </button>
        </div>
      </div>

      {/* Reorder Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
            <tr>
              <th className="py-3 px-4">Item & Preferred Supplier</th>
              <th className="py-3 px-4">Current Stock</th>
              <th className="py-3 px-4">Lead Time</th>
              <th className="py-3 px-4">Safety Stock Buffer</th>
              <th className="py-3 px-4">Recommended Qty</th>
              <th className="py-3 px-4">Est. Cost</th>
              <th className="py-3 px-4">Urgency</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {recommendations.map((r) => {
              const currentInputQty = quantities[r.productId] ?? r.suggestedReorderQuantity;
              const isUrgent = r.urgency === 'critical';

              return (
                <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-900">{r.productName}</div>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Truck className="w-3 h-3" />
                      <span>{r.supplierName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-900">
                    {r.currentStock} {r.unit}
                    {r.onOrderStock > 0 && (
                      <div className="text-[10px] text-emerald-700">+{r.onOrderStock} on order</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 font-medium">{r.leadTimeDays} Day(s)</td>
                  <td className="py-3.5 px-4 text-neutral-600">{r.safetyStock} {r.unit}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={currentInputQty}
                        onChange={(e) => handleQtyChange(r.productId, Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs border border-neutral-300 rounded-lg font-bold text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-neutral-500">{r.unit}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900">₹{r.estimatedCost}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isUrgent
                        ? 'bg-red-100 text-red-700'
                        : r.urgency === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {r.urgency.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleCreatePOFromReorder(r)}
                      disabled={currentInputQty <= 0}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 transition-colors shadow-2xs"
                    >
                      Draft Purchase Order
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
