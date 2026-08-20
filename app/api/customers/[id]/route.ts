import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (customerError || !customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("customer_payments")
    .select("id, amount, method, note, order_id, created_at")
    .eq("customer_id", params.id)
    .order("created_at", { ascending: false });

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, order_id, status, order_source, total_amount, created_at")
    .eq("customer_id", params.id)
    .order("created_at", { ascending: false });

  if (paymentsError || ordersError) {
    return NextResponse.json(
      { error: "Could not load customer history." },
      { status: 500 }
    );
  }

  return NextResponse.json({ customer, payments, orders });
}
