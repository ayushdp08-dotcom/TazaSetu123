import React from 'react';
import {
  Bell,
  Search,
  Sparkles,
  Store,
  Coffee,
  UtensilsCrossed,
  Cake,
  Menu,
  ShieldCheck,
  Plus,
  ScanLine
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIGS } from '../data/initialData';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const {
    selectedBusinessType,
    setSelectedBusinessType,
    setCurrentRoute,
    profile,
    unreadNotificationCount
  } = useApp();

  const config = BUSINESS_CONFIGS[selectedBusinessType];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Context breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
          <span className="font-semibold text-neutral-900">{config.name}</span>
          <span>/</span>
          <span className="capitalize">{config.tagline}</span>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Business Selector Pill on desktop */}
        <div className="hidden md:flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200">
          {(['grocery', 'cafe', 'restaurant', 'bakery'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedBusinessType(type)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                selectedBusinessType === type
                  ? 'bg-white text-emerald-800 shadow-xs font-bold border border-neutral-200/50'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Scan Product Quick Action (Requirement 1) */}
        <button
          onClick={() => setCurrentRoute('scanner')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>Scan Product</span>
        </button>

        {/* AI Assistant Quick Pill */}
        <button
          onClick={() => setCurrentRoute('assistant')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Ask AI Copilot</span>
        </button>

        {/* Freshness Intelligence Quick Button */}
        <button
          onClick={() => setCurrentRoute('freshness')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-neutral-800 border border-neutral-200 text-xs font-semibold hover:bg-neutral-50 transition-colors shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Freshness USP</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setCurrentRoute('notifications')}
          className="relative p-2 text-neutral-500 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* Profile Avatar Pill */}
        <div
          onClick={() => setCurrentRoute('profile')}
          className="flex items-center gap-2 pl-2 cursor-pointer border-l border-neutral-200"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            {profile?.ownerName ? profile.ownerName.charAt(0).toUpperCase() : 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};
