import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Coins,
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIGS } from '../data/initialData';

export const OnboardingPage: React.FC = () => {
  const { selectedBusinessType, profile, completeOnboarding } = useApp();
  const config = BUSINESS_CONFIGS[selectedBusinessType];

  const [businessName, setBusinessName] = useState(profile?.businessName || '');
  const [ownerName, setOwnerName] = useState(profile?.ownerName || 'Aditya Shukla');
  const [location, setLocation] = useState('Bandra West, Mumbai, MH');
  const [timezone, setTimezone] = useState('IST (UTC+5:30)');
  const [currency, setCurrency] = useState('INR (₹)');
  const [defaultUnit, setDefaultUnit] = useState(config.units[0]);
  const [primarySupplier, setPrimarySupplier] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding({
      businessName: businessName.trim() || config.name,
      ownerName: ownerName.trim() || 'Manager',
      location,
      timezone,
      currency,
      defaultUnit
    });
  };

  return (
    <div className="min-h-screen bg-[#fafbfb] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-neutral-200/90 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Step 2 of 2: Setup Business Profile</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Configure Your {config.name}
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Customize your inventory units, currency, and location settings for AI forecasts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Business Legal / Trade Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Blue Tokai Roasters or Taaza Grocery"
                  className="block w-full px-3.5 py-2.5 text-sm bg-neutral-50/50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Owner / Manager Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="block w-full px-3.5 py-2.5 text-sm bg-neutral-50/50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Store City / Location
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full px-3.5 py-2.5 text-sm bg-neutral-50/50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="block w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="INR (₹)">INR (₹) - Rupee</option>
                  <option value="USD ($)">USD ($) - Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="block w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="IST (UTC+5:30)">IST (UTC+5:30)</option>
                  <option value="UTC">UTC (GMT)</option>
                  <option value="EST (UTC-5)">EST (New York)</option>
                  <option value="PST (UTC-8)">PST (San Francisco)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Default Unit
                </label>
                <select
                  value={defaultUnit}
                  onChange={(e) => setDefaultUnit(e.target.value)}
                  className="block w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold capitalize"
                >
                  {config.units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preloaded Demo Seed Notice */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Pre-loaded with Realistic {config.name} Data</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                We have initialized your account with tailored categories ({config.categories.slice(0, 3).join(', ')}...), active batches, suppliers, and 14 days of realistic consumption logs.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => completeOnboarding({})}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Skip & Use Defaults
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
              >
                <span>Launch Business Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
