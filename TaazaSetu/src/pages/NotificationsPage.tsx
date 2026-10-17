import React from 'react';
import {
  Bell,
  CalendarX,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, setCurrentRoute } = useApp();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Notification Centre & Real-Time Alerts
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Automated alerts for near-expiry batches, minimum stockout boundaries, and AI forecast changes.
          </p>
        </div>

        <button
          onClick={() => notifications.forEach((n) => markNotificationAsRead(n.id))}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-neutral-900">All caught up!</h3>
            <p className="text-xs text-neutral-500 mt-1">No active unread system or stock alerts.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isCritical = n.severity === 'critical';
            const isWarning = n.severity === 'warning';

            return (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationAsRead(n.id);
                  if (n.linkRoute) setCurrentRoute(n.linkRoute);
                }}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !n.read
                    ? 'border-emerald-300 shadow-xs bg-emerald-50/20'
                    : 'border-neutral-200/80 shadow-2xs hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical
                        ? 'bg-red-50 text-red-600'
                        : isWarning
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {isCritical ? (
                      <CalendarX className="w-4 h-4" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-neutral-900">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-neutral-400 mt-1 block">{n.timestamp}</span>
                  </div>
                </div>

                {n.linkRoute && (
                  <button className="text-xs font-bold text-emerald-700 hover:text-emerald-800 whitespace-nowrap self-center">
                    View →
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
