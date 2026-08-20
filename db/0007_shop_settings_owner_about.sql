-- ==========================================
-- Shop Settings — owner name + "About Us" copy
-- ==========================================
-- Run once against the Supabase project (via the connection pooler).
-- Powers the customer-facing "About Us" modal on the landing page (spec:
-- admin-editable, so both fields live on shop_settings alongside the
-- existing shop_name/phone/address).

ALTER TABLE shop_settings
  ADD COLUMN IF NOT EXISTS owner_name TEXT NOT NULL DEFAULT 'Md. Rafiqul Islam',
  ADD COLUMN IF NOT EXISTS about_us TEXT NOT NULL DEFAULT 'For over a generation, New N Islam has supplied premium wholesale fabrics — Poplin, Voile, Linen, and Bexi Voile — from our showroom and warehouse in Islampur, Old Dhaka to retailers and garment businesses across Bangladesh. Every piece of cloth is quality-checked before it reaches our shelves, and every wholesale order is confirmed and fulfilled in person — the way business has always been done in Islampur.';
