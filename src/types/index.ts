export type StockStatus = 'healthy' | 'low' | 'critical';

export type ProductUnit = 'packet' | 'bottle' | 'kg' | 'g' | 'liter' | 'ml' | 'piece' | 'bag' | 'box';

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  tamil_name?: string;
  category: string;
  quantity: number;
  unit: ProductUnit | string;
  minimum_quantity: number;
  selling_price: number;
  purchase_price: number;
  expiry_date?: string; // YYYY-MM-DD format
  barcode?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUST';
export type TransactionSource = 'VOICE' | 'MANUAL' | 'INITIAL' | 'SALE' | 'RETURN';

export interface InventoryTransaction {
  id: string;
  shop_id: string;
  product_id: string;
  product_name: string;
  type: TransactionType;
  quantity: number;
  balance_after: number;
  source: TransactionSource;
  note?: string;
  created_at: string;
}

export type PaymentMode = 'CASH' | 'UPI' | 'CREDIT' | 'OTHER';

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: string;
  shop_id: string;
  total_amount: number;
  items_count: number;
  payment_mode: PaymentMode;
  source: 'VOICE' | 'MANUAL';
  customer_note?: string;
  items: SaleItem[];
  created_at: string;
}

export type NotificationType = 'LOW_STOCK' | 'CRITICAL_STOCK' | 'SALE' | 'DAILY_SUMMARY' | 'EXPIRY_ALERT' | 'SYSTEM';

export interface Notification {
  id: string;
  shop_id: string;
  title: string;
  message: string;
  tamil_message?: string;
  type: NotificationType;
  product_id?: string;
  product_name?: string;
  is_read: boolean;
  created_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  business_type: string;
  address?: string;
  phone?: string;
  currency: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  language_preference: 'ta' | 'en' | 'tanglish';
  created_at: string;
}

export type VoiceAction = 
  | 'ADD_STOCK' 
  | 'RECORD_SALE' 
  | 'CHECK_STOCK' 
  | 'LOW_STOCK_REPORT' 
  | 'FAST_MOVING_REPORT'
  | 'SLOW_MOVING_REPORT'
  | 'EXPIRY_REPORT'
  | 'NEED_CLARIFICATION'
  | 'UNKNOWN';

export interface PendingContext {
  action: VoiceAction;
  product_id?: string;
  product_name?: string;
  unit?: string;
  unit_price?: number;
  original_transcript: string;
}

export interface VoiceIntentResult {
  action: VoiceAction;
  product: string;
  quantity: number;
  unit?: string;
  unit_price?: number;
  total_price?: number;
  raw_transcription: string;
  reasoning: string;
  confidence: number;
  tamil_confirmation: string;
  english_confirmation: string;
  matched_product_id?: string;
  matched_product?: Product;
  // Low-confidence & Clarification fields
  needs_clarification?: boolean;
  missing_field?: 'quantity' | 'product' | 'action';
  clarification_prompt_ta?: string;
  clarification_prompt_en?: string;
  pending_context?: PendingContext;
  // Direct query response for read-only queries
  is_read_only?: boolean;
  query_response_data?: any;
}

export interface StockVelocityItem {
  product_id: string;
  product_name: string;
  tamil_name?: string;
  category: string;
  current_quantity: number;
  unit: string;
  units_sold: number;
  total_revenue: number;
  velocity_status: 'FAST' | 'MODERATE' | 'POOR';
  days_without_sale?: number;
  recommendation_ta: string;
  recommendation_en: string;
}

export interface StockVelocityInsights {
  fastMoving: StockVelocityItem[];
  slowMoving: StockVelocityItem[];
  expiringSoon: {
    product: Product;
    daysRemaining: number;
    isExpired: boolean;
  }[];
}

export interface DailySummaryData {
  date: string;
  totalSales: number;
  itemsSold: number;
  transactionCount: number;
  lowStockCount: number;
  criticalStockCount: number;
  pendingActionsCount: number;
  topSellingProducts: {
    product_id: string;
    product_name: string;
    quantity: number;
    total_amount: number;
  }[];
  lowStockProducts: Product[];
  fastMovingProducts: StockVelocityItem[];
  slowMovingProducts: StockVelocityItem[];
  expiringProducts: { product: Product; daysRemaining: number }[];
  tomorrowPriorities: {
    id: string;
    title: string;
    tamil_title: string;
    type: 'RESTOCK' | 'CHECK' | 'SETTLE' | 'EXPIRY';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    completed: boolean;
  }[];
}
