-- ==========================================
-- PHASE 2 — Inventory functions + RLS lockdown
-- ==========================================
-- Run once against the Supabase project (via the connection pooler — see
-- instruction/CURRENT_STATUS.md for why the direct db.*.supabase.co host
-- doesn't work from this network).

-- ------------------------------------------
-- restock_inventory
-- Atomically: logs the restock, bumps qty_than (and refreshes buying/dying
-- price on the inventory row per spec 7.2), records an INVENTORY expense,
-- and creates a payable if the restock wasn't fully paid.
-- ------------------------------------------
CREATE OR REPLACE FUNCTION restock_inventory(
    p_inventory_id UUID,
    p_qty_added NUMERIC,
    p_buying_price NUMERIC,
    p_dying_cost NUMERIC,
    p_paid_amount NUMERIC,
    p_supplier_name TEXT,
    p_note TEXT
) RETURNS JSON AS $$
DECLARE
    v_variant TEXT;
    v_color TEXT;
    v_suta_count INTEGER;
    v_total_cost NUMERIC;
    v_due_amount NUMERIC;
    v_restock_log_id UUID;
    v_expense_id UUID;
    v_payable_id UUID;
    v_status TEXT;
BEGIN
    IF p_qty_added IS NULL OR p_qty_added <= 0 THEN
        RAISE EXCEPTION 'qty_added must be positive' USING ERRCODE = '22023';
    END IF;
    IF p_paid_amount IS NULL OR p_paid_amount < 0 THEN
        RAISE EXCEPTION 'paid_amount cannot be negative' USING ERRCODE = '22023';
    END IF;

    SELECT variant, color, suta_count INTO v_variant, v_color, v_suta_count
    FROM inventory WHERE id = p_inventory_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INVENTORY_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    v_total_cost := p_qty_added * (p_buying_price + p_dying_cost);
    v_due_amount := v_total_cost - p_paid_amount;

    IF v_due_amount < 0 THEN
        RAISE EXCEPTION 'paid_amount cannot exceed total cost' USING ERRCODE = '22023';
    END IF;

    INSERT INTO inventory_restock_logs
        (inventory_id, qty_added_than, buying_price_per_than, dying_cost_per_than, total_cost, paid_amount, due_amount, supplier_name, note)
    VALUES
        (p_inventory_id, p_qty_added, p_buying_price, p_dying_cost, v_total_cost, p_paid_amount, v_due_amount, p_supplier_name, p_note)
    RETURNING id INTO v_restock_log_id;

    UPDATE inventory
    SET qty_than = qty_than + p_qty_added,
        buying_price_per_than = p_buying_price,
        dying_cost_per_than = p_dying_cost
    WHERE id = p_inventory_id;

    INSERT INTO expenses (category, description, amount, date, inventory_id, note)
    VALUES (
        'INVENTORY',
        v_variant || ' restock (' || v_color || ', suta ' || v_suta_count || ')',
        v_total_cost,
        CURRENT_DATE,
        p_inventory_id,
        p_note
    )
    RETURNING id INTO v_expense_id;

    IF v_due_amount > 0 THEN
        v_status := CASE WHEN p_paid_amount <= 0 THEN 'UNPAID' ELSE 'PARTIAL' END;
        INSERT INTO payables
            (description, party_name, total_amount, paid_amount, due_amount, status, inventory_id, restock_log_id)
        VALUES (
            v_variant || ' restock (' || v_color || ', suta ' || v_suta_count || ')',
            COALESCE(NULLIF(TRIM(p_supplier_name), ''), 'Unknown Supplier'),
            v_total_cost, p_paid_amount, v_due_amount, v_status, p_inventory_id, v_restock_log_id
        )
        RETURNING id INTO v_payable_id;
    END IF;

    RETURN json_build_object(
        'restock_log_id', v_restock_log_id,
        'expense_id', v_expense_id,
        'payable_id', v_payable_id,
        'total_cost', v_total_cost,
        'due_amount', v_due_amount
    );
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------
-- create_inventory_item
-- Creates a brand-new (variant, suta_count, color) catalog entry. If initial
-- qty_than > 0, immediately runs it through restock_inventory so the
-- acquisition is captured as an expense/payable just like any other restock.
-- Rejects if the identity combination already exists (spec: increase the
-- existing item's quantity via Restock instead of duplicating).
-- ------------------------------------------
CREATE OR REPLACE FUNCTION create_inventory_item(
    p_variant TEXT,
    p_color TEXT,
    p_suta_count INTEGER,
    p_qty_than NUMERIC,
    p_buying_price NUMERIC,
    p_dying_cost NUMERIC,
    p_selling_price NUMERIC,
    p_location TEXT,
    p_display BOOLEAN,
    p_paid_amount NUMERIC,
    p_supplier_name TEXT,
    p_note TEXT
) RETURNS JSON AS $$
DECLARE
    v_inventory_id UUID;
    v_restock_result JSON;
BEGIN
    IF EXISTS (
        SELECT 1 FROM inventory
        WHERE variant = p_variant AND suta_count = p_suta_count AND color = p_color
    ) THEN
        RAISE EXCEPTION 'DUPLICATE_INVENTORY_ITEM' USING ERRCODE = '23505';
    END IF;

    INSERT INTO inventory
        (variant, color, suta_count, qty_than, buying_price_per_than, dying_cost_per_than, selling_price_per_than, location, display)
    VALUES
        (p_variant, p_color, p_suta_count, 0, p_buying_price, p_dying_cost, p_selling_price, p_location, p_display)
    RETURNING id INTO v_inventory_id;

    IF p_qty_than > 0 THEN
        SELECT restock_inventory(v_inventory_id, p_qty_than, p_buying_price, p_dying_cost, p_paid_amount, p_supplier_name, p_note)
        INTO v_restock_result;
    END IF;

    RETURN json_build_object('inventory_id', v_inventory_id, 'restock', v_restock_result);
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------
-- RLS lockdown: every table in this app is only ever read/written through
-- Next.js API routes using the service role key (which bypasses RLS).
-- Enabling RLS with zero policies blocks the public anon key from touching
-- these tables directly over PostgREST, without affecting Supabase Auth
-- itself (which lives outside the public schema).
-- ------------------------------------------
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_restock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE payable_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_images ENABLE ROW LEVEL SECURITY;
