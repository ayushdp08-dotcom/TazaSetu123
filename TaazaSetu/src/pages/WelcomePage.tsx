import React, { useState } from 'react';
import {
  Store,
  Coffee,
  UtensilsCrossed,
  Cake,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Boxes,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusinessType } from '../types';
import { BUSINESS_CONFIGS } from '../data/initialData';

export const WelcomePage: React.FC = () => {
  const { setSelectedBusinessType, setCurrentRoute } = useApp();
  const [hoveredCard, setHoveredCard] = useState<BusinessType | null>(null);

  const handleSelectBusiness = (type: BusinessType) => {
    setSelectedBusinessType(type);
    setCurrentRoute('login');
  };

  const businessCards = [
    {
      type: 'grocery' as BusinessType,
      icon: Store,
      title: 'Grocery & Supermarket',
      desc: 'Packaged goods, dairy, fresh produce, beverages & household essentials.',
      highlights: ['Batch-wise expiry', 'FEFO stock rotation', 'High-speed SKU tracker'],
      tag: 'Retail & FMCG'
    },
    {
      type: 'cafe' as BusinessType,
      icon: Coffee,
      title: 'Café & Beverage Bar',
      desc: 'Coffee beans, milks, syrups, cups, lids, snacks & fresh bakery items.',
      highlights: ['Recipe-based milk deduction', 'Morning rush forecasting', 'Short-shelf-life dairy'],
      tag: 'Beverage & QSR'
    },
    {
      type: 'restaurant' as BusinessType,
      icon: UtensilsCrossed,
      title: 'Bistro & Restaurant',
      desc: 'Raw proteins, fresh produce, cooking oils, sauces, prepped kitchen stock.',
      highlights: ['Kitchen prep forecasts', 'Recipe ingredient yields', 'Walk-in cold storage'],
      tag: 'Full Service Kitchen'
    },
    {
      type: 'bakery' as BusinessType,
      icon: Cake,
      title: 'Artisan Bakery',
      desc: 'Flours, sugars, butter, chocolates, yeast & day-shelf-life oven bakes.',
      highlights: ['Bake batch conversion', 'Day-shelf-life monitoring', 'Oven schedule planning'],
      tag: 'Baking & Production'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafbfb] text-neutral-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-neutral-900">
              Taaza Setu <span className="text-emerald-600 text-sm font-black px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Multi-Business Ready</span>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-Powered Commercial Food & Retail Inventory</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15] mb-5">
            Smarter Inventory.{' '}
            <span className="text-emerald-600">Fresher Products.</span>{' '}
            Better Profits.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Your AI-powered inventory partner for reducing food waste, preventing stockouts, forecasting demand, and growing your bottom line.
          </p>
        </div>

        {/* 4 Selectable Business Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {businessCards.map((card) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === card.type;

            return (
              <div
                key={card.type}
                onMouseEnter={() => setHoveredCard(card.type)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isHovered
                    ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 -translate-y-1'
                    : 'border-neutral-200/80 shadow-xs hover:border-neutral-300'
                }`}
                onClick={() => handleSelectBusiness(card.type)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-neutral-500 px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200/70">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                    {card.desc}
                  </p>

                  <div className="space-y-1.5 mb-6 pt-3 border-t border-neutral-100">
                    {card.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectBusiness(card.type);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-neutral-900 text-white group-hover:bg-emerald-600 shadow-sm"
                >
                  <span>Select & Continue</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Pill Highlights */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs">
            <Sparkles className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-neutral-900">Freshness Intelligence</div>
            <div className="text-[11px] text-neutral-500">USP AI waste simulator</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs">
            <CalendarCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-neutral-900">Batch-Wise FEFO</div>
            <div className="text-[11px] text-neutral-500">Zero expired stock sold</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs">
            <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-neutral-900">Transparent Forecast</div>
            <div className="text-[11px] text-neutral-500">1, 7 & 30-day demand</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs">
            <RotateCcw className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-neutral-900">Smart Reorder POs</div>
            <div className="text-[11px] text-neutral-500">Lead-time safety calculations</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-neutral-200/70 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 Taaza Setu. Designed for modern commercial hospitality & retail businesses.</p>
        <div className="flex items-center gap-4 text-neutral-500">
          <span>Pure White Theme</span>
          <span>•</span>
          <span>INR Currency Native (₹)</span>
          <span>•</span>
          <span>FEFO Standard Compliance</span>
        </div>
      </footer>
    </div>
  );
};
