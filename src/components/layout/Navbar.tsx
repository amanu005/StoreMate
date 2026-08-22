'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Mic, Globe, Store } from 'lucide-react';
import { useNammaKadai } from '@/lib/store';

export function Navbar() {
  const pathname = usePathname();
  const { 
    shop, 
    unreadNotificationsCount, 
    language, 
    setLanguage, 
    setVoiceModalOpen 
  } = useNammaKadai();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Shop Details */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
                    Namma Kadai
                  </h1>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    நம்ம கடை
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[140px] sm:max-w-[220px]">
                  {shop.name}
                </p>
              </div>
            </Link>
          </div>

          {/* Right actions: Language Switcher, Voice Quick Button, Notifications Bell */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bilingual Switcher */}
            <div className="relative inline-flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  language === 'ta'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLanguage('tanglish')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  language === 'tanglish'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tanglish
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`hidden sm:inline-block px-2.5 py-1 rounded-xl transition-all ${
                  language === 'en'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* Quick Voice Assistant Trigger (Desktop only) */}
            <button
              onClick={() => setVoiceModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all touch-active"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
              <span>Voice</span>
            </button>

            {/* Notifications Bell */}
            <Link
              href="/notifications"
              className="relative p-2.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 text-white text-[11px] font-extrabold flex items-center justify-center rounded-full px-1 border-2 border-white shadow-xs animate-bounce">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
