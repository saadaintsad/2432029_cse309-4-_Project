import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

// Public endpoint — intentionally omits customer identity, financials, and
// any internal admin/supplier information (spec 6.4 / 28 / 75).
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id")?.trim();

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_id, status, order_source, total_than, total_amount, created_at, confirmed_at, delivered_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("variant, color, suta_count, qty_than, rate_per_than, total_amount")
    .eq("order_id", order.id);

  const { data: history } = await supabase
    .from("order_status_history")
    .select("status, created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    order: {
      order_id: order.order_id,
      status: order.status,
      order_source: order.order_source,
      total_than: order.total_than,
      total_amount: order.total_amount,
      created_at: order.created_at,
      confirmed_at: order.confirmed_at,
      delivered_at: order.delivered_at,
    },
    items,
    history,
  });
}
