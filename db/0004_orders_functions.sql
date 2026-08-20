-- ==========================================
-- PHASE 4 — Orders functions
-- ==========================================
-- Run once against the Supabase project (via the connection pooler).
--
-- Four functions, each atomic (a single PostgREST RPC call is one transaction):
--   create_request        — customer submits an ONLINE request. PENDING only.
--                            No inventory/financial side effects (spec 3.3).
--   confirm_order         — APPROVED -> CONFIRMED. THE critical transition:
--                            re-checks stock, refreshes each item's price to
--                            the CURRENT selling price (spec 21/23 — the price
--                            captured is the price at confirmation time, not
--                            request time), deducts inventory, updates the
--                            customer's financial standing, all-or-nothing.
--   create_offline_order  — admin-authored order, CONFIRMED immediately,
--                            same stock-check + side-effect logic as confirm_order
--                            but for a fresh order instead of an existing request.
--   transition_order_status — every other transition (APPROVED, REJECTED,
--                            EXPIRED, ON_THE_WAY, DELIVERED). Enforces the
--                            state machine from spec section 80 and refuses
--                            'CONFIRMED' (that must go through confirm_order).

CREATE OR REPLACE FUNCTION create_request(
    p_customer_id UUID,
    p_inventory_id UUID,
    p_qty_than NUMERIC,
    p_note TEXT
) RETURNS JSON AS $$
DECLARE
    v_order_id UUID;
    v_human_order_id TEXT;
    v_variant TEXT;
    v_color TEXT;
    v_suta INTEGER;
    v_price NUMERIC;
    v_total NUMERIC;
BEGIN
    IF p_qty_than IS NULL OR p_qty_than < 1 THEN
        RAISE EXCEPTION 'Quantity must be at least 1 Than' USING ERRCODE = '22023';
    END IF;

    SELECT variant, color, suta_count, selling_price_per_than
    INTO v_variant, v_color, v_suta, v_price
    FROM inventory
    WHERE id = p_inventory_id AND display = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INVENTORY_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    v_total := p_qty_than * v_price;

    INSERT INTO orders (customer_id, order_source, status, total_than, total_amount, note)
    VALUES (p_customer_id, 'ONLINE', 'PENDING', p_qty_than, v_total, p_note)
    RETURNING id, order_id INTO v_order_id, v_human_order_id;

    INSERT INTO order_items (order_id, inventory_id, variant, color, suta_count, qty_than, rate_per_than, total_amount)
    VALUES (v_order_id, p_inventory_id, v_variant, v_color, v_suta, p_qty_than, v_price, v_total);

    INSERT INTO order_status_history (order_id, status, changed_by, note)
    VALUES (v_order_id, 'PENDING', 'CUSTOMER', NULL);

    RETURN json_build_object('order_id', v_human_order_id, 'total_amount', v_total);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION confirm_order(
    p_order_id UUID,
    p_changed_by TEXT
) RETURNS JSON AS $$
DECLARE
    v_customer_id UUID;
    v_status TEXT;
    v_human_order_id TEXT;
    v_item RECORD;
    v_current_qty NUMERIC;
    v_current_price NUMERIC;
    v_total_amount NUMERIC := 0;
    v_total_than NUMERIC := 0;
    v_insufficient TEXT[] := '{}';
BEGIN
    SELECT customer_id, status, order_id INTO v_customer_id, v_status, v_human_order_id
    FROM orders WHERE id = p_order_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ORDER_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;
    IF v_status <> 'APPROVED' THEN
        RAISE EXCEPTION 'INVALID_STATUS_TRANSITION: % -> CONFIRMED', v_status USING ERRCODE = '22023';
    END IF;

    -- Pass 1: lock every referenced inventory row and check stock for ALL
    -- items before changing anything, so a shortfall on one item leaves the
    -- whole order untouched (spec Test 5).
    FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id LOOP
        SELECT qty_than INTO v_current_qty FROM inventory WHERE id = v_item.inventory_id FOR UPDATE;
        IF NOT FOUND THEN
            v_insufficient := array_append(v_insufficient, v_item.variant || ' (' || v_item.color || ') — item no longer exists');
        ELSIF v_current_qty < v_item.qty_than THEN
            v_insufficient := array_append(
                v_insufficient,
                v_item.variant || ' (' || v_item.color || ', suta ' || v_item.suta_count || ') — need ' ||
                v_item.qty_than || ' Than, only ' || v_current_qty || ' available'
            );
        END IF;
    END LOOP;

    IF array_length(v_insufficient, 1) > 0 THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: %', array_to_string(v_insufficient, '; ') USING ERRCODE = '22023';
    END IF;

    -- Pass 2: refresh each item's price to the CURRENT selling price (spec
    -- 21/23 — confirmation-time price, not the estimate captured at request
    -- time) and deduct stock.
    FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id LOOP
        SELECT selling_price_per_than INTO v_current_price FROM inventory WHERE id = v_item.inventory_id;

        UPDATE order_items
        SET rate_per_than = v_current_price,
            total_amount = v_item.qty_than * v_current_price
        WHERE id = v_item.id;

        UPDATE inventory SET qty_than = qty_than - v_item.qty_than WHERE id = v_item.inventory_id;

        v_total_amount := v_total_amount + (v_item.qty_than * v_current_price);
        v_total_than := v_total_than + v_item.qty_than;
    END LOOP;

    UPDATE orders
    SET status = 'CONFIRMED',
        total_amount = v_total_amount,
        total_than = v_total_than,
        confirmed_at = now()
    WHERE id = p_order_id;

    INSERT INTO order_status_history (order_id, status, changed_by, note)
    VALUES (p_order_id, 'CONFIRMED', p_changed_by, NULL);

    UPDATE customers
    SET total_purchased = total_purchased + v_total_amount,
        due = due + v_total_amount,
        status = 'HAS_DUE'
    WHERE id = v_customer_id;

    RETURN json_build_object('order_id', v_human_order_id, 'total_amount', v_total_amount, 'total_than', v_total_than);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_offline_order(
    p_customer_id UUID,
    p_items JSON, -- [{ "inventory_id": "...", "qty_than": 5 }, ...]
    p_note TEXT,
    p_changed_by TEXT
) RETURNS JSON AS $$
DECLARE
    v_order_id UUID;
    v_human_order_id TEXT;
    v_item JSON;
    v_inventory_id UUID;
    v_qty NUMERIC;
    v_current_qty NUMERIC;
    v_price NUMERIC;
    v_variant TEXT;
    v_color TEXT;
    v_suta INTEGER;
    v_total_amount NUMERIC := 0;
    v_total_than NUMERIC := 0;
    v_insufficient TEXT[] := '{}';
