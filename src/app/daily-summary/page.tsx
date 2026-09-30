'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Flame,
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  ListTodo,
  Clock
} from 'lucide-react';
import { useStoreMate } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StockStatusBadge } from '@/components/ui/Badge';

export default function DailySummaryPage() {
  const { getDailySummary, shop, profile, language } = useStoreMate();
  const summary = getDailySummary();

  const [copied, setCopied] = useState(false);
  const [prioritiesState, setPrioritiesState] = useState<Record<string, boolean>>({});

  const togglePriority = (id: string) => {
    setPrioritiesState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generateShareText = () => {
    return `🏪 *${shop.name} - Daily Business Report*
📅 Date: ${summary.date}
👤 Owner: ${profile.full_name}

💰 *Today's Sales:* ₹${summary.totalSales.toLocaleString('en-IN')}
📦 *Items Sold:* ${summary.itemsSold} units (${summary.transactionCount} bills)
⚠️ *Low Stock Items:* ${summary.lowStockCount} products
⏳ *Expiring Soon:* ${summary.expiringProducts.length} items

🚀 *Fast Moving:* ${summary.fastMovingProducts.map(p => p.product_name).join(', ') || 'Normal'}
🐢 *Slow Moving:* ${summary.slowMovingProducts.map(p => p.product_name).join(', ') || 'None'}

📋 *Tomorrow's Priorities:*
${summary.tomorrowPriorities.map((p, i) => `${i + 1}. ${p.title}`).join('\n')}

_Generated via StoreMate AI 🎙️_`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>End-of-Day Quick Briefing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'ta' ? 'தினசரி வணிக அறிக்கை' : 'Daily Business Summary'}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {summary.date} • Readable in less than 30 seconds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={handleCopyReport}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied!' : 'Copy Summary'}
          </Button>

          <Button
            variant="success"
            size="md"
            onClick={handleShareWhatsApp}
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            WhatsApp Share
          </Button>
        </div>
      </div>

      {/* 1. TODAY'S BUSINESS CARD */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                Performance Overview
              </span>
              <h2 className="text-2xl font-black text-white mt-0.5">
                TODAY’S BUSINESS
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              {shop.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {/* Sales */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Total Sales
              </span>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">
                ₹{summary.totalSales.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-400 block font-medium">
                {summary.transactionCount} transactions
              </span>
            </div>

            {/* Items Sold */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Items Sold
              </span>
              <p className="text-3xl sm:text-4xl font-black text-white">
                {summary.itemsSold}
              </p>
              <span className="text-[11px] text-slate-400 block font-medium">
                units checked out
              </span>
            </div>

            {/* Low Stock */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Low Stock
              </span>
              <p className="text-3xl sm:text-4xl font-black text-amber-400">
                {summary.lowStockCount}
              </p>
              <span className="text-[11px] text-slate-400 block font-medium">
                products below min
              </span>
            </div>

            {/* Pending Actions */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Pending Actions
              </span>
              <p className="text-3xl sm:text-4xl font-black text-rose-400">
                {summary.pendingActionsCount}
              </p>
              <span className="text-[11px] text-slate-400 block font-medium">
                restocks & expiry alerts
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. FAST vs POOR MOVING STOCK SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fast Selling summary */}
        <Card className="p-5 border-emerald-200 bg-emerald-50/40 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Fast-Moving Stock (அதிக விற்பனை)
            </h3>
          </div>
          <div className="space-y-1.5">
            {summary.fastMovingProducts.slice(0, 3).map((item) => (
              <div key={item.product_id} className="p-2 bg-white rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{item.product_name}</span>
                <span className="font-extrabold text-emerald-700">{item.units_sold} {item.unit} sold</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Slow Moving summary */}
        <Card className="p-5 border-amber-200 bg-amber-50/40 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Poor / Slow-Moving (தேங்கிய இருப்பு)
            </h3>
          </div>
          <div className="space-y-1.5">
            {summary.slowMovingProducts.slice(0, 3).map((item) => (
              <div key={item.product_id} className="p-2 bg-white rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{item.product_name}</span>
                <span className="font-bold text-amber-800">{item.current_quantity} {item.unit} remaining</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 3. TOMORROW'S PRIORITIES SECTION */}
      <Card className="p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                TOMORROW’S PRIORITIES (நாளைய முன்னுரிமைகள்)
              </h3>
              <p className="text-xs text-slate-500">Action items to complete before opening shop tomorrow</p>
            </div>
          </div>
        </div>

        {summary.tomorrowPriorities.length === 0 ? (
          <div className="py-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 text-emerald-800">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold">No urgent restocks or expiry alerts! 🎉</p>
            <p className="text-xs text-emerald-600 mt-1">All products are healthy and well-stocked.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {summary.tomorrowPriorities.map((item, index) => {
              const isChecked = Boolean(prioritiesState[item.id]);

              return (
                <div
                  key={item.id}
                  onClick={() => togglePriority(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all select-none ${
                    isChecked
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through opacity-60'
                      : item.type === 'EXPIRY'
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                      : item.severity === 'HIGH'
                      ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                      : 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold text-xs ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {isChecked ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isChecked ? 'text-slate-500' : 'text-slate-900'}`}>
                        {item.title}
                      </p>
                      {language === 'ta' && (
                        <p className="text-xs text-slate-600 mt-0.5">{item.tamil_title}</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      isChecked
                        ? 'bg-slate-200 text-slate-600'
                        : item.type === 'EXPIRY'
                        ? 'bg-rose-100 text-rose-800'
                        : item.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isChecked ? 'Done' : item.type === 'EXPIRY' ? 'Expiry Alert' : item.severity === 'HIGH' ? 'Critical' : 'Restock'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
