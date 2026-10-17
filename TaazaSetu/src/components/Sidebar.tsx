import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  CalendarX,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Truck,
  FileSpreadsheet,
  BarChart3,
  MessageSquareCode,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  UtensilsCrossed,
  Coffee,
  Store,
  Cake,
  Menu,
  X,
  Plus,
  ScanLine
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIGS } from '../data/initialData';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    currentRoute,
    setCurrentRoute,
    selectedBusinessType,
    setSelectedBusinessType,
    profile,
    logout,
    unreadNotificationCount
  } = useApp();

  const config = BUSINESS_CONFIGS[selectedBusinessType];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Barcode Scanner', icon: ScanLine, badge: 'New' },
    { id: 'freshness', label: 'Freshness AI (USP)', icon: Sparkles, badge: 'Smart' },
    { id: 'inventory', label: 'Inventory & Batches', icon: Boxes },
    { id: 'expiry', label: 'Expiry Calendar', icon: CalendarX },
    { id: 'recipes', label: selectedBusinessType === 'cafe' ? 'Drink Recipes & POS' : selectedBusinessType === 'restaurant' ? 'Menu Recipes & Prep' : selectedBusinessType === 'bakery' ? 'Oven Batch Recipes' : 'POS Quick Register', icon: UtensilsCrossed },
    { id: 'forecast', label: 'AI Demand Forecast', icon: TrendingUp },
    { id: 'reorders', label: 'Smart Reordering', icon: RotateCcw },
    { id: 'suppliers', label: 'Suppliers Directory', icon: Truck },
    { id: 'purchase_orders', label: 'Purchase Orders', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Waste & Profit Analytics', icon: BarChart3 },
    { id: 'assistant', label: 'AI Business Assistant', icon: MessageSquareCode, badge: 'Live' },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotificationCount },
    { id: 'settings', label: 'Business Settings', icon: Settings },
    { id: 'profile', label: 'Profile & Security', icon: ShieldCheck }
  ];

  const getBusinessIcon = () => {
    switch (selectedBusinessType) {
      case 'grocery': return <Store className="w-5 h-5 text-emerald-600" />;
      case 'cafe': return <Coffee className="w-5 h-5 text-emerald-600" />;
      case 'restaurant': return <UtensilsCrossed className="w-5 h-5 text-emerald-600" />;
      case 'bakery': return <Cake className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-neutral-100 flex items-center justify-between">
          <div
            onClick={() => {
              setCurrentRoute('dashboard');
              setMobileOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
                Taaza Setu <span className="text-emerald-600 font-extrabold text-xs px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/60">AI</span>
              </span>
              <p className="text-[10px] text-neutral-500 font-medium -mt-0.5">Inventory Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Selector Pill */}
        <div className="p-3 mx-3 my-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Active Business</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">Demo Ready</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-lg border border-neutral-200 shadow-2xs">
              {getBusinessIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-neutral-900 truncate">
                {profile?.businessName || config.name}
              </div>
              <div className="text-[11px] text-neutral-500 capitalize">{config.name}</div>
            </div>
          </div>

          {/* Quick Business Switcher Dropdown */}
          <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">Switch Type:</span>
            <div className="flex gap-1">
              {(['grocery', 'cafe', 'restaurant', 'bakery'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedBusinessType(t)}
                  title={`Switch to ${t}`}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    selectedBusinessType === t
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {t[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentRoute(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/70 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-700' : 'text-neutral-400 group-hover:text-neutral-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-600 text-white">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-500 text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-neutral-100 bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700">
                {profile?.ownerName ? profile.ownerName.slice(0, 2).toUpperCase() : 'SO'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-900 truncate">
                  {profile?.ownerName || 'Store Manager'}
                </p>
                <p className="text-[10px] text-neutral-500 truncate">{profile?.phone || '+91 98200 11000'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
