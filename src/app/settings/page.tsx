'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  User, 
  Key, 
  RotateCcw, 
  Check, 
  Sparkles, 
  ShieldCheck,
  Smartphone,
  Globe
} from 'lucide-react';
import { useStoreMate } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import confetti from 'canvas-confetti';

export default function SettingsPage() {
  const { 
    shop, 
    profile, 
    updateShop, 
    updateProfile, 
    language, 
    setLanguage, 
    resetDemoData 
  } = useStoreMate();

  const [shopName, setShopName] = useState(shop.name);
  const [ownerName, setOwnerName] = useState(profile.full_name);
  const [businessType, setBusinessType] = useState(shop.business_type);
  const [shopAddress, setShopAddress] = useState(shop.address || '');
  const [shopPhone, setShopPhone] = useState(shop.phone || '');
  
  const [isSaved, setIsSaved] = useState(false);
  const [isResetDone, setIsResetDone] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateShop({
      name: shopName,
      business_type: businessType,
      address: shopAddress,
      phone: shopPhone,
    });
    updateProfile({
      full_name: ownerName,
      phone: shopPhone,
    });

    setIsSaved(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all inventory, sales, and transactions back to initial demo data?')) {
      resetDemoData();
      setIsResetDone(true);
      setTimeout(() => setIsResetDone(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {language === 'ta' ? 'கடை மற்றும் பயனர் அமைப்புகள்' : 'Shop & App Settings'}
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Manage your business profile, language preferences, and AI configurations
        </p>
      </div>

      {/* 1. Shop Profile Form */}
      <Card className="p-6 sm:p-7 space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Shop & Owner Information
            </h3>
            <p className="text-xs text-slate-500">Visible on receipts, voice greetings, and summaries</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Shop Name (கடையின் பெயர்)"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
            <Input
              label="Owner Full Name (உரிமையாளர் பெயர்)"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Business Type (வணிக வகை)"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              options={[
                { value: 'Kirana & Provision Store', label: 'Kirana & Provision Store (மளிகைக் கடை)' },
                { value: 'Supermarket & Mini Mart', label: 'Supermarket & Mini Mart' },
                { value: 'General & Stationery Store', label: 'General & Stationery Store' },
                { value: 'Petty Shop & Tea Stall', label: 'Petty Shop & Tea Stall (பெட்டிக்கடை)' },
              ]}
            />
            <Input
              label="Phone Number (தொலைபேசி எண்)"
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
            />
          </div>

          <Input
            label="Shop Address / Location"
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
          />

          <div className="pt-2 flex items-center justify-between">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" />
                Settings saved successfully!
              </span>
            )}
            <Button type="submit" size="md" className="ml-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Language Preference Card */}
      <Card className="p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Language & Voice Preference
            </h3>
            <p className="text-xs text-slate-500">Choose your preferred UI and speech feedback mode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'tanglish',
              title: 'Tanglish (தமிழ் + English)',
              desc: 'Best for modern Kirana owners. Speak “5 Coke sale panniten”',
            },
            {
              id: 'ta',
              title: 'Pure Tamil (தமிழ்)',
              desc: 'Complete Tamil interface and voice confirmations',
            },
            {
              id: 'en',
              title: 'English',
              desc: 'English labels and standard units',
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLanguage(item.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                language === item.id
                  ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                {language === item.id && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* 3. Demo Data Reset & Testing Center */}
      <Card className="p-6 sm:p-7 space-y-4 border-rose-200/80 bg-rose-50/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Reset Demo Data
            </h3>
            <p className="text-xs text-slate-500">
              Restores initial inventory items (Rice, Coke, Maggi, Tata Salt, Oil, Biscuits)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-600 max-w-md">
            Useful for hackathons and presentations to demonstrate the end-to-end flow repeatedly.
          </p>
          <Button
            variant="danger"
            size="md"
            onClick={handleResetData}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {isResetDone ? 'Reset Complete!' : 'Reset Demo State'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
