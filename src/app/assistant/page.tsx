'use client';

import React from 'react';
import { Sparkles, Mic, Volume2, ShieldCheck, Zap } from 'lucide-react';
import { useStoreMate } from '@/lib/store';
import { VoiceMicHero } from '@/components/voice/VoiceMicHero';
import { Card } from '@/components/ui/Card';

export default function VoiceAssistantPage() {
  const { language } = useStoreMate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Hero Feature • AI Voice Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          StoreMate Assistant
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium">
          Speak naturally in Tamil or Tanglish. (தமிழ் அல்லது Tanglish-ல் பேசவும்)
        </p>
      </div>

      {/* Main Interactive Voice Component */}
      <VoiceMicHero showChips={true} />

      {/* How it works feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <Card className="p-4 bg-white/70 border border-slate-200/80 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Mic className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900">
            1. Speak Naturally
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            No rigid syntax required. Say “20 kilo rice வந்திருக்கு” or “5 Coke sale panniten”.
          </p>
        </Card>

        <Card className="p-4 bg-white/70 border border-slate-200/80 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900">
            2. Structured Preview
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            AI interprets and shows a safety card. Database is only modified when you confirm!
          </p>
        </Card>

        <Card className="p-4 bg-white/70 border border-slate-200/80 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Volume2 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900">
            3. Tamil Voice Feedback
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sarvam Bulbul gives instant spoken confirmation with updated stock balances.
          </p>
        </Card>
      </div>
    </div>
  );
}
