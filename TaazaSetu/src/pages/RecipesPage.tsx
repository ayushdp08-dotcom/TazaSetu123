import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Coffee,
  Cake,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIGS } from '../data/initialData';

export const RecipesPage: React.FC = () => {
  const { recipes, products, sellMenuItem, selectedBusinessType, setCurrentRoute } = useApp();
  const config = BUSINESS_CONFIGS[selectedBusinessType];

  const [saleQuantities, setSaleQuantities] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const handleSale = (recipeId: string) => {
    const qty = saleQuantities[recipeId] || 1;
    const res = sellMenuItem(recipeId, qty);
    setFeedback({ id: recipeId, success: res.success, msg: res.message });
  };

  const getPageTitle = () => {
    switch (selectedBusinessType) {
      case 'cafe': return 'Specialty Drink Recipes & POS Deduction';
      case 'restaurant': return 'Kitchen Menu Recipes & Prep Yields';
      case 'bakery': return 'Oven Production Batches & Ingredient Conversion';
      default: return 'Product Bundles & Quick Register Sales';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Automated FEFO Bill-of-Materials (BOM)</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              When menu items or bakery batches are sold/produced, component ingredients (milk, espresso beans, mozzarella, flour) are automatically decremented from live batches using FEFO order.
            </p>
          </div>

          <button
            onClick={() => setCurrentRoute('inventory')}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors self-start md:self-auto"
          >
            View Raw Ingredients
          </button>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((rec) => {
          const qty = saleQuantities[rec.id] || 1;
          const isCurrentFeedback = feedback?.id === rec.id;

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      {rec.category}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900">{rec.menuItemName}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-neutral-900">₹{rec.sellingPrice}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">{rec.marginPercent}% Margin</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Prep: {rec.preparationTimeMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{rec.ingredients.length} Ingredients</span>
                  </div>
                </div>

                {/* Ingredients Bill of Materials */}
                <div className="space-y-2 mb-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Required Ingredients (Auto-Deducted per unit)
                  </div>
                  {rec.ingredients.map((ing, i) => {
                    const linkedProduct = products.find((p) => p.id === ing.productId);
                    const isLow = (linkedProduct?.currentStock || 0) < ing.quantityNeeded;

                    return (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-neutral-900">{ing.productName}</div>
                          <div className="text-[10px] text-neutral-400">
                            Available: {linkedProduct?.currentStock ?? 'N/A'} {ing.unit}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-neutral-900">
                            {ing.quantityNeeded} {ing.unit}
                          </span>
                          {isLow && (
                            <div className="text-[10px] font-bold text-red-600">Stock Insufficient</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar */}
              <div>
                {isCurrentFeedback && (
                  <div
                    className={`p-3 rounded-xl mb-3 text-xs flex items-center gap-2 ${
                      feedback.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {feedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{feedback.msg}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 px-2 py-1">
                    <span className="text-xs text-neutral-500 mr-2">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={qty}
                      onChange={(e) =>
                        setSaleQuantities((prev) => ({
                          ...prev,
                          [rec.id]: Math.max(1, Number(e.target.value))
                        }))
                      }
                      className="w-12 text-xs font-bold text-center bg-transparent outline-hidden text-neutral-900"
                    />
                  </div>

                  <button
                    onClick={() => handleSale(rec.id)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Deduct & Log Sale ({qty}x)</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
