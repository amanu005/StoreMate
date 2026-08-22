'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Flame,
  CreditCard, 
  Banknote, 
  Clock, 
  Sparkles,
  ArrowUpRight,
  PackageCheck
} from 'lucide-react';
import { useNammaKadai } from '@/lib/store';
import { PaymentMode } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import confetti from 'canvas-confetti';

export default function SalesPage() {
  const { sales, products, recordSale, getStockVelocityInsights, language } = useNammaKadai();

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [saleQuantity, setSaleQuantity] = useState<number>(1);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [saleNote, setSaleNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute Sales Metrics
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalItemsSold = sales.reduce((sum, s) => sum + s.items_count, 0);
  const totalOrdersCount = sales.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSalesRevenue / totalOrdersCount) : 0;

  const velocity = getStockVelocityInsights();

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const estimatedAmount = selectedProduct ? selectedProduct.selling_price * saleQuantity : 0;

  const handleRecordManualSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || saleQuantity <= 0) return;

    setIsSubmitting(true);
    try {
      await recordSale(selectedProductId, saleQuantity, paymentMode, 'MANUAL', saleNote || 'Manual counter sale');
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      setIsSaleModalOpen(false);
      setSaleQuantity(1);
      setSaleNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ta' ? 'விற்பனை மேலாண்மை' : 'Sales Management'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {language === 'ta' ? 'இன்றைய விற்பனை மற்றும் பில் விவரங்கள்' : 'Track daily revenue, item volume, and billing history'}
          </p>
        </div>

        <Button
          onClick={() => setIsSaleModalOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
          size="lg"
        >
          {language === 'ta' ? 'விற்பனை பதிவு செய்ய' : 'Record Sale'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {language === 'ta' ? 'மொத்த வருமானம்' : 'Total Revenue'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            ₹{totalSalesRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            Live Updated
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {language === 'ta' ? 'விற்ற பொருட்கள்' : 'Items Sold'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalItemsSold}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across all categories
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {language === 'ta' ? 'பில் எண்ணிக்கை' : 'Total Bills'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalOrdersCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Customer checkouts
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {language === 'ta' ? 'சராசரி பில் தொகை' : 'Avg Ticket'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            ₹{avgOrderValue}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Per transaction
          </span>
        </Card>
      </div>

      {/* STOCK VELOCITY SECTION: Fast Moving vs Poor/Slow Moving */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fast Moving Card */}
        <Card className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {language === 'ta' ? 'அதிக விற்பனையாகும் பொருட்கள்' : 'Fast-Moving Stock (🚀)'}
                </h3>
                <p className="text-xs text-slate-500">Highest sales velocity and volume</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-300">
              High Demand
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {velocity.fastMoving.map((item, idx) => (
              <div key={item.product_id} className="p-3 bg-white rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-extrabold text-slate-900">{item.product_name}</p>
                    <p className="text-[10px] text-slate-400">Stock left: {item.current_quantity} {item.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700 text-sm">+{item.units_sold} sold</span>
                  <p className="text-[10px] text-slate-400">₹{item.total_revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Poor / Slow Moving Card */}
        <Card className="p-5 sm:p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-amber-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {language === 'ta' ? 'மந்தமான விற்பனை / தேங்கிய இருப்பு' : 'Poor / Slow-Moving Stock (🐢)'}
                </h3>
                <p className="text-xs text-slate-500">Low turnover; capital tied up</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-300">
              Needs Push
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {velocity.slowMoving.map((item, idx) => (
              <div key={item.product_id} className="p-3 bg-white rounded-2xl border border-amber-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-extrabold text-slate-900">{item.product_name}</p>
                    <p className="text-[10px] text-amber-700 font-medium">{item.recommendation_ta}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-700 text-xs">{item.current_quantity} {item.unit} in stock</span>
                  <p className="text-[10px] text-amber-600 font-bold">0-1 sold</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {language === 'ta' ? 'சமீபத்திய விற்பனை பட்டியல்' : 'Recent Sales Transactions'}
            </h2>
            <p className="text-xs text-slate-500">Every voice and manual bill</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {sales.length} transactions
          </span>
        </div>

        {sales.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="font-semibold">No sales recorded yet today.</p>
            <p className="text-xs mt-1">Speak: “5 Coke sale panniten” to make your first sale!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => {
              const firstItem = sale.items[0];
              const isVoice = sale.source === 'VOICE';

              return (
                <div
                  key={sale.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                      ₹
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-extrabold text-slate-900">
                          {firstItem?.product_name || 'Item Sale'}
                        </h4>
                        {isVoice ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            🎙️ Voice
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            ✍️ Manual
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>
                          Quantity: <strong className="text-slate-800 font-bold">{sale.items_count} {firstItem?.unit || 'units'}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(sale.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">
                          {sale.payment_mode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:text-right pl-14 sm:pl-0">
                    <span className="text-xl font-black text-slate-900">
                      +₹{sale.total_amount}
                    </span>
                    {firstItem && (
                      <p className="text-[11px] text-slate-400">
                        @ ₹{firstItem.unit_price} each
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Record Manual Sale Modal */}
      <Modal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        title={language === 'ta' ? 'விற்பனை பதிவு செய்ய' : 'Record New Sale'}
        subtitle="Select item and quantity to bill"
        maxWidth="md"
      >
        <form onSubmit={handleRecordManualSale} className="space-y-4 pt-1">
          <Select
            label="Select Product"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.quantity} ${p.unit} in stock - ₹${p.selling_price})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity Sold"
              type="number"
              min="1"
              max={selectedProduct?.quantity || 999}
              value={saleQuantity}
              onChange={(e) => setSaleQuantity(Math.max(1, Number(e.target.value)))}
              required
            />

            <Select
              label="Payment Mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              options={[
                { value: 'UPI', label: 'UPI / GPay / PhonePe' },
                { value: 'CASH', label: 'Cash (ரொக்கம்)' },
                { value: 'CREDIT', label: 'Shop Credit (கடன்)' },
              ]}
            />
          </div>

          <Input
            label="Customer / Order Note (Optional)"
            placeholder="e.g. Regular customer"
            value={saleNote}
            onChange={(e) => setSaleNote(e.target.value)}
          />

          {/* Amount Preview Box */}
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-900">Total Billing Amount:</span>
            <span className="text-2xl font-black text-emerald-800">₹{estimatedAmount}</span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSaleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Confirm Sale
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
