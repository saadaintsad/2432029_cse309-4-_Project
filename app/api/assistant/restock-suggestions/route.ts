import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

const WINDOW_DAYS = 90;

// Business Assistant is pure statistics over existing data — spec 7.8/84:
// it only ever reads and recommends, never mutates inventory, price, or orders.
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const cutoff = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory")
    .select("id, variant, color, suta_count, qty_than, location");

  const { data: recentOrders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .in("status", ["CONFIRMED", "ON_THE_WAY", "DELIVERED"])
    .gte("confirmed_at", cutoff);

  if (inventoryError || ordersError) {
    return NextResponse.json({ error: "Could not load restock suggestions." }, { status: 500 });
  }

  const recentOrderIds = (recentOrders ?? []).map((o) => o.id);

  let items: { inventory_id: string; qty_than: number; order_id: string }[] = [];
  if (recentOrderIds.length > 0) {
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("inventory_id, qty_than, order_id")
      .in("order_id", recentOrderIds);

    if (itemsError) {
      return NextResponse.json({ error: "Could not load restock suggestions." }, { status: 500 });
    }
    items = orderItems ?? [];
  }

  const ordersByItem = new Map<string, Set<string>>();
  const qtySoldByItem = new Map<string, number>();
  for (const item of items) {
    if (!ordersByItem.has(item.inventory_id)) ordersByItem.set(item.inventory_id, new Set());
    ordersByItem.get(item.inventory_id)!.add(item.order_id);
    qtySoldByItem.set(item.inventory_id, (qtySoldByItem.get(item.inventory_id) ?? 0) + item.qty_than);
  }

  const scored = (inventory ?? []).map((inv) => {
    const ordersCount90Days = ordersByItem.get(inv.id)?.size ?? 0;
    const qtySold90Days = qtySoldByItem.get(inv.id) ?? 0;
    const depletionRate = qtySold90Days / WINDOW_DAYS;
    const score = ordersCount90Days * 0.7 + depletionRate * 0.3;

    return {
      inventory_id: inv.id,
      variant: inv.variant,
      color: inv.color,
      suta_count: inv.suta_count,
      current_stock: inv.qty_than,
      location: inv.location,
      orders_count_90_days: ordersCount90Days,
      qty_sold_90_days: qtySold90Days,
      depletion_rate: depletionRate,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({ suggestions: scored.slice(0, 5), window_days: WINDOW_DAYS });
}
