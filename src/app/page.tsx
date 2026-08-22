'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  ChevronRight,
  Sparkles,
  Plus,
  Flame,
  Calendar
} from 'lucide-react';
import { useNammaKadai } from '@/lib/store';
import { VoiceMicHero } from '@/components/voice/VoiceMicHero';
import { Card } from '@/components/ui/Card';
import { Badge, StockStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { 
    profile, 
    shop, 
    products, 
    transactions, 
    sales, 
    language,
    getProductStockStatus,
    getStockVelocityInsights,
    addStock 
  } = useNammaKadai();

  const [restockingId, setRestockingId] = useState<string | null>(null);

  // Compute Today's Metrics
  const today = new Date().toISOString().split('T')[0];
  const todaySalesList = sales.filter((s) => s.created_at.startsWith(today) || true);
  const totalSalesAmount = todaySalesList.reduce((sum, s) => sum + s.total_amount, 0);
  const totalItemsSold = todaySalesList.reduce((sum, s) => sum + s.items_count, 0);
  const totalStockCount = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockItems = products.filter((p) => p.quantity <= p.minimum_quantity);

  const velocity = getStockVelocityInsights();

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const getGreeting = () => {
    if (language === 'ta') {
      if (hour < 12) return 'காலை வணக்கம்';
      if (hour < 17) return 'மதிய வணக்கம்';
      return 'மாலை வணக்கம்';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickRestock = async (productId: string, unit: string) => {
    setRestockingId(productId);
    try {
      await addStock(productId, 10, 'MANUAL', 'Quick restock (+10)');
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Shop Owner Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {profile.full_name} 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {shop.name} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>

        <Link
          href="/assistant"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-bold text-xs border border-emerald-200 shadow-xs transition-all touch-active"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{language === 'ta' ? 'குரல் உதவியாளர்' : 'Dedicated Voice Mode'}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. Today's Core KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sales */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'ta' ? 'இன்றைய விற்பனை' : "Today's Sales"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{totalSalesAmount.toLocaleString('en-IN')}
            </p>
            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {todaySalesList.length} {language === 'ta' ? 'பரிவர்த்தனைகள்' : 'transactions'}
            </span>
          </div>
        </Card>

        {/* Items Sold */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'ta' ? 'விற்ற பொருட்கள்' : 'Items Sold'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalItemsSold}
            </p>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block">
              {language === 'ta' ? 'இன்றைய மொத்த எண்ணிக்கை' : 'Total units sold today'}
            </span>
          </div>
        </Card>

        {/* Current Inventory */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'ta' ? 'மொத்த இருப்பு' : 'Current Stock'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {products.length} <span className="text-base font-semibold text-slate-500">{language === 'ta' ? 'வகைகள்' : 'items'}</span>
            </p>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block">
              {totalStockCount.toFixed(0)} total units
            </span>
          </div>
        </Card>

        {/* Low Stock Items */}
        <Card className={`p-4 sm:p-5 flex flex-col justify-between ${lowStockItems.length > 0 ? 'bg-amber-50/40 border-amber-200' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'ta' ? 'குறைந்த இருப்பு' : 'Low Stock'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-amber-700">
              {lowStockItems.length}
            </p>
            <span className="text-[11px] font-bold text-amber-700 mt-1 block">
              {lowStockItems.length > 0 ? (language === 'ta' ? 'உடனே மறுஆர்டர் செய்யவும்' : 'Needs attention') : 'All healthy'}
            </span>
          </div>
        </Card>
      </div>

      {/* 3. HERO Central Voice & Manual Assistant Card */}
      <VoiceMicHero />

      {/* 4. Bottom Two Columns: Recent Activity & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {language === 'ta' ? 'சமீபத்திய நடவடிக்கைகள்' : 'Recent Activity'}
              </h3>
              <p className="text-xs text-slate-500">Live stock in & sales movements</p>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>{language === 'ta' ? 'அனைத்தும்' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 divide-y divide-slate-100">
            {transactions.slice(0, 5).map((tx) => {
              const isStockIn = tx.type === 'IN';
              return (
                <div key={tx.id} className="pt-2.5 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                        isStockIn ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isStockIn ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {tx.product_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {tx.source === 'VOICE' && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                            🎙️ Voice
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        isStockIn ? 'text-blue-600' : 'text-emerald-600'
                      }`}
                    >
                      {isStockIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                    </span>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Bal: {tx.balance_after}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Needs Attention Section (Low-stock items + Expiring items) */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {language === 'ta' ? 'கவனிக்க வேண்டியவை' : 'Needs Attention'}
                </h3>
                <p className="text-xs text-slate-500">Low stock & expiring batch alerts</p>
              </div>
            </div>
            <Link
              href="/notifications"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>{language === 'ta' ? 'அறிவிப்புகள்' : 'Alerts'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {/* Expiring Soon Alerts */}
            {velocity.expiringSoon.map((item) => (
              <div
                key={item.product.id}
                className="p-3.5 rounded-2xl border bg-rose-50/60 border-rose-200 flex items-center justify-between transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{item.product.name}</span>
                    <span className="text-[10px] font-extrabold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.daysRemaining} days left
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 mt-0.5 font-medium">
                    Batch Expiry: {item.product.expiry_date} ({item.product.quantity} {item.product.unit} left)
                  </p>
                </div>
              </div>
            ))}

            {/* Low-stock products */}
            {lowStockItems.slice(0, 3).map((p) => {
              const isCritical = p.quantity <= 0;
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isCritical
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{p.name}</span>
                      <StockStatusBadge status={isCritical ? 'critical' : 'low'} language={language} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Current: <strong className={isCritical ? 'text-rose-600' : 'text-amber-700'}>{p.quantity} {p.unit}</strong> (Min: {p.minimum_quantity} {p.unit})
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickRestock(p.id, p.unit)}
                    isLoading={restockingId === p.id}
                    leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}
                    className="border-slate-300 text-xs font-bold shrink-0"
                  >
                    +10 Restock
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
