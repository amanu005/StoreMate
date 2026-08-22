'use client';

import React from 'react';
import { VoiceIntentResult, Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Check, X, ArrowRight, ShoppingCart, Package } from 'lucide-react';

interface IntentConfirmationCardProps {
  intent: VoiceIntentResult;
  products: Product[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  language?: 'ta' | 'en' | 'tanglish';
}

export function IntentConfirmationCard({
  intent,
  products,
  onConfirm,
  onCancel,
  isLoading = false,
  language = 'tanglish',
}: IntentConfirmationCardProps) {
  const matchedProduct = intent.matched_product_id 
    ? products.find((p) => p.id === intent.matched_product_id)
    : products.find((p) => p.name.toLowerCase().includes(intent.product.toLowerCase()));

  const currentQty = matchedProduct ? matchedProduct.quantity : null;
  let newQty = currentQty;
  if (currentQty !== null) {
    if (intent.action === 'ADD_STOCK') newQty = currentQty + intent.quantity;
    if (intent.action === 'RECORD_SALE') newQty = Math.max(0, currentQty - intent.quantity);
  }

  const isSale = intent.action === 'RECORD_SALE';
  const isAdd = intent.action === 'ADD_STOCK';
  const actionName = isSale ? 'Sale' : isAdd ? 'Stock In' : 'Action';
  const actionNameTamil = isSale ? 'விற்பனை' : isAdd ? 'சரக்கு வரவு' : 'செயல்பாடு';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-lg shadow-slate-900/5 space-y-5 animate-in zoom-in-95 duration-200 max-w-lg mx-auto text-left">
      {/* Calm Header: I understood */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          I understood
        </span>
        <span className="text-xs font-semibold text-slate-400">
          {language === 'ta' ? 'புரிந்துகொண்டது' : 'Ready to confirm'}
        </span>
      </div>

      {/* Main Entity Row: Action & Product · Quantity */}
      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
            isSale ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isSale ? <ShoppingCart className="w-4 h-4" /> : <Package className="w-4 h-4" />}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {actionName} {language === 'ta' && `(${actionNameTamil})`}
          </span>
        </div>

        <div className="pt-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {intent.product} <span className="text-slate-400 font-normal">·</span>{' '}
            <span className={isSale ? 'text-emerald-700' : 'text-blue-700'}>
              {intent.quantity} {intent.unit || 'units'}
            </span>
          </h3>
          {matchedProduct?.tamil_name && (
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {matchedProduct.tamil_name}
            </p>
          )}
        </div>

        {/* Financial & Stock Preview */}
        {isSale && intent.total_price ? (
          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs sm:text-sm font-medium">
            <span className="text-slate-500">
              Total Amount: ₹{intent.unit_price} × {intent.quantity}
            </span>
            <strong className="text-slate-900 text-base font-extrabold">
              ₹{intent.total_price}
            </strong>
          </div>
        ) : null}

        {currentQty !== null && newQty !== null && (
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span>Current Stock: {currentQty} {intent.unit}</span>
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <span>New:</span>
              <span className={newQty <= (matchedProduct?.minimum_quantity || 0) ? 'text-amber-600' : 'text-emerald-700'}>
                {newQty} {intent.unit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Confirmation Buttons: [ Confirm ]  [ Cancel ] */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          variant="outline"
          size="lg"
          onClick={onCancel}
          disabled={isLoading}
          leftIcon={<X className="w-4 h-4" />}
          className="text-slate-700 font-bold min-h-[50px] rounded-2xl"
        >
          {language === 'ta' ? 'ரத்து' : 'Cancel'}
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onConfirm}
          isLoading={isLoading}
          leftIcon={<Check className="w-5 h-5" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-h-[50px] rounded-2xl shadow-sm"
        >
          {language === 'ta' ? 'உறுதி செய்' : 'Confirm'}
        </Button>
      </div>
    </div>
  );
}
