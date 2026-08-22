'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  History, 
  ArrowDownRight, 
  ArrowUpRight,
  Sparkles,
  Edit2,
  Trash2,
  AlertTriangle,
  Check,
  Calendar,
  Clock
} from 'lucide-react';
import { useNammaKadai } from '@/lib/store';
import { Product, ProductUnit } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge, StockStatusBadge } from '@/components/ui/Badge';

export default function InventoryPage() {
  const { 
    products, 
    transactions, 
    addProduct, 
    updateProduct, 
    updateProductExpiry,
    deleteProduct, 
    addStock, 
    getProductStockStatus,
    getProductExpiryDaysRemaining,
    language 
  } = useNammaKadai();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null);

  // Expiry Date Edit Modal State
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [editingExpiryProduct, setEditingExpiryProduct] = useState<Product | null>(null);
  const [selectedExpiryDate, setSelectedExpiryDate] = useState<string>('');

  // New Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductTamilName, setNewProductTamilName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('General');
  const [newProductQuantity, setNewProductQuantity] = useState<number>(10);
  const [newProductUnit, setNewProductUnit] = useState<ProductUnit>('packet');
  const [newProductMinQty, setNewProductMinQty] = useState<number>(5);
  const [newProductSellingPrice, setNewProductSellingPrice] = useState<number>(20);
  const [newProductPurchasePrice, setNewProductPurchasePrice] = useState<number>(15);
  const [newProductExpiryDate, setNewProductExpiryDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tamil_name && p.tamil_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    setIsSubmitting(true);
    try {
      await addProduct({
        name: newProductName.trim(),
        tamil_name: newProductTamilName.trim() || undefined,
        category: newProductCategory,
        quantity: Number(newProductQuantity),
        unit: newProductUnit,
        minimum_quantity: Number(newProductMinQty),
        selling_price: Number(newProductSellingPrice),
        purchase_price: Number(newProductPurchasePrice),
        expiry_date: newProductExpiryDate || undefined,
      });

      // Reset form
      setNewProductName('');
      setNewProductTamilName('');
      setNewProductQuantity(10);
      setNewProductMinQty(5);
      setNewProductSellingPrice(20);
      setNewProductPurchasePrice(15);
      setNewProductExpiryDate('');
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHistory = (product: Product) => {
    setSelectedProductHistory(product);
    setIsHistoryModalOpen(true);
  };

  const handleOpenExpiryModal = (product: Product) => {
    setEditingExpiryProduct(product);
    setSelectedExpiryDate(product.expiry_date || '');
    setIsExpiryModalOpen(true);
  };

  const handleSaveExpiryDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpiryProduct || !selectedExpiryDate) return;

    await updateProductExpiry(editingExpiryProduct.id, selectedExpiryDate);
    setIsExpiryModalOpen(false);
    setEditingExpiryProduct(null);
  };

  const handleRestockFive = async (product: Product) => {
    await addStock(product.id, 5, 'MANUAL', 'Quick restock (+5)');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ta' ? 'சரக்கு இருப்பு விவரம்' : 'Inventory Management'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {products.length} {language === 'ta' ? 'பொருட்கள் பதிவு செய்யப்பட்டுள்ளது' : 'products tracked in your shop'}
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
          size="lg"
          className="shadow-sm"
        >
          {language === 'ta' ? 'புதிய பொருள் சேர்க்க' : 'Add New Product'}
        </Button>
      </div>

      {/* Search & Category Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder={language === 'ta' ? 'பொருள் பெயர் அல்லது வகை தேடவும்...' : 'Search products by name or category...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all touch-active ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? (language === 'ta' ? 'அனைத்தும்' : 'All Items') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'ta' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No products found'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery
                ? 'Try searching with a different keyword or category.'
                : 'Start by saying: “20 kilo rice வந்திருக்கு” in voice mode, or add manually!'}
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Add First Product
          </Button>
        </Card>
      ) : (
        /* Product Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const status = getProductStockStatus(product);
            const isLow = status === 'low';
            const isCritical = status === 'critical';
            const daysRemaining = getProductExpiryDaysRemaining(product);
            const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
            const isExpired = daysRemaining !== null && daysRemaining <= 0;

            return (
              <Card
                key={product.id}
                className={`p-5 flex flex-col justify-between transition-all hover:border-slate-300 ${
                  isCritical
                    ? 'bg-rose-50/30 border-rose-200'
                    : isLow
                    ? 'bg-amber-50/30 border-amber-200'
                    : isExpiringSoon
                    ? 'bg-amber-50/20 border-amber-200'
                    : 'bg-white'
                }`}
              >
                <div>
                  {/* Top row: Status Badge & Category */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isExpiringSoon && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {daysRemaining}d left
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                          Expired
                        </span>
                      )}
                      <StockStatusBadge status={status} language={language} />
                    </div>
                  </div>

                  {/* Product Names */}
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                    {product.name}
                  </h3>
                  {product.tamil_name && (
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                      {product.tamil_name}
                    </p>
                  )}

                  {/* Quantity & Unit Box */}
                  <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Current Stock</span>
                      <p className="text-2xl font-black text-slate-900">
                        {product.quantity}{' '}
                        <span className="text-sm font-semibold text-slate-500">
                          {product.unit}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-medium">Min Required</span>
                      <p className="text-sm font-bold text-slate-700">
                        {product.minimum_quantity} {product.unit}
                      </p>
                    </div>
                  </div>

                  {/* Prices & Expiry Row */}
                  <div className="space-y-1 text-xs font-medium text-slate-600 mb-4 px-1">
                    <div className="flex items-center justify-between">
                      <span>
                        Selling Price: <strong className="text-slate-900 text-sm font-bold">₹{product.selling_price}</strong>
                      </span>
                      <span className="text-slate-400">
                        Cost: ₹{product.purchase_price}
                      </span>
                    </div>

                    {/* Expiry Date row with update button */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Expiry:</span>
                        <strong className={isExpiringSoon ? 'text-amber-700 font-bold' : isExpired ? 'text-rose-700 font-bold' : 'text-slate-700'}>
                          {product.expiry_date || 'Not set'}
                        </strong>
                      </span>

                      <button
                        onClick={() => handleOpenExpiryModal(product)}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Update Expiry</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenHistory(product)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    <span>Audit Log</span>
                  </button>

                  <Button
                    size="sm"
                    variant={isLow || isCritical ? 'primary' : 'outline'}
                    onClick={() => handleRestockFive(product)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="text-xs font-bold h-9"
                  >
                    +5 Restock
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={language === 'ta' ? 'புதிய பொருள் சேர்க்க' : 'Add New Product'}
        subtitle="Add a new item to your shop inventory"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name (English)"
              placeholder="e.g. Britannia Good Day 100g"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              required
            />
            <Input
              label="Tamil Name (optional)"
              placeholder="e.g. குட் டே பிஸ்கட்"
              value={newProductTamilName}
              onChange={(e) => setNewProductTamilName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={newProductCategory}
              onChange={(e) => setNewProductCategory(e.target.value)}
              options={[
                { value: 'General', label: 'General / Miscellaneous' },
                { value: 'Grains & Staples', label: 'Grains & Staples (அரிசி/தானியங்கள்)' },
                { value: 'Cooking Essentials', label: 'Cooking Essentials (எண்ணெய்/உப்பு)' },
                { value: 'Snacks & Biscuits', label: 'Snacks & Biscuits (பிஸ்கட்)' },
                { value: 'Cold Drinks & Beverages', label: 'Cold Drinks & Beverages (பானங்கள்)' },
                { value: 'Pulses & Dals', label: 'Pulses & Dals (பருப்பு வகைகள்)' },
                { value: 'Chocolates & Confectionery', label: 'Chocolates & Confectionery (சாக்லேட்)' },
                { value: 'Personal Care', label: 'Personal Care (சோப்பு/ஷாம்பு)' },
              ]}
            />

            <Select
              label="Unit of Measurement"
              value={newProductUnit}
              onChange={(e) => setNewProductUnit(e.target.value as ProductUnit)}
              options={[
                { value: 'packet', label: 'packet (பாக்கெட்)' },
                { value: 'bottle', label: 'bottle (பாட்டில்)' },
                { value: 'kg', label: 'kg (கிலோ)' },
                { value: 'g', label: 'g (கிராம்)' },
                { value: 'liter', label: 'liter (லிட்டர்)' },
                { value: 'piece', label: 'piece (எண்ணிக்கை)' },
                { value: 'bag', label: 'bag (மூட்டை/பை)' },
                { value: 'box', label: 'box (பெட்டி)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input
              label="Initial Stock"
              type="number"
              min="0"
              value={newProductQuantity}
              onChange={(e) => setNewProductQuantity(Number(e.target.value))}
              required
            />
            <Input
              label="Min Alert Stock"
              type="number"
              min="1"
              value={newProductMinQty}
              onChange={(e) => setNewProductMinQty(Number(e.target.value))}
              required
            />
            <Input
              label="Batch Expiry Date"
              type="date"
              value={newProductExpiryDate}
              onChange={(e) => setNewProductExpiryDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Selling Price (₹)"
              type="number"
              min="0"
              value={newProductSellingPrice}
              onChange={(e) => setNewProductSellingPrice(Number(e.target.value))}
              required
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              min="0"
              value={newProductPurchasePrice}
              onChange={(e) => setNewProductPurchasePrice(Number(e.target.value))}
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Expiry Date Modal */}
      <Modal
        isOpen={isExpiryModalOpen}
        onClose={() => setIsExpiryModalOpen(false)}
        title={`Update Expiry Date: ${editingExpiryProduct?.name || ''}`}
        subtitle="Set batch expiry date for inventory tracking and alerts"
        maxWidth="md"
      >
        <form onSubmit={handleSaveExpiryDate} className="space-y-4 pt-1">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <p className="text-sm font-bold text-slate-900">{editingExpiryProduct?.name}</p>
            <p className="text-xs text-slate-500">
              Current Stock: <strong>{editingExpiryProduct?.quantity} {editingExpiryProduct?.unit}</strong>
            </p>
          </div>

          <Input
            label="Product Expiry Date (காலாவதி தேதி)"
            type="date"
            value={selectedExpiryDate}
            onChange={(e) => setSelectedExpiryDate(e.target.value)}
            required
          />

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpiryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Save Expiry Date
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transaction History / Audit Log Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Audit Log: ${selectedProductHistory?.name || ''}`}
        subtitle="Every stock movement is permanently recorded"
        maxWidth="lg"
      >
        <div className="space-y-3 pt-2">
          {selectedProductHistory && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span>Current Stock: <strong>{selectedProductHistory.quantity} {selectedProductHistory.unit}</strong></span>
              <span>Min Required: <strong>{selectedProductHistory.minimum_quantity} {selectedProductHistory.unit}</strong></span>
            </div>
          )}

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {transactions
              .filter((tx) => !selectedProductHistory || tx.product_id === selectedProductHistory.id)
              .map((tx) => {
                const isStockIn = tx.type === 'IN';
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isStockIn ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {isStockIn ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{tx.note || (isStockIn ? 'Stock In' : 'Stock Out')}</p>
                        <span className="text-[11px] text-slate-400">
                          {new Date(tx.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })} • {tx.source}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-black ${isStockIn ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {isStockIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">Bal: {tx.balance_after}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
