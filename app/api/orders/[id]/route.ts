import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { getCustomerId, requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminSession = await requireAdmin(request);
  const customerId = adminSession ? null : await getCustomerId();

  if (!adminSession && !customerId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, customers(id, customer_id, name, phone, address, shop_name)")
    .eq("id", params.id)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (!adminSession && order.customer_id !== customerId) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", params.id);

  const { data: history } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", params.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ order, items, history });
}
