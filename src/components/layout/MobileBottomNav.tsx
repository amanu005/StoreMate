'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Mic, FileText } from 'lucide-react';
import { useStoreMate } from '@/lib/store';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { language, setVoiceModalOpen } = useStoreMate();

  const tabs = [
    {
      label: 'Home',
      tamilLabel: 'முகப்பு',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Inventory',
      tamilLabel: 'இருப்பு',
      href: '/inventory',
      icon: Package,
    },
    {
      label: 'Sales',
      tamilLabel: 'விற்பனை',
      href: '/sales',
      icon: ShoppingCart,
    },
    {
      label: 'Summary',
      tamilLabel: 'அறிக்கை',
      href: '/daily-summary',
      icon: FileText,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg px-2 pb-safe">
      <div className="flex items-center justify-around h-16 relative">
        {/* Tab 1: Home */}
        <Link
          href={tabs[0].href}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === tabs[0].href
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">
            {language === 'ta' ? tabs[0].tamilLabel : tabs[0].label}
          </span>
        </Link>

        {/* Tab 2: Inventory */}
        <Link
          href={tabs[1].href}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === tabs[1].href
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">
            {language === 'ta' ? tabs[1].tamilLabel : tabs[1].label}
          </span>
        </Link>

        {/* Center Floating Voice Assistant Button */}
        <div className="flex flex-col items-center justify-center -mt-6 px-1">
          <button
            onClick={() => setVoiceModalOpen(true)}
            aria-label="Voice Assistant"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 touch-active border-4 border-slate-50 focus:outline-none"
          >
            <Mic className="w-7 h-7" />
          </button>
          <span className="text-[10px] font-extrabold text-emerald-700 mt-0.5">
            Voice
          </span>
        </div>

        {/* Tab 3: Sales */}
        <Link
          href={tabs[2].href}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === tabs[2].href
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">
            {language === 'ta' ? tabs[2].tamilLabel : tabs[2].label}
          </span>
        </Link>

        {/* Tab 4: Summary */}
        <Link
          href={tabs[3].href}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === tabs[3].href
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">
            {language === 'ta' ? tabs[3].tamilLabel : tabs[3].label}
          </span>
        </Link>
      </div>
    </div>
  );
}
