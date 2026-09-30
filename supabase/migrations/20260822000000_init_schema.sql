-- ==========================================================
-- StoreMate (நம்ம கடை) - Database Schema Migration
-- Production-ready PostgreSQL schema with RLS & Triggers
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Shop Owners & Staff)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    language_preference TEXT DEFAULT 'ta' CHECK (language_preference IN ('ta', 'en', 'tanglish')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    business_type TEXT NOT NULL DEFAULT 'Kirana Store',
    address TEXT,
    phone TEXT,
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tamil_name TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT NOT NULL DEFAULT 'packet',
    minimum_quantity NUMERIC(12, 2) NOT NULL DEFAULT 5,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (purchase_price >= 0),
    expiry_date DATE, -- Product batch expiration date
    barcode TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. INVENTORY TRANSACTIONS TABLE (Audit log - Every stock change creates a record)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUST')),
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    balance_after NUMERIC(12, 2) NOT NULL,
    source TEXT NOT NULL DEFAULT 'VOICE' CHECK (source IN ('VOICE', 'MANUAL', 'INITIAL', 'SALE', 'RETURN')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SALES & SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    items_count INTEGER NOT NULL DEFAULT 1,
    payment_mode TEXT NOT NULL DEFAULT 'CASH' CHECK (payment_mode IN ('CASH', 'UPI', 'CREDIT', 'OTHER')),
    source TEXT NOT NULL DEFAULT 'VOICE' CHECK (source IN ('VOICE', 'MANUAL')),
    customer_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    tamil_message TEXT,
    type TEXT NOT NULL CHECK (type IN ('LOW_STOCK', 'CRITICAL_STOCK', 'SALE', 'DAILY_SUMMARY', 'EXPIRY_ALERT', 'SYSTEM')),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id);

CREATE POLICY "Owners can manage their shops" 
ON public.shops FOR ALL 
USING (owner_id = auth.uid());

CREATE POLICY "Shop owners can manage products" 
ON public.products FOR ALL 
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

CREATE POLICY "Shop owners can view transactions" 
ON public.inventory_transactions FOR ALL 
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

CREATE POLICY "Shop owners can manage sales" 
ON public.sales FOR ALL 
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

CREATE POLICY "Shop owners can view notifications" 
ON public.notifications FOR ALL 
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- ==========================================================
-- AUTOMATIC LOW-STOCK NOTIFICATION TRIGGER
-- ==========================================================

CREATE OR REPLACE FUNCTION public.check_product_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity <= NEW.minimum_quantity THEN
        INSERT INTO public.notifications (
            shop_id,
            product_id,
            type,
            title,
            message,
            tamil_message
        ) VALUES (
            NEW.shop_id,
            NEW.id,
            CASE WHEN NEW.quantity = 0 THEN 'CRITICAL_STOCK' ELSE 'LOW_STOCK' END,
            'Low Stock Alert: ' || NEW.name,
            NEW.name || ' is down to ' || NEW.quantity || ' ' || NEW.unit || '. Minimum required: ' || NEW.minimum_quantity || '. Restocking recommended.',
            '🔴 ' || NEW.name || ' கையிருப்பு ' || NEW.quantity || ' ' || NEW.unit || ' மட்டுமே உள்ளது. குறைந்தபட்சம்: ' || NEW.minimum_quantity || '.'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_check_low_stock
AFTER UPDATE OF quantity ON public.products
FOR EACH ROW
WHEN (NEW.quantity <= NEW.minimum_quantity AND (OLD.quantity IS DISTINCT FROM NEW.quantity))
EXECUTE FUNCTION public.check_product_low_stock();

-- ==========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_products_shop_id ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_expiry ON public.products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_transactions_shop_product ON public.inventory_transactions(shop_id, product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_shop_date ON public.sales(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_shop_unread ON public.notifications(shop_id, is_read, created_at DESC);
