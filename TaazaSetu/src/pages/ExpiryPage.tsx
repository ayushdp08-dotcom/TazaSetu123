import React, { useState } from 'react';
import {
  CalendarX,
  AlertTriangle,
  Clock,
  Trash2,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WasteRecord } from '../types';

export const ExpiryPage: React.FC = () => {
  const { products, recordFoodWaste, setCurrentRoute } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | '1day' | '3days' | '7days' | 'expired'>('all');
  const [wasteModalBatch, setWasteModalBatch] = useState<{
    productId: string;
    productName: string;
    batchId: string;
    batchNumber: string;
    qty: number;
    unit: string;
    cost: number;
  } | null>(null);

  const [wasteReason, setWasteReason] = useState<WasteRecord['reason']>('expired');
  const [wasteQty, setWasteQty] = useState(1);

  const today = new Date('2026-10-17').getTime();

  // Aggregate all active batches across products
  const allBatches = products.flatMap((p) =>
    p.batches.map((b) => {
      const expDate = new Date(b.expiryDate).getTime();
      const daysLeft = Math.ceil((expDate - today) / 86400000);
      return {
        ...b,
        productId: p.id,
        productName: p.name,
        category: p.category,
        unit: p.unit,
        daysLeft,
        productCost: p.costPrice
      };
    })
  );

  // Filter batches by urgency
  const filteredBatches = allBatches.filter((b) => {
    if (b.quantity <= 0) return false;
    if (activeTab === 'expired') return b.daysLeft < 0;
    if (activeTab === '1day') return b.daysLeft >= 0 && b.daysLeft <= 1;
    if (activeTab === '3days') return b.daysLeft >= 0 && b.daysLeft <= 3;
    if (activeTab === '7days') return b.daysLeft >= 0 && b.daysLeft <= 7;
    return true;
  });

  const expiredCount = allBatches.filter((b) => b.quantity > 0 && b.daysLeft < 0).length;
  const criticalCount = allBatches.filter((b) => b.quantity > 0 && b.daysLeft >= 0 && b.daysLeft <= 1).length;
  const warningCount = allBatches.filter((b) => b.quantity > 0 && b.daysLeft > 1 && b.daysLeft <= 3).length;

  const handleConfirmWasteWriteoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteModalBatch) return;
    recordFoodWaste(
      wasteModalBatch.productId,
      wasteModalBatch.batchId,
      wasteQty,
      wasteReason
    );
    setWasteModalBatch(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Expiry Calendar & FEFO Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Strict batch tracking ensures First-Expired-First-Out (FEFO) compliance. Zero expired items to customers.
          </p>
        </div>

        <button
          onClick={() => setCurrentRoute('freshness')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>Open Freshness Intelligence AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Expiry Urgency Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('expired')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'expired'
              ? 'bg-red-50 border-red-300 ring-2 ring-red-400'
              : 'bg-white border-neutral-200/80 shadow-2xs hover:border-red-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Already Expired</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          </div>
          <div className="text-2xl font-black text-neutral-900">{expiredCount}</div>
          <p className="text-[11px] text-red-600 mt-1 font-semibold">Immediate quarantine & write-off required</p>
        </div>

        <div
          onClick={() => setActiveTab('1day')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === '1day'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-neutral-200/80 shadow-2xs hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Expiring in ≤ 24 Hours</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-black text-neutral-900">{criticalCount}</div>
          <p className="text-[11px] text-amber-700 mt-1 font-semibold">FEFO shelf fronting / prep special</p>
        </div>

        <div
          onClick={() => setActiveTab('3days')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === '3days'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
              : 'bg-white border-neutral-200/80 shadow-2xs hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Expiring in 2–3 Days</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-black text-neutral-900">{warningCount}</div>
          <p className="text-[11px] text-emerald-800 mt-1 font-semibold">Active monitor queue</p>
        </div>
      </div>

      {/* Tab Filter bar */}
      <div className="bg-white p-2 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap gap-1.5">
        {[
          { id: 'all', label: `All Active Batches (${allBatches.filter((b) => b.quantity > 0).length})` },
          { id: '1day', label: `Expiring Today / Tomorrow (${criticalCount})` },
          { id: '3days', label: `Expiring within 3 Days (${warningCount})` },
          { id: '7days', label: 'Expiring this Week' },
          { id: 'expired', label: `Quarantine Expired (${expiredCount})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
            <tr>
              <th className="py-3 px-4">Batch Number</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Quantity at Risk</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4">Remaining Days</th>
              <th className="py-3 px-4">At-Risk Value</th>
              <th className="py-3 px-4 text-right">FEFO Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredBatches.map((b) => {
              const isPast = b.daysLeft < 0;
              const isCritical = b.daysLeft >= 0 && b.daysLeft <= 1;

              return (
                <tr key={b.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900">{b.batchNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-neutral-900">{b.productName}</div>
                    <div className="text-[10px] text-neutral-400">{b.category}</div>
                  </td>
                  <td className="py-3 px-4 font-extrabold text-neutral-900">
                    {b.quantity} {b.unit}
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-800">{b.expiryDate}</td>
                  <td className="py-3 px-4">
                    {isPast ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        Expired ({Math.abs(b.daysLeft)}d ago)
                      </span>
                    ) : isCritical ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {b.daysLeft === 0 ? 'Expires Today' : '1 Day Left'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {b.daysLeft} Days
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-900">
                    ₹{Math.round(b.quantity * b.productCost)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isPast ? (
                      <button
                        onClick={() => {
                          setWasteModalBatch({
                            productId: b.productId,
                            productName: b.productName,
                            batchId: b.id,
                            batchNumber: b.batchNumber,
                            qty: b.quantity,
                            unit: b.unit,
                            cost: b.productCost
                          });
                          setWasteQty(b.quantity);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors"
                      >
                        Quarantine & Log Waste
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentRoute('freshness')}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      >
                        Apply Freshness Action
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Waste Logging Modal */}
      {wasteModalBatch && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
              <Trash2 className="w-5 h-5" />
              <span>Record Food Waste Write-Off</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Write off expired stock to maintain accurate physical inventory records and food safety standards.
            </p>

            <form onSubmit={handleConfirmWasteWriteoff} className="space-y-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <div className="font-bold text-neutral-900">{wasteModalBatch.productName}</div>
                <div className="text-neutral-500">Batch: {wasteModalBatch.batchNumber}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Quantity to Discard ({wasteModalBatch.unit})
                </label>
                <input
                  type="number"
                  min="0.1"
                  max={wasteModalBatch.qty}
                  step="0.1"
                  required
                  value={wasteQty}
                  onChange={(e) => setWasteQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Reason for Waste</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-medium"
                >
                  <option value="expired">Past Best-Before / Expiry Date</option>
                  <option value="damaged">Packaging Damaged in Handling</option>
                  <option value="prep_spoilage">Kitchen Prep Trimming Spoilage</option>
                  <option value="temperature_abuse">Cold-Chain Temperature Deviation</option>
                </select>
              </div>

              <div className="p-2.5 bg-red-50 text-red-800 rounded-xl text-xs flex justify-between font-bold">
                <span>Calculated Financial Loss:</span>
                <span>₹{Math.round(wasteQty * wasteModalBatch.cost)}</span>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWasteModalBatch(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
                >
                  Confirm Waste Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
