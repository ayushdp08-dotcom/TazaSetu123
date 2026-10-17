import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  Boxes,
  ArrowRight,
  ShieldAlert,
  Flame,
  Leaf
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService, AIForecastResponse } from '../utils/apiService';

export const ForecastPage: React.FC = () => {
  const { products, getForecasts, setCurrentRoute, selectedBusinessType } = useApp();

  const [aiData, setAiData] = useState<AIForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAIForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getAIForecast(selectedBusinessType);
      if (res && res.success) {
        setAiData(res);
      } else {
        setError('Could not reach backend forecast endpoint. Showing local algorithmic fallback.');
      }
    } catch (err: any) {
      console.warn('AI Forecast fetch failed:', err);
      setError('Backend service offline or unreachable. Displaying local run-rate models.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIForecast();
  }, [selectedBusinessType]);

  // Algorithmic local fallback
  const localForecasts = getForecasts();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Gemini AI Demand Forecasting</span>
              </span>
              {aiData && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  aiData.isDemoMode
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {aiData.isDemoMode ? 'Demo Mode (Calculated Estimates)' : aiData.aiModel || 'Live Gemini Model'}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Predictive Demand Models & Waste Reduction
            </h1>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              Demand estimates, restocking recommendations, overstock alerts and food waste prevention powered by Google Gemini API (@google/genai SDK) via backend integration.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={fetchAIForecast}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Re-Analyze'}</span>
            </button>
            <button
              onClick={() => setCurrentRoute('reorders')}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
            >
              Smart Reorders
            </button>
          </div>
        </div>
      </div>

      {/* Demo Mode or Error Notice */}
      {aiData?.isDemoMode && (
        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-amber-900">Demo Mode Active — Transparent Estimation Notice</div>
            <div className="text-amber-800 mt-0.5">
              {aiData.notice || 'GEMINI_API_KEY is not configured in backend server/.env. Forecasts are calculated from observed 14-day demo consumption velocities. Historical sales data is not fabricated.'}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-red-900">Backend Communication Notice</div>
            <div className="text-red-700 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* AI Executive Summary Card */}
      {aiData?.summary && (
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/90 shadow-2xs bg-gradient-to-r from-emerald-50/40 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              AI Inventory Executive Summary
            </h3>
          </div>
          <p className="text-xs text-neutral-800 leading-relaxed font-medium">
            "{aiData.summary}"
          </p>
        </div>
      )}

      {/* Forecast Cards Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200/80 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            AI Demand Forecast Horizon & Restocking Intelligence
          </h2>
          <span className="text-xs text-neutral-500 font-medium">
            {aiData?.forecasts ? `${aiData.forecasts.length} Products Evaluated` : 'Algorithmic Estimates'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <div className="text-sm font-bold text-neutral-900">Consulting AI Forecasting Engine...</div>
            <div className="text-xs text-neutral-500 mt-1">
              Analyzing consumption velocity curves, lead times, and batch expiration horizons.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">24h Demand</th>
                  <th className="py-3 px-4">7-Day Demand</th>
                  <th className="py-3 px-4">Days to Stockout</th>
                  <th className="py-3 px-4">Stockout Risk</th>
                  <th className="py-3 px-4">AI Restock Recommendation</th>
                  <th className="py-3 px-4">Food Waste / Overstock Prevention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {aiData?.forecasts && aiData.forecasts.length > 0 ? (
                  aiData.forecasts.map((f: any) => {
                    const isHigh = f.stockoutRisk === 'high';
                    const isMed = f.stockoutRisk === 'medium';

                    return (
                      <tr key={f.productId} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-neutral-900">{f.productName}</div>
                          <div className="text-[10px] text-neutral-400">{f.category}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-900">
                          {f.currentStock} {f.unit}
                          <div className="text-[10px] text-neutral-400">Reorder at: {f.reorderLevel}</div>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                          ~{f.forecast1Day} {f.unit}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-800">
                          ~{f.forecast7Days} {f.unit}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-neutral-900">{f.daysToStockout} Days</span>
                          <div className="text-[10px] text-neutral-400">Estimated run-rate</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isHigh ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              <span>Critical Stockout Risk</span>
                            </span>
                          ) : isMed ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Approaching Safety</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Safe Buffer</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {f.suggestedRestock > 0 ? (
                            <div className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <span>Order +{f.suggestedRestock} {f.unit}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 font-medium">Adequate stock</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {f.overstockWarning ? (
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{f.overstockWarning}</span>
                            </div>
                          ) : f.foodWasteRecommendation ? (
                            <div className="inline-flex items-center gap-1 text-[11px] text-neutral-600">
                              <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{f.foodWasteRecommendation}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400">Normal rotation</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  localForecasts.map((f) => (
                    <tr key={f.productId} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{f.productName}</div>
                        <div className="text-[10px] text-neutral-400">{f.category}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">
                        {f.currentStock} {f.unit}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                        ~{f.forecast1Day} {f.unit}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-800">
                        ~{f.forecast7Days} {f.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-neutral-900">{f.daysUntilStockout} Days</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          f.stockoutRiskLevel === 'high' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {f.stockoutRiskLevel === 'high' ? 'Stockout Risk' : 'Normal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">
                        {f.currentStock <= 15 ? 'Restock advised' : 'Sufficient'}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">
                        FEFO rotation front-facing
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Sales Trend Visualizer */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs">
        <h3 className="text-sm font-bold text-neutral-900 mb-1">
          Historical Daily Consumption & Weekend Seasonality
        </h3>
        <p className="text-xs text-neutral-500 mb-6">
          14-day observed consumption curves showing weekday vs weekend velocity variations used as input for forecasting models.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.slice(0, 3).map((p) => {
            const maxVal = Math.max(...p.historicalDailySales, 1);
            return (
              <div key={p.id} className="p-4 bg-neutral-50/60 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-neutral-900 line-clamp-1">{p.name}</div>
                  <span className="text-[10px] text-neutral-400 font-medium">Last 14 days</span>
                </div>

                {/* Bar Visualizer */}
                <div className="h-20 flex items-end gap-1.5 pt-4">
                  {p.historicalDailySales.map((val, i) => {
                    const heightPercent = Math.round((val / maxVal) * 100);
                    const isWeekend = i === 4 || i === 5 || i === 11 || i === 12;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className={`w-full rounded-t transition-all ${
                            isWeekend ? 'bg-emerald-600' : 'bg-neutral-300 group-hover:bg-neutral-400'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <div className="absolute -top-6 bg-neutral-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {val} {p.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-neutral-400 mt-2 border-t border-neutral-200 pt-1.5">
                  <span>Day 1</span>
                  <span className="font-semibold text-emerald-700">Green = Weekend Peaks</span>
                  <span>Today</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
