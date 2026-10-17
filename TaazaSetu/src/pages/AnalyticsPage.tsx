import React from 'react';
import {
  BarChart3,
  TrendingDown,
  DollarSign,
  PieChart,
  Download,
  AlertOctagon,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnalyticsPage: React.FC = () => {
  const { wasteRecords, products, selectedBusinessType } = useApp();

  const totalWasteLoss = wasteRecords.reduce((sum, w) => sum + w.costLost, 0);
  const totalStockValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);

  // Waste reasons breakdown
  const wasteByReason: Record<string, number> = {};
  wasteRecords.forEach((w) => {
    wasteByReason[w.reason] = (wasteByReason[w.reason] || 0) + w.costLost;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Waste & Profit Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Evaluate loss prevention impact, food waste root causes, gross margin trends, and category loss.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting Analytics PDF Report...')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-neutral-500" />
          <span>Export Loss Report</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Total Logged Waste Cost
          </span>
          <div className="text-2xl font-black text-red-600 mt-1">
            ₹{totalWasteLoss.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Cumulative financial losses across all logged spoilage incidents.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Estimated Savings from Freshness AI
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ₹4,850
          </div>
          <p className="text-[11px] text-emerald-800 font-medium mt-2">
            Recovered value via early FEFO promotions & prep shifts.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Current Active Inventory Value
          </span>
          <div className="text-2xl font-black text-neutral-900 mt-1">
            ₹{totalStockValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Calculated at cost-price basis across active batches.
          </p>
        </div>
      </div>

      {/* Waste Incident Log Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200/80 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Detailed Food Waste & Spoilage Log
          </h2>
          <span className="text-xs text-neutral-500 font-medium">Compliance Audited</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
            <tr>
              <th className="py-3 px-4">Date Logged</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Quantity Discarded</th>
              <th className="py-3 px-4">Loss Amount</th>
              <th className="py-3 px-4">Root Cause Reason</th>
              <th className="py-3 px-4">Logged By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {wasteRecords.map((w) => (
              <tr key={w.id} className="hover:bg-neutral-50/70 transition-colors">
                <td className="py-3 px-4 text-neutral-500 font-medium">{w.loggedDate}</td>
                <td className="py-3 px-4 font-bold text-neutral-900">{w.productName}</td>
                <td className="py-3 px-4 text-neutral-600">{w.category}</td>
                <td className="py-3 px-4 font-semibold text-neutral-800">
                  {w.quantity} {w.unit}
                </td>
                <td className="py-3 px-4 font-extrabold text-red-600">₹{w.costLost}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 capitalize">
                    {w.reason.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-neutral-500">{w.recordedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
