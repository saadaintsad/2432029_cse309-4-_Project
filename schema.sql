-- ==========================================
-- NEW N ISLAM SHOP MANAGEMENT SYSTEM SCHEMA
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and sequences if they exist (clean slate)
DROP TABLE IF EXISTS landing_images CASCADE;
DROP TABLE IF EXISTS shop_settings CASCADE;
DROP TABLE IF EXISTS cash_memos CASCADE;
DROP TABLE IF EXISTS color_slips CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS payable_payments CASCADE;
DROP TABLE IF EXISTS payables CASCADE;
DROP TABLE IF EXISTS customer_payments CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory_restock_logs CASCADE;
DROP TABLE IF EXISTS inventory_images CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

DROP SEQUENCE IF EXISTS admin_id_seq;
DROP SEQUENCE IF EXISTS customer_id_seq;
DROP SEQUENCE IF EXISTS order_id_seq;
DROP SEQUENCE IF EXISTS payable_id_seq;
DROP SEQUENCE IF EXISTS slip_id_seq;
DROP SEQUENCE IF EXISTS memo_id_seq;

-- Sequences for ID formatting
CREATE SEQUENCE admin_id_seq START WITH 1;
CREATE SEQUENCE customer_id_seq START WITH 1;
CREATE SEQUENCE order_id_seq START WITH 1;
CREATE SEQUENCE payable_id_seq START WITH 1;
CREATE SEQUENCE slip_id_seq START WITH 1;
CREATE SEQUENCE memo_id_seq START WITH 1;

-- 1. admins
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT UNIQUE DEFAULT 'ADM-' || lpad(nextval('admin_id_seq')::text, 3, '0'),
    username TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    must_change_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT UNIQUE DEFAULT 'CUST-' || lpad(nextval('customer_id_seq')::text, 3, '0'),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    password_hash TEXT, -- Managed by Supabase Auth, but kept for reference/custom auth if needed
    shop_name TEXT,
    email TEXT,
    total_purchased NUMERIC DEFAULT 0,
    total_paid NUMERIC DEFAULT 0,
    due NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'ALL_CLEAR' CHECK (status IN ('ALL_CLEAR', 'HAS_DUE')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant TEXT NOT NULL,
    color TEXT NOT NULL,
    suta_count INTEGER NOT NULL CHECK (suta_count >= 10 AND suta_count <= 120),
    qty_than NUMERIC DEFAULT 0 NOT NULL CHECK (qty_than >= 0),
    buying_price_per_than NUMERIC NOT NULL CHECK (buying_price_per_than >= 0),
    dying_cost_per_than NUMERIC DEFAULT 0 NOT NULL CHECK (dying_cost_per_than >= 0),
    selling_price_per_than NUMERIC NOT NULL CHECK (selling_price_per_than >= 0),
    location TEXT NOT NULL,
    display BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_inventory_combination UNIQUE (variant, suta_count, color)
);

-- 4. inventory_images
CREATE TABLE inventory_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. inventory_restock_logs
CREATE TABLE inventory_restock_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE RESTRICT NOT NULL,
    qty_added_than NUMERIC NOT NULL CHECK (qty_added_than > 0),
    buying_price_per_than NUMERIC NOT NULL CHECK (buying_price_per_than >= 0),
    dying_cost_per_than NUMERIC DEFAULT 0 CHECK (dying_cost_per_than >= 0),
    total_cost NUMERIC NOT NULL CHECK (total_cost >= 0),
    paid_amount NUMERIC DEFAULT 0 CHECK (paid_amount >= 0),
    due_amount NUMERIC NOT NULL CHECK (due_amount >= 0),
    supplier_name TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE DEFAULT 'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_id_seq')::text, 3, '0'),
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
    order_source TEXT NOT NULL CHECK (order_source IN ('ONLINE', 'OFFLINE')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'CONFIRMED', 'ON_THE_WAY', 'DELIVERED', 'REJECTED', 'EXPIRED')),
    total_than NUMERIC DEFAULT 0 NOT NULL CHECK (total_than >= 0),
    total_amount NUMERIC DEFAULT 0 NOT NULL CHECK (total_amount >= 0),
    note TEXT,
    confirmed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    inventory_id UUID REFERENCES inventory(id) ON DELETE RESTRICT NOT NULL,
    variant TEXT NOT NULL,
    color TEXT NOT NULL,
    suta_count INTEGER NOT NULL,
    qty_than NUMERIC NOT NULL CHECK (qty_than >= 1),
    rate_per_than NUMERIC NOT NULL CHECK (rate_per_than >= 0),
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0)
);

-- 8. order_status_history
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    changed_by TEXT NOT NULL, -- admin_id, 'CUSTOMER', or 'SYSTEM'
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. customer_payments
CREATE TABLE customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL CHECK (method IN ('CASH', 'CHEQUE', 'BANK')),
    note TEXT,
    recorded_by UUID REFERENCES admins(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. payables
CREATE TABLE payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payable_id TEXT UNIQUE DEFAULT 'PAY-' || lpad(nextval('payable_id_seq')::text, 3, '0'),
    description TEXT NOT NULL,
    party_name TEXT NOT NULL,
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    paid_amount NUMERIC DEFAULT 0 NOT NULL CHECK (paid_amount >= 0),
    due_amount NUMERIC NOT NULL CHECK (due_amount >= 0),
    status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PARTIAL', 'PAID')),
    inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
    restock_log_id UUID REFERENCES inventory_restock_logs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. payable_payments
CREATE TABLE payable_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payable_id UUID REFERENCES payables(id) ON DELETE RESTRICT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL CHECK (method IN ('CASH', 'CHEQUE', 'BANK')),
    note TEXT,
    recorded_by UUID REFERENCES admins(id) ON DELETE RESTRICT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('RENT', 'SALARY', 'UTILITY', 'INVENTORY', 'OTHER')),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. color_slips
CREATE TABLE color_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slip_id TEXT UNIQUE DEFAULT 'SLIP-' || lpad(nextval('slip_id_seq')::text, 3, '0'),
    inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
    variant TEXT NOT NULL,
    total_qty_than NUMERIC NOT NULL CHECK (total_qty_than > 0),
    colors TEXT NOT NULL,
    ratio TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. cash_memos
CREATE TABLE cash_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memo_id TEXT UNIQUE DEFAULT 'MEMO-' || lpad(nextval('memo_id_seq')::text, 3, '0'),
    order_id UUID REFERENCES orders(id) ON DELETE RESTRICT NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
    customer_name TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    paid_amount NUMERIC NOT NULL,
    due_amount NUMERIC NOT NULL,
    generated_by UUID REFERENCES admins(id) ON DELETE RESTRICT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. shop_settings (Single-row restraint table)
CREATE TABLE shop_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000' CHECK (id = '00000000-0000-0000-0000-000000000000'),
    shop_name TEXT NOT NULL DEFAULT 'New N Islam',
    phone TEXT NOT NULL DEFAULT '01711280943',
    address TEXT NOT NULL DEFAULT 'Islampur, Old Dhaka',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. landing_images
CREATE TABLE landing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS Policies (For now, allow public read on settings and inventory display = true)
-- In production, policies should block write access without proper auth.
-- Here we create indexes for optimization.
CREATE INDEX idx_inventory_variant_color ON inventory(variant, color);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ==========================================
-- SEED DATA
-- ==========================================
-- Seed data (initial admin, shop_settings) is inserted separately via
-- scripts/seed.mjs using the service role key, so real bcrypt hashes
-- are generated at seed time rather than hardcoded here.
