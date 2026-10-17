import React, { useState } from 'react';
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SuppliersPage: React.FC = () => {
  const { suppliers } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Suppliers Directory & Lead Times
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Verified B2B suppliers, catalogue categories, delivery lead times, and fulfillment reliability scores.
          </p>
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[11px] font-bold border border-emerald-200">
                  <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  <span>{sup.reliabilityScore}% On-Time</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-neutral-900 mb-1">{sup.name}</h3>
              <p className="text-xs text-neutral-500 mb-4">Contact: {sup.contactPerson}</p>

              <div className="space-y-2 text-xs text-neutral-600 pt-3 border-t border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="font-semibold text-neutral-800">Lead Time: {sup.leadTimeDays} Days</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {sup.categoriesSupplied.map((cat, i) => (
                  <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px] font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Active Orders: <strong>{sup.activeOrdersCount}</strong></span>
              <button className="text-emerald-700 hover:text-emerald-800 font-bold">
                View Catalogue →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
