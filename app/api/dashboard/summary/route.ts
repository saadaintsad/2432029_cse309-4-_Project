import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

// Built last, per spec 7.1 — pulls real data from every module that already
// exists rather than introducing any dashboard-only business logic.
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const [
    { data: inventory, error: inventoryError },
    { data: customers, error: customersError },
    { data: payables, error: payablesError },
    { data: recentOrders, error: ordersError },
    { count: pendingCount, error: pendingError },
    { data: recentPayments, error: paymentsError },
  ] = await Promise.all([
    supabase.from("inventory").select("qty_than"),
    supabase.from("customers").select("due"),
    supabase.from("payables").select("due_amount, status"),
    supabase
      .from("orders")
      .select("id, order_id, status, order_source, total_amount, created_at, customers(name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase
      .from("customer_payments")
      .select("id, amount, method, created_at, customers(name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (
    inventoryError ||
    customersError ||
    payablesError ||
    ordersError ||
    pendingError ||
    paymentsError
  ) {
    return NextResponse.json({ error: "Could not load dashboard data." }, { status: 500 });
  }

  const totalStock = (inventory ?? []).reduce((sum, i) => sum + i.qty_than, 0);
  const totalCustomerReceivables = (customers ?? []).reduce((sum, c) => sum + c.due, 0);
  const totalPayablesDue = (payables ?? [])
    .filter((p) => p.status !== "PAID")
    .reduce((sum, p) => sum + p.due_amount, 0);

  return NextResponse.json({
    total_stock: totalStock,
    total_customer_receivables: totalCustomerReceivables,
    total_payables_due: totalPayablesDue,
    pending_requests_count: pendingCount ?? 0,
    recent_orders: recentOrders,
    recent_payments: recentPayments,
  });
}
