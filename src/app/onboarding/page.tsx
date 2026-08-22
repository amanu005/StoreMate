'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, User, Building2, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useNammaKadai } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateShop, updateProfile, language } = useNammaKadai();

  const [step, setStep] = useState(1);
  const [shopName, setShopName] = useState('Murugan Stores');
  const [ownerName, setOwnerName] = useState('Karthik Raja');
  const [businessType, setBusinessType] = useState('Kirana & Provision Store');

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      updateShop({ name: shopName, business_type: businessType });
      updateProfile({ full_name: ownerName });
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      router.push('/');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Completed</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Card */}
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200 shadow-card">
          {/* Step 1: Shop Name */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  What is your shop's name?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  உங்கள் கடையின் பெயர் என்ன? (e.g. Sri Murugan Stores, Raja Maligai)
                </p>
              </div>
              <Input
                label="Shop Name"
                placeholder="Enter your shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Owner Name */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  What is your name?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  கடை உரிமையாளர் பெயர் (Used for personal voice greetings)
                </p>
              </div>
              <Input
                label="Owner Name"
                placeholder="e.g. Karthik"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Step 3: Business Type */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Select your business type
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  வணிக வகை தேர்வு செய்யவும்
                </p>
              </div>
              <Select
                label="Business Type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                options={[
                  { value: 'Kirana & Provision Store', label: 'Kirana & Provision Store (மளிகைக் கடை)' },
                  { value: 'Supermarket & Mini Mart', label: 'Supermarket & Mini Mart' },
                  { value: 'General Store', label: 'General Store (ஸ்டேஷனரி)' },
                  { value: 'Petty Shop & Tea Stall', label: 'Petty Shop & Tea Stall (பெட்டிக்கடை)' },
                ]}
              />
            </div>
          )}

          {/* Step 4: Ready to Start */}
          {step === 4 && (
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Everything is set! 🎉
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Welcome, <strong className="text-slate-900">{ownerName}</strong>! Your shop <strong className="text-emerald-700">“{shopName}”</strong> is ready with Tamil voice controls.
                </p>
              </div>
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold">
                🎙️ You can immediately try speaking: “5 Coke sale panniten”
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : <div />}

            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              rightIcon={step === 4 ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              className="font-bold min-h-[50px] px-7"
            >
              {step === 4 ? 'Start using Namma Kadai' : 'Continue'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
