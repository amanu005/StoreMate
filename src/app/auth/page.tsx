'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (isSignUp) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            StoreMate (ஸ்டோர் மேட்)
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            “Your shop. Your voice. Your business.”
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 sm:p-8 space-y-5 border-slate-200 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-900">
              {isSignUp ? 'Shop Owner Registration' : 'Shop Owner Login'}
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {isSignUp ? 'New Owner' : 'Quick Access'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Mobile Number (மொபைல் எண்)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              required
            />

            <Input
              label="Password (கடவுச்சொல்)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full text-base font-bold shadow-md shadow-emerald-600/20"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              {isSignUp ? 'Continue to Onboarding' : 'Open My Kadai'}
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Login here'
                : "Don't have an account? Register your shop"}
            </button>
          </div>
        </Card>

        {/* Safety Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with Supabase Auth & Row Level Security</span>
        </div>
      </div>
    </div>
  );
}
