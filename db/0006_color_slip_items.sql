-- ==========================================
-- Color Slip multi-item redesign
-- ==========================================
-- Run once against the Supabase project (via the connection pooler).
--
-- A Color Slip is now a document HEADER (id, slip_id, note, created_at) with
-- one or more line items (variant, colors, qty_than, ratio) in a related
-- table — same normalized pattern as orders/order_items rather than a JSON
-- blob column, for consistency with the rest of the schema and so future
-- features (e.g. Business Assistant demand queries) can query line items
-- directly.

CREATE TABLE IF NOT EXISTS color_slip_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    color_slip_id UUID REFERENCES color_slips(id) ON DELETE CASCADE NOT NULL,
    variant TEXT NOT NULL,
    colors TEXT NOT NULL,
    qty_than NUMERIC NOT NULL CHECK (qty_than > 0),
    ratio TEXT,
    line_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Preserve any existing single-item color_slips rows as their first line item
-- before dropping the now-obsolete header columns.
INSERT INTO color_slip_items (color_slip_id, variant, colors, qty_than, ratio, line_order)
SELECT id, variant, colors, total_qty_than, ratio, 0
FROM color_slips
WHERE NOT EXISTS (
    SELECT 1 FROM color_slip_items WHERE color_slip_items.color_slip_id = color_slips.id
);

ALTER TABLE color_slips DROP COLUMN IF EXISTS inventory_id;
ALTER TABLE color_slips DROP COLUMN IF EXISTS variant;
ALTER TABLE color_slips DROP COLUMN IF EXISTS colors;
ALTER TABLE color_slips DROP COLUMN IF EXISTS ratio;
-- total_qty_than stays on the header as a summary — now the sum of all line items.

ALTER TABLE color_slip_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_color_slip_items_slip_id ON color_slip_items(color_slip_id);

-- ------------------------------------------
-- create_color_slip
-- Atomically creates the header + all line items. Validates each item
-- (variant, colors, qty > 0) and enforces "ratio required when more than one
-- color is listed" server-side, not just in the UI.
-- ------------------------------------------
CREATE OR REPLACE FUNCTION create_color_slip(
    p_items JSON, -- [{ "variant": "...", "colors": "...", "qty_than": 5, "ratio": "..." }, ...]
    p_note TEXT
) RETURNS JSON AS $$
DECLARE
    v_slip_id UUID;
    v_human_slip_id TEXT;
    v_item JSON;
    v_colors TEXT;
    v_ratio TEXT;
    v_total_qty NUMERIC := 0;
    v_idx INTEGER := 0;
BEGIN
    IF p_items IS NULL OR json_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'At least one line item is required' USING ERRCODE = '22023';
    END IF;

    FOR v_item IN SELECT * FROM json_array_elements(p_items) LOOP
        IF NULLIF(TRIM(v_item->>'variant'), '') IS NULL THEN
            RAISE EXCEPTION 'Each item needs a variant' USING ERRCODE = '22023';
        END IF;

        v_colors := TRIM(v_item->>'colors');
        IF NULLIF(v_colors, '') IS NULL THEN
            RAISE EXCEPTION 'Each item needs at least one color' USING ERRCODE = '22023';
        END IF;

        IF (v_item->>'qty_than') IS NULL OR (v_item->>'qty_than')::NUMERIC <= 0 THEN
            RAISE EXCEPTION 'Each item needs a quantity greater than zero' USING ERRCODE = '22023';
        END IF;

        v_ratio := NULLIF(TRIM(v_item->>'ratio'), '');
        IF position(',' IN v_colors) > 0 AND v_ratio IS NULL THEN
            RAISE EXCEPTION 'Ratio is required when more than one color is entered' USING ERRCODE = '22023';
        END IF;

        v_total_qty := v_total_qty + (v_item->>'qty_than')::NUMERIC;
    END LOOP;

    INSERT INTO color_slips (total_qty_than, note)
    VALUES (v_total_qty, p_note)
    RETURNING id, slip_id INTO v_slip_id, v_human_slip_id;

    FOR v_item IN SELECT * FROM json_array_elements(p_items) LOOP
        INSERT INTO color_slip_items (color_slip_id, variant, colors, qty_than, ratio, line_order)
        VALUES (
            v_slip_id,
            TRIM(v_item->>'variant'),
            TRIM(v_item->>'colors'),
            (v_item->>'qty_than')::NUMERIC,
            NULLIF(TRIM(v_item->>'ratio'), ''),
            v_idx
        );
        v_idx := v_idx + 1;
    END LOOP;

    RETURN json_build_object('color_slip_id', v_slip_id, 'slip_id', v_human_slip_id, 'total_qty_than', v_total_qty);
END;
$$ LANGUAGE plpgsql;