BEGIN
    IF p_items IS NULL OR json_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'At least one item is required' USING ERRCODE = '22023';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_customer_id) THEN
        RAISE EXCEPTION 'CUSTOMER_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    -- Pass 1: validate quantities and lock/check stock for every item.
    FOR v_item IN SELECT * FROM json_array_elements(p_items) LOOP
        v_inventory_id := (v_item->>'inventory_id')::UUID;
        v_qty := (v_item->>'qty_than')::NUMERIC;

        IF v_qty IS NULL OR v_qty < 1 THEN
            RAISE EXCEPTION 'Quantity must be at least 1 Than' USING ERRCODE = '22023';
        END IF;

        SELECT qty_than INTO v_current_qty FROM inventory WHERE id = v_inventory_id FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'INVENTORY_NOT_FOUND' USING ERRCODE = 'P0002';
        END IF;
        IF v_current_qty < v_qty THEN
            v_insufficient := array_append(
                v_insufficient,
                v_inventory_id::TEXT || ' — need ' || v_qty || ' Than, only ' || v_current_qty || ' available'
            );
        END IF;
    END LOOP;

    IF array_length(v_insufficient, 1) > 0 THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: %', array_to_string(v_insufficient, '; ') USING ERRCODE = '22023';
    END IF;

    INSERT INTO orders (customer_id, order_source, status, total_than, total_amount, note, confirmed_at)
    VALUES (p_customer_id, 'OFFLINE', 'CONFIRMED', 0, 0, p_note, now())
    RETURNING id, order_id INTO v_order_id, v_human_order_id;

    -- Pass 2: create item snapshots at current price and deduct stock.
    FOR v_item IN SELECT * FROM json_array_elements(p_items) LOOP
        v_inventory_id := (v_item->>'inventory_id')::UUID;
        v_qty := (v_item->>'qty_than')::NUMERIC;

        SELECT variant, color, suta_count, selling_price_per_than
        INTO v_variant, v_color, v_suta, v_price
        FROM inventory WHERE id = v_inventory_id;

        INSERT INTO order_items (order_id, inventory_id, variant, color, suta_count, qty_than, rate_per_than, total_amount)
        VALUES (v_order_id, v_inventory_id, v_variant, v_color, v_suta, v_qty, v_price, v_qty * v_price);

        UPDATE inventory SET qty_than = qty_than - v_qty WHERE id = v_inventory_id;

        v_total_amount := v_total_amount + (v_qty * v_price);
        v_total_than := v_total_than + v_qty;
    END LOOP;

    UPDATE orders SET total_amount = v_total_amount, total_than = v_total_than WHERE id = v_order_id;

    INSERT INTO order_status_history (order_id, status, changed_by, note)
    VALUES (v_order_id, 'CONFIRMED', p_changed_by, 'Offline order');

    UPDATE customers
    SET total_purchased = total_purchased + v_total_amount,
        due = due + v_total_amount,
        status = 'HAS_DUE'
    WHERE id = p_customer_id;

    RETURN json_build_object('order_id', v_human_order_id, 'total_amount', v_total_amount, 'total_than', v_total_than);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION transition_order_status(
    p_order_id UUID,
    p_new_status TEXT,
    p_changed_by TEXT,
    p_note TEXT
) RETURNS JSON AS $$
DECLARE
    v_current_status TEXT;
    v_human_order_id TEXT;
BEGIN
    SELECT status, order_id INTO v_current_status, v_human_order_id
    FROM orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'ORDER_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    IF p_new_status = 'CONFIRMED' THEN
        RAISE EXCEPTION 'USE_CONFIRM_ENDPOINT' USING ERRCODE = '22023';
    END IF;

    IF NOT (
        (v_current_status = 'PENDING' AND p_new_status IN ('APPROVED', 'REJECTED')) OR
        (v_current_status = 'APPROVED' AND p_new_status = 'EXPIRED') OR
        (v_current_status = 'CONFIRMED' AND p_new_status = 'ON_THE_WAY') OR
        (v_current_status = 'ON_THE_WAY' AND p_new_status = 'DELIVERED')
    ) THEN
        RAISE EXCEPTION 'INVALID_STATUS_TRANSITION: % -> %', v_current_status, p_new_status USING ERRCODE = '22023';
    END IF;

    UPDATE orders
    SET status = p_new_status,
        delivered_at = CASE WHEN p_new_status = 'DELIVERED' THEN now() ELSE delivered_at END
    WHERE id = p_order_id;

    INSERT INTO order_status_history (order_id, status, changed_by, note)
    VALUES (p_order_id, p_new_status, p_changed_by, p_note);

    RETURN json_build_object('order_id', v_human_order_id, 'status', p_new_status);
END;
$$ LANGUAGE plpgsql;
