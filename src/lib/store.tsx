'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Product, 
  InventoryTransaction, 
  Sale, 
  Notification, 
  Shop, 
  Profile, 
  VoiceIntentResult, 
  DailySummaryData, 
  PaymentMode,
  StockStatus,
  StockVelocityInsights,
  StockVelocityItem
} from '@/types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SALES, 
  INITIAL_NOTIFICATIONS, 
  DEMO_SHOP, 
  DEMO_PROFILE 
} from '@/lib/demo-data';

const STORAGE_KEY = 'storemate_store_v2';

interface StoreMateContextType {
  products: Product[];
  transactions: InventoryTransaction[];
  sales: Sale[];
  notifications: Notification[];
  shop: Shop;
  profile: Profile;
  language: 'ta' | 'en' | 'tanglish';
  isVoiceModalOpen: boolean;
  lastVoiceResult: VoiceIntentResult | null;
  unreadNotificationsCount: number;
  
  // Actions
  setLanguage: (lang: 'ta' | 'en' | 'tanglish') => void;
  setVoiceModalOpen: (open: boolean) => void;
  setLastVoiceResult: (result: VoiceIntentResult | null) => void;
  
  // Inventory & Sales
  addStock: (productId: string, quantity: number, source?: 'VOICE' | 'MANUAL', note?: string) => Promise<{ success: boolean; message: string; balanceAfter: number }>;
  recordSale: (productId: string, quantity: number, paymentMode?: PaymentMode, source?: 'VOICE' | 'MANUAL', note?: string) => Promise<{ success: boolean; message: string; totalAmount: number; balanceAfter: number; isLowStock: boolean }>;
  addProduct: (product: Omit<Product, 'id' | 'shop_id' | 'created_at' | 'is_active'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  updateProductExpiry: (productId: string, expiryDate: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  
  // Shop & Profile
  updateShop: (updates: Partial<Shop>) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  resetDemoData: () => void;
  
  // Computations
  getProductStockStatus: (product: Product) => StockStatus;
  getProductExpiryDaysRemaining: (product: Product) => number | null;
  getStockVelocityInsights: () => StockVelocityInsights;
  getDailySummary: () => DailySummaryData;
}

const StoreMateContext = createContext<StoreMateContextType | null>(null);

export function StoreMateProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(INITIAL_TRANSACTIONS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [shop, setShop] = useState<Shop>(DEMO_SHOP);
  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE);
  const [language, setLanguageState] = useState<'ta' | 'en' | 'tanglish'>('tanglish');
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false);
  const [lastVoiceResult, setLastVoiceResult] = useState<VoiceIntentResult | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.shop) setShop(parsed.shop);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.language) setLanguageState(parsed.language);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          products,
          transactions,
          sales,
          notifications,
          shop,
          profile,
          language,
        })
      );
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
  }, [products, transactions, sales, notifications, shop, profile, language, isLoaded]);

  const setLanguage = (lang: 'ta' | 'en' | 'tanglish') => {
    setLanguageState(lang);
    setProfile((prev) => ({ ...prev, language_preference: lang }));
  };

  const getProductStockStatus = useCallback((product: Product): StockStatus => {
    if (product.quantity <= 0) return 'critical';
    if (product.quantity <= product.minimum_quantity) return 'low';
    return 'healthy';
  }, []);

  const getProductExpiryDaysRemaining = useCallback((product: Product): number | null => {
    if (!product.expiry_date) return null;
    const expiry = new Date(product.expiry_date).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  // Add Stock (Stock In)
  const addStock = useCallback(async (
    productId: string,
    quantity: number,
    source: 'VOICE' | 'MANUAL' = 'VOICE',
    note?: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, message: 'Product not found', balanceAfter: 0 };
    }

    const newQuantity = Number((product.quantity + quantity).toFixed(2));
    
    // 1. Update Product
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQuantity } : p))
    );

    // 2. Create Audit Transaction Record
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      shop_id: shop.id,
      product_id: product.id,
      product_name: product.name,
      type: 'IN',
      quantity,
      balance_after: newQuantity,
      source,
      note: note || (source === 'VOICE' ? `Voice stock entry (+${quantity} ${product.unit})` : `Manual restock (+${quantity} ${product.unit})`),
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: `Added ${quantity} ${product.unit} to ${product.name}. Current stock: ${newQuantity} ${product.unit}`,
      balanceAfter: newQuantity,
    };
  }, [products, shop.id]);

  // Record Sale & Automatic Low-Stock Trigger
  const recordSale = useCallback(async (
    productId: string,
    quantity: number,
    paymentMode: PaymentMode = 'UPI',
    source: 'VOICE' | 'MANUAL' = 'VOICE',
    note?: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, message: 'Product not found', totalAmount: 0, balanceAfter: 0, isLowStock: false };
    }

    const newQuantity = Number(Math.max(0, product.quantity - quantity).toFixed(2));
    const totalAmount = Number((product.selling_price * quantity).toFixed(2));

    // 1. Update Product
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQuantity } : p))
    );

    // 2. Create Inventory Transaction
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      shop_id: shop.id,
      product_id: product.id,
      product_name: product.name,
      type: 'OUT',
      quantity,
      balance_after: newQuantity,
      source: source === 'VOICE' ? 'VOICE' : 'SALE',
      note: note || (source === 'VOICE' ? `Voice sale (-${quantity} ${product.unit})` : `Sale record (-${quantity} ${product.unit})`),
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // 3. Create Sale Record
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      shop_id: shop.id,
      total_amount: totalAmount,
      items_count: quantity,
      payment_mode: paymentMode,
      source,
      customer_note: note,
      items: [
        {
          id: `item-${Date.now()}`,
          sale_id: `sale-${Date.now()}`,
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit: product.unit,
          unit_price: product.selling_price,
          total_price: totalAmount,
        },
      ],
      created_at: new Date().toISOString(),
    };
    setSales((prev) => [newSale, ...prev]);

    // 4. AUTOMATIC LOW-STOCK DETECTION
    const isLowStock = newQuantity <= product.minimum_quantity;
    if (isLowStock) {
      const isCritical = newQuantity === 0;
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        shop_id: shop.id,
        title: isCritical ? `Critical Stock: ${product.name}` : `Low Stock Alert: ${product.name}`,
        message: `${product.name} is down to ${newQuantity} ${product.unit}. Minimum required: ${product.minimum_quantity}. Restocking recommended.`,
        tamil_message: `🔴 ${product.name} கையிருப்பு ${newQuantity} ${product.unit} மட்டுமே உள்ளது! குறைந்தபட்ச தேவை: ${product.minimum_quantity}.`,
        type: isCritical ? 'CRITICAL_STOCK' : 'LOW_STOCK',
        product_id: product.id,
        product_name: product.name,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    return {
      success: true,
      message: `Sale recorded: ${quantity} ${product.unit} ${product.name} (₹${totalAmount})`,
      totalAmount,
      balanceAfter: newQuantity,
      isLowStock,
    };
  }, [products, shop.id]);

  // Add Product
  const addProduct = useCallback(async (
    data: Omit<Product, 'id' | 'shop_id' | 'created_at' | 'is_active'>
  ): Promise<Product> => {
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      shop_id: shop.id,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);

    if (newProduct.quantity > 0) {
      const initTx: InventoryTransaction = {
        id: `tx-${Date.now()}`,
        shop_id: shop.id,
        product_id: newProduct.id,
        product_name: newProduct.name,
        type: 'IN',
        quantity: newProduct.quantity,
        balance_after: newProduct.quantity,
        source: 'INITIAL',
        note: 'Initial inventory setup',
        created_at: new Date().toISOString(),
      };
      setTransactions((prev) => [initTx, ...prev]);
    }

    return newProduct;
  }, [shop.id]);

  // Update Product
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)));
  }, []);

  // Update Product Expiry Date
  const updateProductExpiry = useCallback(async (productId: string, expiryDate: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, expiry_date: expiryDate, updated_at: new Date().toISOString() } : p))
    );

    // Check if expiry date is within 30 days and alert
    const expiry = new Date(expiryDate).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const prod = products.find((p) => p.id === productId);

    if (prod && diffDays <= 30 && diffDays > 0) {
      const expNotif: Notification = {
        id: `notif-exp-${Date.now()}`,
        shop_id: shop.id,
        title: `Expiring Soon: ${prod.name}`,
        message: `${prod.name} will expire in ${diffDays} days (${expiryDate}). Plan clearance or front shelf placement.`,
        tamil_message: `⚠️ ${prod.name} இன்னும் ${diffDays} நாட்களில் காலாவதியாகிறது (${expiryDate})!`,
        type: 'EXPIRY_ALERT',
        product_id: prod.id,
        product_name: prod.name,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [expNotif, ...prev]);
    }
  }, [products, shop.id]);

  // Delete Product
  const deleteProduct = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateShop = useCallback((updates: Partial<Shop>) => {
    setShop((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSales(INITIAL_SALES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setShop(DEMO_SHOP);
    setProfile(DEMO_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  // STOCK VELOCITY INSIGHTS (Fast-Moving vs Poor/Slow-Moving Stock & Expiry)
  const getStockVelocityInsights = useCallback((): StockVelocityInsights => {
    // 1. Calculate sales per product
    const salesVolumeMap: Record<string, { unitsSold: number; revenue: number }> = {};
    for (const s of sales) {
      for (const item of s.items) {
        if (!salesVolumeMap[item.product_id]) {
          salesVolumeMap[item.product_id] = { unitsSold: 0, revenue: 0 };
        }
        salesVolumeMap[item.product_id].unitsSold += item.quantity;
        salesVolumeMap[item.product_id].revenue += item.total_price;
      }
    }

    // 2. Classify each product into velocity tiers
    const velocityItems: StockVelocityItem[] = products.map((p) => {
      const saleData = salesVolumeMap[p.id] || { unitsSold: 0, revenue: 0 };
      const isFast = saleData.unitsSold >= 5;
      const isPoor = saleData.unitsSold === 0 || (p.quantity > p.minimum_quantity * 2 && saleData.unitsSold <= 1);
      const velocity_status: 'FAST' | 'MODERATE' | 'POOR' = isFast ? 'FAST' : isPoor ? 'POOR' : 'MODERATE';

      let recTa = '';
      let recEn = '';
      if (isFast) {
        recTa = 'அதிக தேவை உள்ளது. போதிய இருப்பு இருப்பதை உறுதி செய்யவும்.';
        recEn = 'High customer demand. Keep optimal stock to avoid stockouts.';
      } else if (isPoor) {
        recTa = 'விற்பனை குறைவு. முன்பக்கம் வைக்கவும் அல்லது சலுகை வழங்கவும்.';
        recEn = 'Slow moving stock. Consider front shelf placement or bundle offers.';
      } else {
        recTa = 'நிலையான விற்பனை.';
        recEn = 'Healthy steady sales turnover.';
      }

      return {
        product_id: p.id,
        product_name: p.name,
        tamil_name: p.tamil_name,
        category: p.category,
        current_quantity: p.quantity,
        unit: p.unit,
        units_sold: saleData.unitsSold,
        total_revenue: saleData.revenue,
        velocity_status,
        recommendation_ta: recTa,
        recommendation_en: recEn,
      };
    });

    const fastMoving = velocityItems
      .filter((v) => v.velocity_status === 'FAST' || v.units_sold > 0)
      .sort((a, b) => b.units_sold - a.units_sold)
      .slice(0, 5);

    const slowMoving = velocityItems
      .filter((v) => v.velocity_status === 'POOR' || v.units_sold === 0)
      .sort((a, b) => b.current_quantity - a.current_quantity)
      .slice(0, 5);

    // 3. Expiring soon products
    const expiringSoon = products
      .map((p) => {
        const days = getProductExpiryDaysRemaining(p);
        return {
          product: p,
          daysRemaining: days ?? 9999,
          isExpired: days !== null && days <= 0,
        };
      })
      .filter((e) => e.daysRemaining <= 30)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return {
      fastMoving,
      slowMoving,
      expiringSoon,
    };
  }, [products, sales, getProductExpiryDaysRemaining]);

  // Daily Summary computation (calculated in real time)
  const getDailySummary = useCallback((): DailySummaryData => {
    const today = new Date().toISOString().split('T')[0];
    
    const todaySales = sales.filter((s) => s.created_at.startsWith(today) || true);
    const totalSales = todaySales.reduce((sum, s) => sum + s.total_amount, 0);
    const itemsSold = todaySales.reduce((sum, s) => sum + s.items_count, 0);

    const lowStockProducts = products.filter((p) => p.quantity <= p.minimum_quantity);
    const criticalStockProducts = products.filter((p) => p.quantity <= 0);

    const velocity = getStockVelocityInsights();

    // Priorities for tomorrow including restocks and expiring alerts
    const tomorrowPriorities: DailySummaryData['tomorrowPriorities'] = [
      ...lowStockProducts.map((p) => ({
        id: `prio-restock-${p.id}`,
        title: `Restock ${p.name} (Current: ${p.quantity} ${p.unit}, Min: ${p.minimum_quantity})`,
        tamil_title: `${p.name} மறுஆர்டர் செய்யவும் (இருப்பு: ${p.quantity} ${p.unit})`,
        type: 'RESTOCK' as const,
        severity: p.quantity === 0 ? ('HIGH' as const) : ('MEDIUM' as const),
        completed: false,
      })),
      ...velocity.expiringSoon.map((e) => ({
        id: `prio-exp-${e.product.id}`,
        title: `Clear expiring stock: ${e.product.name} (Expires in ${e.daysRemaining} days)`,
        tamil_title: `காலாவதியாகும் பொருள்: ${e.product.name} (இன்னும் ${e.daysRemaining} நாட்கள்)`,
        type: 'EXPIRY' as const,
        severity: e.daysRemaining <= 7 ? ('HIGH' as const) : ('MEDIUM' as const),
        completed: false,
      })),
    ];

    // Top selling products
    const productSalesMap: Record<string, { name: string; quantity: number; amount: number }> = {};
    for (const s of todaySales) {
      for (const item of s.items) {
        if (!productSalesMap[item.product_id]) {
          productSalesMap[item.product_id] = { name: item.product_name, quantity: 0, amount: 0 };
        }
        productSalesMap[item.product_id].quantity += item.quantity;
        productSalesMap[item.product_id].amount += item.total_price;
      }
    }

    const topSellingProducts = Object.entries(productSalesMap)
      .map(([id, val]) => ({
        product_id: id,
        product_name: val.name,
        quantity: val.quantity,
        total_amount: val.amount,
      }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 5);

    return {
      date: new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
      totalSales,
      itemsSold,
      transactionCount: todaySales.length,
      lowStockCount: lowStockProducts.length,
      criticalStockCount: criticalStockProducts.length,
      pendingActionsCount: tomorrowPriorities.length,
      topSellingProducts,
      lowStockProducts,
      fastMovingProducts: velocity.fastMoving,
      slowMovingProducts: velocity.slowMoving,
      expiringProducts: velocity.expiringSoon.map((e) => ({ product: e.product, daysRemaining: e.daysRemaining })),
      tomorrowPriorities,
    };
  }, [sales, products, getStockVelocityInsights]);

  return (
    <StoreMateContext.Provider
      value={{
        products,
        transactions,
        sales,
        notifications,
        shop,
        profile,
        language,
        isVoiceModalOpen,
        lastVoiceResult,
        unreadNotificationsCount,
        setLanguage,
        setVoiceModalOpen,
        setLastVoiceResult,
        addStock,
        recordSale,
        addProduct,
        updateProduct,
        updateProductExpiry,
        deleteProduct,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        updateShop,
        updateProfile,
        resetDemoData,
        getProductStockStatus,
        getProductExpiryDaysRemaining,
        getStockVelocityInsights,
        getDailySummary,
      }}
    >
      {children}
    </StoreMateContext.Provider>
  );
}

export function useStoreMate() {
  const context = useContext(StoreMateContext);
  if (!context) {
    throw new Error('useStoreMate must be used within a StoreMateProvider');
  }
  return context;
}
