'use client';

import React from 'react';
import { Sparkles, Flame, TrendingDown, Calendar } from 'lucide-react';

interface QuickVoiceChipsProps {
  onSelectPrompt: (promptText: string) => void;
  language?: 'ta' | 'en' | 'tanglish';
}

const SAMPLE_PROMPTS = [
  {
    text: '20 packets Maggi வந்திருக்கு',
    tamil: 'மேகி சரக்கு வரவு',
    action: 'ADD_STOCK',
    tag: 'Stock In',
  },
  {
    text: '5 Coke sale panniten',
    tamil: 'கோக் விற்பனை',
    action: 'RECORD_SALE',
    tag: 'Sale',
  },
  {
    text: 'Coke konjam sale panniten',
    tamil: 'அளவு விடுபட்டது (Clarification)',
    action: 'NEED_CLARIFICATION',
    tag: 'Ask Qty',
  },
  {
    text: 'Coke stock evlo irukku?',
    tamil: 'கோக் இருப்பு சோதனை',
    action: 'CHECK_STOCK',
    tag: 'Check',
  },
  {
    text: 'Fast moving stock எது?',
    tamil: 'அதிக விற்பனை பொருட்கள்',
    action: 'FAST_MOVING_REPORT',
    tag: '🚀 Fast Moving',
  },
  {
    text: 'Poor selling stock எது?',
    tamil: 'தேங்கிய மந்தமான இருப்பு',
    action: 'SLOW_MOVING_REPORT',
    tag: '🐢 Slow Moving',
  },
  {
    text: 'Expiry date என்ன?',
    tamil: 'காலாவதியாகும் பொருட்கள்',
    action: 'EXPIRY_REPORT',
    tag: '📅 Expiry Alert',
  },
  {
    text: 'எந்த stock குறைவா இருக்கு?',
    tamil: 'குறைந்த இருப்பு பட்டியல்',
    action: 'LOW_STOCK_REPORT',
    tag: 'Low Stock',
  },
];

export function QuickVoiceChips({ onSelectPrompt }: QuickVoiceChipsProps) {
  return (
    <div className="space-y-2.5 max-w-2xl mx-auto">
      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>Try natural voice or typed commands (தொட்டு பேசவும் / தட்டச்சு செய்க):</span>
      </div>
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
        {SAMPLE_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.text)}
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-emerald-50/90 border border-slate-200 hover:border-emerald-300 text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-950 transition-all duration-150 shadow-xs active:scale-95 text-left"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500/70 group-hover:bg-emerald-600 shrink-0" />
            <span>“{item.text}”</span>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-700 bg-slate-100 group-hover:bg-emerald-100 px-1.5 py-0.5 rounded-md">
              {item.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
