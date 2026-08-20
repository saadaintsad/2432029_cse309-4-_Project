import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { getShopSettings } from "@/lib/shop-settings";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cash_memos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load cash memos." }, { status: 500 });
  }

  return NextResponse.json({ cash_memos: data });
}

/** Cash Memo is purely a document — spec 3.3/3.4/45: generating it must NOT
 * touch inventory, orders, or the customer ledger. It only reads an existing
 * CONFIRMED order and records the printed paid/due values (display only). */
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const orderId = typeof body.order_id === "string" ? body.order_id : "";
  const paidAmount = Number(body.paid_amount);
  const dueAmount = Number(body.due_amount);

  if (!orderId) {
    return NextResponse.json({ error: "Order is required." }, { status: 400 });
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    return NextResponse.json({ error: "Paid amount cannot be negative." }, { status: 400 });
  }
  if (!Number.isFinite(dueAmount) || dueAmount < 0) {
    return NextResponse.json({ error: "Due amount cannot be negative." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_id, status, total_amount, customer_id, customers(name)")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "CONFIRMED" && order.status !== "ON_THE_WAY" && order.status !== "DELIVERED") {
    return NextResponse.json(
      { error: "Cash Memo can only be generated for a confirmed order." },
      { status: 400 }
    );
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("variant, color, qty_than, rate_per_than, total_amount")
    .eq("order_id", order.id);

  const customerName = (order.customers as unknown as { name: string } | null)?.name ?? "";

  const { data: memo, error: memoError } = await supabase
    .from("cash_memos")
    .insert({
      order_id: order.id,
      customer_id: order.customer_id,
      customer_name: customerName,
      total_amount: order.total_amount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
      generated_by: session.sub,
    })
    .select("*")
    .single();

  if (memoError || !memo) {
    return NextResponse.json({ error: "Could not create cash memo." }, { status: 500 });
  }

  const shopSettings = await getShopSettings();

  return NextResponse.json(
    {
      memo,
      order: { order_id: order.order_id },
      items,
      shop_settings: shopSettings,
    },
    { status: 201 }
  );
}
