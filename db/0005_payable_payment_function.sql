-- ==========================================
-- PHASE 5 — Payable payment recording function
-- ==========================================
-- Run once against the Supabase project (via the connection pooler).

-- Atomically: inserts the payable_payments row, increases paid_amount,
-- decreases due_amount, and recalculates status (UNPAID/PARTIAL/PAID).
-- Rejects payments that would overpay (same rule as customer payments).
CREATE OR REPLACE FUNCTION record_payable_payment(
    p_payable_id UUID,
    p_amount NUMERIC,
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

    SELECT due_amount INTO v_due FROM payables WHERE id = p_payable_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'PAYABLE_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    IF p_amount > v_due THEN
        RAISE EXCEPTION 'PAYMENT_EXCEEDS_DUE' USING ERRCODE = '22023';
    END IF;

    INSERT INTO payable_payments (payable_id, amount, method, note, recorded_by)
    VALUES (p_payable_id, p_amount, p_method, p_note, p_recorded_by)
    RETURNING id INTO v_payment_id;

    v_new_due := v_due - p_amount;
    v_new_status := CASE WHEN v_new_due <= 0 THEN 'PAID' ELSE 'PARTIAL' END;

    UPDATE payables
    SET paid_amount = paid_amount + p_amount,
        due_amount = v_new_due,
        status = v_new_status
    WHERE id = p_payable_id;

    RETURN json_build_object('payment_id', v_payment_id, 'due_amount', v_new_due, 'status', v_new_status);
END;
$$ LANGUAGE plpgsql;
