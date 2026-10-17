import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Building2,
  Bell,
  Database,
  Lock,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIGS } from '../data/initialData';

export const SettingsPage: React.FC = () => {
  const { profile, selectedBusinessType, completeOnboarding } = useApp();
  const config = BUSINESS_CONFIGS[selectedBusinessType];

  const [bizName, setBizName] = useState(profile?.businessName || config.name);
  const [owner, setOwner] = useState(profile?.ownerName || 'Store Manager');
  const [location, setLocation] = useState(profile?.location || 'Mumbai, MH');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding({
      businessName: bizName,
      ownerName: owner,
      location
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleResetDemoData = () => {
    if (confirm('Reset demo inventory and transactions back to realistic seed state?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
          Business Settings & Multi-Tenant Configuration
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure business profile, inventory measurement preferences, and data privacy isolation.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Business settings updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
          General Business Information
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Business Name</label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Owner / Operator</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Business Vertical</label>
              <input
                type="text"
                disabled
                value={config.name}
                className="w-full px-3 py-2 text-xs bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-600 font-bold capitalize"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Security & Data Isolation Card */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tenant Data Isolation & Security</span>
        </h2>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Every query and algorithm execution is strictly partitioned by your business ID. Products, inventory batches, recipes, and supplier pricing from other accounts are cryptographically inaccessible.
        </p>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-neutral-900">Reset Demo Environment</div>
            <div className="text-[11px] text-neutral-500">Restore factory sample products and batch expiries</div>
          </div>
          <button
            onClick={handleResetDemoData}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
