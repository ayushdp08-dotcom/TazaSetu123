# Taaza Setu — Complete AI Inventory Management Prototype

A modern, clean white-themed, multi-business AI-powered inventory SaaS web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

## Deploy to Vercel
1. Push this folder to a GitHub repo (the project root must contain `package.json`, `api/` and `src/`).
2. On vercel.com choose Add New, then Project, import the repo and click Deploy. The Vite settings are detected automatically.
3. Optional, for AI expiry-label OCR: add `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` under Settings, then Environment Variables, and redeploy. Without a key the scanner falls back to on-device OCR.
4. Optional: if you host the Express server in `server/` elsewhere, set `VITE_API_URL` to its `/api` URL. Without it the app runs on local demo data.

## Scanner flow
Scan barcode (camera, manual entry or Open Food Facts lookup), then photograph the expiry label (OCR) or type the date, confirm quantity and prices, and save the batch.

## 🌟 Live Local Access
The development server is running at:
**[http://localhost:5173/](http://localhost:5173/)**

---

## 🚀 Key Features & Architectural Highlights

### 1. Welcome Page & Multi-Business Selectors
- **Headline**: *“Smarter Inventory. Fresher Products. Better Profits.”*
- **4 Distinct Business Types**:
  1. **Grocery Store**: Packaged foods, dairy, produce, batch-wise FEFO expiry.
  2. **Café & Beverage Bar**: Whole milk, single-origin espresso beans, syrups, cups, automated recipe deduction.
  3. **Bistro & Restaurant**: Raw poultry, mozzarella, tomato puree, walk-in cold storage zones, prep yield tracking.
  4. **Artisan Bakery**: Flours, butter, chocolates, daily oven batch conversion, 24–48h shelf life tracking.

### 2. Business-Specific Authentication with Phone OTP
- Mobile number validation (+91 Indian format).
- 6-digit individual digit input with auto-advance and backspace handling.
- Integrated **Dev/Demo Mode OTP Sandbox** (use `123456` or click "Fill Demo OTP") with a clear notice indicating simulated verification when external SMS providers (Supabase / Twilio) are not configured.
- Protected dashboard routes and persistent session management.

### 3. Business Onboarding Flow
- Captures legal business name, owner name, store location, timezone, preferred currency (default INR `₹`), and default measurement units.

### 4. 4 Dedicated Business Dashboards
- **Grocery**: High-turnover perishable trackers, batch-level milk expiry counters, pending supplier deliveries.
- **Café**: Interactive Barista POS with recipe-based deduction (selling a latte decrements espresso beans, fresh milk, and cups simultaneously).
- **Restaurant**: Chef's kitchen prep sheets, walk-in cold room temperature logs, recipe ingredient yield deductions.
- **Bakery**: Daily oven production bakes, flour-to-bread conversions, day-shelf-life alerts, and tomorrow's baking suggestions.

### 5. Signature USP — Freshness Intelligence AI & Waste Prevention Simulator
- **Prioritized "Save These Products First" Queue**: Compares remaining batch expiry against predicted demand velocity.
- **Interactive Waste Prevention Simulator**: Sliders to adjust markdown discounts (0–60%) and projected demand velocity uplift (0–100%).
- **Before-vs-After Comparison**: Clear breakdown of status-quo waste vs proposed AI action, avoided loss in INR, and recovered revenue.
- **Responsible AI Disclaimer**: Clear food safety notice that expired products must never be sold.

### 6. Transparent AI Demand Forecasting & Smart Reorder
- **14-day weighted moving average** algorithm with weekend surge factor (+18%).
- Projected demand horizons for **1 Day, 7 Days, and 30 Days**.
- Transparent safety stock formula: `Suggested = Max(0, [Lead Time Demand + Safety Stock] - [Current Stock + On-Order Stock])`.
- Direct one-click conversion into vendor **Purchase Orders (PO)**.

### 7. Interactive Inventory Management
- Add custom SKUs, receive stock batches (with batch code & expiry), and perform audit adjustments.
- Real-time stock movement audit trail.
- One-click CSV inventory export.

### 8. Conversational AI Business Assistant
- Multi-turn copilot answering live business questions grounded in the current business's inventory, active expiries, and reorder levels.
- Pre-loaded instant prompt suggestions.

---

## 🛠️ Tech Stack & Scripts
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **State & Data**: React Context with LocalStorage persistence.
- **Build**: Vite 5.

```bash
# Run Development Server
npm run dev

# Run Production Build
npm run build
```
