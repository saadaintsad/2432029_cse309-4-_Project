import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

const SLOW_MOVING_THRESHOLD_DAYS = 60;
const HEAVY_DISCOUNT_THRESHOLD_DAYS = 90;

// Discount bands from spec 7.8: 60-90 days -> 5-10% off, 90+ days -> 15-20%
// off. Never suggest a price below own cost (buying + dying per Than) unless
// the business explicitly allows loss-selling — spec 55.
function discountBand(daysSinceLastSale: number | null) {
  if (daysSinceLastSale === null || daysSinceLastSale >= HEAVY_DISCOUNT_THRESHOLD_DAYS) {
    return { min_percent: 15, max_percent: 20 };
  }
  return { min_percent: 5, max_percent: 10 };
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory")
    .select(
      "id, variant, color, suta_count, qty_than, buying_price_per_than, dying_cost_per_than, selling_price_per_than"
    )
    .gt("qty_than", 0);

  if (inventoryError || !inventory) {
    return NextResponse.json({ error: "Could not load slow-moving stock." }, { status: 500 });
  }

  const { data: soldItems, error: soldError } = await supabase
    .from("order_items")
    .select("inventory_id, orders!inner(confirmed_at, status)")
    .in("orders.status", ["CONFIRMED", "ON_THE_WAY", "DELIVERED"]);

  if (soldError) {
    return NextResponse.json({ error: "Could not load slow-moving stock." }, { status: 500 });
  }

  const lastSaleByItem = new Map<string, string>();
  for (const row of soldItems ?? []) {
    const confirmedAt = (row as unknown as { orders: { confirmed_at: string | null } }).orders
      ?.confirmed_at;
    if (!confirmedAt) continue;
    const existing = lastSaleByItem.get(row.inventory_id);
    if (!existing || confirmedAt > existing) {
      lastSaleByItem.set(row.inventory_id, confirmedAt);
    }
  }

  const now = Date.now();
  const slowMoving = inventory
    .map((inv) => {
      const lastSale = lastSaleByItem.get(inv.id) ?? null;
      const daysSinceLastSale = lastSale
        ? Math.floor((now - new Date(lastSale).getTime()) / (24 * 60 * 60 * 1000))
        : null;
      return { inv, lastSale, daysSinceLastSale };
    })
    .filter(({ daysSinceLastSale }) => daysSinceLastSale === null || daysSinceLastSale >= SLOW_MOVING_THRESHOLD_DAYS)
    .map(({ inv, lastSale, daysSinceLastSale }) => {
      const ownCost = inv.buying_price_per_than + inv.dying_cost_per_than;
      const { min_percent, max_percent } = discountBand(daysSinceLastSale);

      const rawMinPrice = inv.selling_price_per_than * (1 - max_percent / 100);
      const rawMaxPrice = inv.selling_price_per_than * (1 - min_percent / 100);
      const suggestedMinPrice = Math.max(rawMinPrice, ownCost);
      const suggestedMaxPrice = Math.max(rawMaxPrice, ownCost);
      const cappedByCost = rawMinPrice < ownCost;

      return {
        inventory_id: inv.id,
        variant: inv.variant,
        color: inv.color,
        suta_count: inv.suta_count,
        current_stock: inv.qty_than,
        selling_price_per_than: inv.selling_price_per_than,
        own_cost_per_than: ownCost,
        last_sale_at: lastSale,
        days_since_last_sale: daysSinceLastSale,
        suggested_discount_min_percent: min_percent,
        suggested_discount_max_percent: max_percent,
        suggested_price_min: Math.round(suggestedMinPrice * 100) / 100,
        suggested_price_max: Math.round(suggestedMaxPrice * 100) / 100,
        capped_by_own_cost: cappedByCost,
      };
    })
    .sort((a, b) => (b.days_since_last_sale ?? Infinity) - (a.days_since_last_sale ?? Infinity));

  return NextResponse.json({
    slow_moving: slowMoving,
    threshold_days: SLOW_MOVING_THRESHOLD_DAYS,
  });
}
