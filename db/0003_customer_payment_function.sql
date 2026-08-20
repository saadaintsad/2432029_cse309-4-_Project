-- ==========================================
-- PHASE 3 — Customer payment recording function
-- ==========================================
-- Run once against the Supabase project (via the connection pooler).

-- Atomically: inserts the customer_payments row, increases total_paid,
-- decreases due, and recalculates status. Rejects payments that would
-- overpay (spec 79: payment should not normally exceed outstanding due).
CREATE OR REPLACE FUNCTION record_customer_payment(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_order_id UUID,
    p_method TEXT,
    p_note TEXT,
    p_recorded_by UUID
) RETURNS JSON AS $$
DECLARE
    v_due NUMERIC;
    v_payment_id UUID;
    v_new_due NUMERIC;
    v_new_status TEXT;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'amount must be positive' USING ERRCODE = '22023';
    END IF;

    SELECT due INTO v_due FROM customers WHERE id = p_customer_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'CUSTOMER_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    IF p_amount > v_due THEN
        RAISE EXCEPTION 'PAYMENT_EXCEEDS_DUE' USING ERRCODE = '22023';
    END IF;

    INSERT INTO customer_payments (customer_id, order_id, amount, method, note, recorded_by)
    VALUES (p_customer_id, p_order_id, p_amount, p_method, p_note, p_recorded_by)
    RETURNING id INTO v_payment_id;

    v_new_due := v_due - p_amount;
    v_new_status := CASE WHEN v_new_due <= 0 THEN 'ALL_CLEAR' ELSE 'HAS_DUE' END;

    UPDATE customers
    SET total_paid = total_paid + p_amount,
        due = v_new_due,
        status = v_new_status
    WHERE id = p_customer_id;

    RETURN json_build_object('payment_id', v_payment_id, 'due', v_new_due, 'status', v_new_status);
END;
$$ LANGUAGE plpgsql;
