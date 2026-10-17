import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  PackageCheck,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseOrder } from '../types';

export const PurchaseOrdersPage: React.FC = () => {
  const { purchaseOrders, markPurchaseOrderReceived, suppliers, products, createPurchaseOrder } = useApp();

  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [orderQty, setOrderQty] = useState(20);
  const [notes, setNotes] = useState('Standard morning delivery');

  const handleMarkReceived = (poId: string) => {
    markPurchaseOrderReceived(poId);
    alert('Purchase Order marked as RECEIVED! Inventory stock and batches have been auto-updated.');
  };

  const handleCreateNewPO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const prod = products.find((p) => p.id === selectedProductId) || products[0];

    const totalCost = orderQty * prod.costPrice;

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      status: 'pending',
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: orderQty,
          unit: prod.unit,
          unitCost: prod.costPrice,
          totalCost
        }
      ],
      totalAmount: totalCost,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + sup.leadTimeDays * 86400000).toISOString().split('T')[0],
      notes
    });

    setShowNewPOModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Purchase Orders & Vendor Shipments
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track pending supplier orders. When received, inventory counts and fresh batches are automatically credited.
          </p>
        </div>

        <button
          onClick={() => setShowNewPOModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Purchase Order</span>
        </button>
      </div>

      {/* PO List */}
      <div className="space-y-4">
        {purchaseOrders.map((po) => {
          const isReceived = po.status === 'received';

          return (
            <div
              key={po.id}
              className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-neutral-900">{po.orderNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isReceived ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {po.status}
                  </span>
                  <span className="text-xs text-neutral-400">•</span>
                  <span className="text-xs font-semibold text-neutral-600">{po.supplierName}</span>
                </div>

                <div className="space-y-1">
                  {po.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-neutral-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{item.quantity} {item.unit} × {item.productName}</span>
                      <span className="text-neutral-400 font-mono">(₹{item.totalCost})</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-neutral-400 pt-1">
                  <span>Ordered: {po.orderDate}</span>
                  <span>Expected Delivery: {po.expectedDeliveryDate}</span>
                  {po.receivedDate && <span className="text-emerald-700 font-medium">Received: {po.receivedDate}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right mr-2">
                  <div className="text-[10px] text-neutral-400 font-medium uppercase">Order Total</div>
                  <div className="text-lg font-black text-neutral-900">₹{po.totalAmount}</div>
                </div>

                {!isReceived ? (
                  <button
                    onClick={() => handleMarkReceived(po.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors shrink-0"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Mark Stock Received</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Batches Credited</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal New PO */}
      {showNewPOModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Create Vendor Purchase Order</h3>
            <p className="text-xs text-neutral-500 mb-4">Draft PO to replenish stock via approved supplier directory.</p>
            <form onSubmit={handleCreateNewPO} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Select Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.leadTimeDays}d lead time)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Select Product to Reorder</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={orderQty}
                  onChange={(e) => setOrderQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Order Dispatch Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPOModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Confirm & Submit PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
