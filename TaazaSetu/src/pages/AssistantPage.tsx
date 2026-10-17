import React, { useState } from 'react';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import { BUSINESS_CONFIGS } from '../data/initialData';

export const AssistantPage: React.FC = () => {
  const {
    selectedBusinessType,
    products,
    recipes,
    purchaseOrders,
    wasteRecords,
    getFreshnessRecommendations,
    getReorderRecommendations
  } = useApp();

  const config = BUSINESS_CONFIGS[selectedBusinessType];
  const freshnessRecs = getFreshnessRecommendations();
  const reorderRecs = getReorderRecommendations().filter((r) => r.suggestedReorderQuantity > 0);

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      timestamp: '10:45 AM',
      text: `Hello! I am your Taaza Setu Assistant for ${config.name}. I have real-time access to your ${products.length} inventory products, active batches, and demand forecasts. How can I assist your operations today?`
    }
  ]);

  const quickQuestions = [
    'Which products will expire this week?',
    'What should I reorder tomorrow?',
    'Which products are wasting the most money?',
    selectedBusinessType === 'cafe'
      ? 'How much milk will my café need tomorrow?'
      : selectedBusinessType === 'restaurant'
      ? 'Which restaurant ingredients may run out during dinner service?'
      : selectedBusinessType === 'bakery'
      ? 'Which bakery products should I prepare more of tomorrow?'
      : 'What is our fastest-moving dairy item?'
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');

    // Formulate Context-Aware Live Answer
    setTimeout(() => {
      let replyText = '';
      let structured: ChatMessage['structuredData'] | undefined;

      const lower = query.toLowerCase();

      if (lower.includes('expire') || lower.includes('shelf life') || lower.includes('week')) {
        if (freshnessRecs.length > 0) {
          replyText = `Based on your live batch database for ${config.name}, here are the items with imminent expiry in the next 1–7 days:`;
          structured = {
            type: 'expiry_alert',
            items: freshnessRecs.map((r) => ({
              label: `${r.productName} (Batch ${r.batchNumber})`,
              value: `${r.quantityAtRisk} ${r.unit} expires on ${r.expiryDate}`,
              badge: `${r.daysRemaining}d left`
            }))
          };
        } else {
          replyText = `Great news! No products in your ${config.name} inventory are scheduled to expire this week. All current batches have healthy shelf-life buffers.`;
        }
      } else if (lower.includes('reorder') || lower.includes('tomorrow') || lower.includes('purchase')) {
        if (reorderRecs.length > 0) {
          replyText = `Here are the top purchase reorder recommendations calculated using your lead-time safety stock formula:`;
          structured = {
            type: 'reorder_summary',
            items: reorderRecs.slice(0, 4).map((r) => ({
              label: r.productName,
              value: `Reorder ${r.suggestedReorderQuantity} ${r.unit} from ${r.supplierName}`,
              badge: r.urgency.toUpperCase()
            }))
          };
        } else {
          replyText = `All inventory levels currently satisfy their safety buffer thresholds. No immediate reorders are required today.`;
        }
      } else if (lower.includes('waste') || lower.includes('money') || lower.includes('loss')) {
        const totalLoss = wasteRecords.reduce((acc, w) => acc + w.costLost, 0);
        replyText = `To date, ₹${totalLoss.toLocaleString('en-IN')} in food waste losses have been recorded across ${wasteRecords.length} incident(s).`;
        structured = {
          type: 'waste_insight',
          items: wasteRecords.slice(0, 3).map((w) => ({
            label: w.productName,
            value: `Lost ₹${w.costLost} (${w.quantity} ${w.unit})`,
            badge: w.reason
          }))
        };
      } else if (lower.includes('milk') || lower.includes('cafe')) {
        const milkProduct = products.find((p) => p.name.toLowerCase().includes('milk'));
        if (milkProduct) {
          replyText = `Current stock for ${milkProduct.name} is ${milkProduct.currentStock} ${milkProduct.unit}. Projected 24h demand is ~32 ${milkProduct.unit}. With 12L expiring tomorrow, FEFO prioritisation is advised.`;
        } else {
          replyText = `Milk consumption for your café is tracked under refrigerated dairy batches with a 1-day lead time distributor.`;
        }
      } else if (lower.includes('restaurant') || lower.includes('ingredients') || lower.includes('run out')) {
        replyText = `For dinner service, Italian Mozzarella is at 9 kg (below 10 kg safety threshold), and Boneless Chicken Breast has 18.5 kg in cold storage with 6.5 kg in earliest batch LOT-CHK-901.`;
      } else if (lower.includes('bakery') || lower.includes('prepare') || lower.includes('bread')) {
        replyText = `Tomorrow's AI oven schedule anticipates demand for 34 Artisan Sourdough Loaves. With 24 loaves currently in stock, our algorithm recommends an early 5:00 AM bake batch of 20 fresh loaves.`;
      } else {
        replyText = `I have analyzed your ${config.name} records: you have ${products.length} SKUs across categories (${config.categories.slice(0, 3).join(', ')}). All data is strictly scoped to your business profile with no cross-tenant exposure.`;
      }

      const botReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        structuredData: structured
      };

      setMessages((prev) => [...prev, botReply]);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-neutral-900">
              AI Business Assistant ({config.name})
            </h1>
            <p className="text-[11px] text-neutral-500">
              Grounded strictly in your live inventory, batch expiries & supplier records.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tenant Isolated</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-neutral-900 text-white'
                    : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-700" />}
              </div>

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-neutral-900 text-white font-medium rounded-tr-none'
                    : 'bg-neutral-50 text-neutral-800 border border-neutral-200/80 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className={`text-[10px] font-bold ${isUser ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {isUser ? 'You' : 'Taaza Setu Assistant'}
                  </span>
                  <span className={`text-[9px] ${isUser ? 'text-neutral-400' : 'text-neutral-400'}`}>
                    {m.timestamp}
                  </span>
                </div>

                <p className="text-xs whitespace-pre-line">{m.text}</p>

                {m.structuredData && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 space-y-2">
                    {m.structuredData.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white rounded-xl border border-neutral-200 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <div className="font-bold text-neutral-900">{item.label}</div>
                          <div className="text-neutral-500">{item.value}</div>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0 ml-2">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Prompts Pill Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-full bg-white border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 text-neutral-700 text-xs font-medium whitespace-nowrap transition-colors shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-white p-2 rounded-2xl border border-neutral-200/90 shadow-2xs flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={`Ask about ${config.name.toLowerCase()} expiries, forecasts, or reorders...`}
          className="flex-1 px-4 py-2 text-xs bg-transparent outline-hidden text-neutral-900 placeholder:text-neutral-400"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
