# Namma Kadai (நம்ம கடை)
> **“Your shop. Your voice. Your business.”**

A production-quality, mobile-first AI-integrated inventory and business management web application built for small and unorganized Indian shop owners (Kirana stores, provisional stores, petty shops).

Manage inventory, sales, stock tracking, and reorders through natural **Tamil and Tanglish voice commands** without complex forms or cluttered ERP menus.

---

## 🌟 Key Features

1. **🎙️ Hero Voice Assistant (Tamil & Tanglish First)**
   - Speak naturally:
     - *“20 packets Maggi வந்திருக்கு”* (Stock In)
     - *“5 Coke sale panniten”* (Record Sale)
     - *“15 Maggi sale panniten”* (Sale + Low Stock alert)
     - *“Coke stock evlo irukku?”* (Stock Balance Check)
     - *“எந்த stock குறைவா இருக்கு?”* (Low Stock Overview)
   - Real-time speech recognition (Sarvam Saaras STT & Web Speech API)
   - Structured JSON AI intent parser with strict schema validation
   - **Safety First**: AI shows a confirmation card before modifying the database.
   - Spoken Tamil voice responses via Sarvam Bulbul TTS and Web Audio API.

2. **📦 Inventory Management**
   - Live product catalog with search, category filtering, and status badges:
     - 🟢 **Healthy**: In stock
     - 🟠 **Low Stock**: At or below minimum quantity
     - 🔴 **Critical**: Out of stock
   - Complete audit trail (`inventory_transactions`) recording every stock movement.
   - Quick +5 / +10 manual restock buttons.

3. **💰 Sales & Billing**
   - Real-time tracking of Today's Sales, items sold, and average ticket size.
   - Live transaction history with 🎙️ Voice vs ✍️ Manual badges.
   - Quick manual sale recording modal with UPI / Cash / Credit support.

4. **⚠️ Automatic Low-Stock Trigger System**
   - Automatically monitors stock after every sale:
     $$\text{IF current\_quantity} \le \text{minimum\_quantity} \implies \text{Create Notification}$$
   - Generates actionable in-app and push notification alerts with 1-tap restock action.

5. **📊 Daily Business Summary (Readable in $<30$ seconds)**
   - **TODAY'S BUSINESS**: Sales revenue, items sold, low stock items, and pending actions.
   - **TOMORROW'S PRIORITIES**: Actionable restock checklist for tomorrow morning.
   - 1-click WhatsApp share and clipboard export.

6. **📱 Mobile-First Responsive Design**
   - Light background (`#F8FAFC`), deep navy text (`#0F172A`), vivid emerald green accents (`#059669`).
   - Bottom navigation bar on mobile with center floating microphone button.
   - Desktop collapsible sidebar.
   - Bilingual switch (தமிழ் / Tanglish / English).

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

### 4. Run Automated Test Suite
```bash
npx tsx scripts/verify-flow.ts
```

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Canvas Confetti
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Triggers (`supabase/migrations/20260822000000_init_schema.sql`)
- **Speech-to-Text**: Sarvam AI Saaras (`/api/voice/stt`) + Web Speech API fallback
- **Intent Engine**: Structured JSON semantic parser (`/api/voice/intent`)
- **Text-to-Speech**: Sarvam AI Bulbul (`/api/voice/tts`) + Web Audio API fallback
- **State Management**: Reactive Context Store with persistent local cache and instant optimistic updates

---

## 🗄️ Database Tables (`supabase/migrations/`)

1. `profiles`: Shop owner user profiles and language preferences.
2. `shops`: Shop details, business type, and address.
3. `products`: Catalog items, prices, minimum stock thresholds, and units.
4. `inventory_transactions`: Permanent audit log of every stock movement.
5. `sales` & `sale_items`: Completed sales transactions and billing items.
6. `notifications`: Low stock alerts, critical warnings, and daily summaries.

---

## 🧪 Complete Demo Flow to Test

1. **Add Stock**: Speak or tap *“20 packets Maggi வந்திருக்கு”* $\rightarrow$ Maggi stock increases by 20.
2. **Record Sale**: Speak or tap *“15 Maggi sale panniten”* $\rightarrow$ Sale recorded, Maggi stock decreases to 10 (below min 12) $\rightarrow$ Automatic Low Stock notification appears!
3. **Check Stock**: Speak or tap *“Coke stock evlo irukku?”* $\rightarrow$ AI speaks and displays current Coke stock.
4. **Daily Summary**: Navigate to Daily Summary $\rightarrow$ Review Today's Business card and Tomorrow's Priorities $\rightarrow$ Tap WhatsApp Share.
