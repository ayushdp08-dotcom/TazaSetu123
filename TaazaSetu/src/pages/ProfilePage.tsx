import React from 'react';
import {
  ShieldCheck,
  User,
  Phone,
  Key,
  Database,
  Lock,
  LogOut,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfilePage: React.FC = () => {
  const { profile, selectedBusinessType, logout } = useApp();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
          Profile & Security Center
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage your verified credentials, OTP session state, and security preferences.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
            {profile?.ownerName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">{profile?.ownerName || 'Operator'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                {profile?.phone || '+91 98200 12345'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                OTP Verified Session
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Authentication Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-neutral-400 block mb-0.5">Primary Phone</span>
              <span className="font-bold text-neutral-900">{profile?.phone || '+91 98200 12345'}</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-neutral-400 block mb-0.5">Verification Method</span>
              <span className="font-bold text-neutral-900">SMS OTP (+91 India Gateway)</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-neutral-400 block mb-0.5">Operating Tenant ID</span>
              <span className="font-mono text-neutral-900">{profile?.id || 'tenant_live_demo'}</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-neutral-400 block mb-0.5">Session Security</span>
              <span className="font-bold text-emerald-700">AES-256 Token Isolated</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
          <span className="text-xs text-neutral-500">Sign out of active management session</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
