'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Mic, 
  Bell, 
  FileText, 
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useNammaKadai } from '@/lib/store';

export function Sidebar() {
  const pathname = usePathname();
  const { unreadNotificationsCount, language } = useNammaKadai();

  const navItems = [
    {
      label: 'Dashboard',
      tamilLabel: 'முகப்பு',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Inventory',
      tamilLabel: 'கையிருப்பு (Stock)',
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
      label: 'Voice Assistant',
      tamilLabel: 'குரல் உதவியாளர்',
      href: '/assistant',
      icon: Mic,
      isHero: true,
    },
    {
      label: 'Notifications',
      tamilLabel: 'அறிவிப்புகள்',
      href: '/notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    {
      label: 'Daily Summary',
      tamilLabel: 'தினசரி அறிக்கை',
      href: '/daily-summary',
      icon: FileText,
    },
    {
      label: 'Settings',
      tamilLabel: 'அமைப்புகள்',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 shrink-0">
      <div className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : item.isHero
                  ? 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/60'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : item.isHero
                      ? 'text-emerald-600'
                      : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                <div>
                  <p className="leading-tight">
                    {language === 'ta' ? item.tamilLabel : item.label}
                  </p>
                  {language === 'tanglish' && item.tamilLabel !== item.label && (
                    <p className={`text-[11px] font-normal ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {item.tamilLabel}
                    </p>
                  )}
                </div>
              </div>

              {item.badge ? (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive
                      ? 'bg-white text-emerald-700'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : item.isHero ? (
                <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* Bottom Promo Card */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-3.5 text-white shadow-md">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Voice Powered</span>
          </div>
          <p className="text-xs text-slate-300">
            “Your shop. Your voice. Your business.”
          </p>
        </div>
      </div>
    </aside>
  );
}
