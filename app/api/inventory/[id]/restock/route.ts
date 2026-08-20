import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const qtyAdded = Number(body.qty_added_than);
  const buyingPrice = Number(body.buying_price_per_than);
  const dyingCost = Number(body.dying_cost_per_than ?? 0);
  const paidAmount = Number(body.paid_amount ?? 0);
  const supplierName = typeof body.supplier_name === "string" ? body.supplier_name.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!Number.isFinite(qtyAdded) || qtyAdded <= 0) {
    return NextResponse.json(
      { error: "Quantity added must be greater than zero." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(buyingPrice) || buyingPrice < 0) {
    return NextResponse.json({ error: "Buying price cannot be negative." }, { status: 400 });
  }
  if (!Number.isFinite(dyingCost) || dyingCost < 0) {
    return NextResponse.json({ error: "Dying cost cannot be negative." }, { status: 400 });
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    return NextResponse.json({ error: "Paid amount cannot be negative." }, { status: 400 });
  }
  if (paidAmount > qtyAdded * (buyingPrice + dyingCost)) {
    return NextResponse.json(
      { error: "Paid amount cannot exceed the total cost." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc("restock_inventory", {
    p_inventory_id: params.id,
    p_qty_added: qtyAdded,
    p_buying_price: buyingPrice,
    p_dying_cost: dyingCost,
    p_paid_amount: paidAmount,
    p_supplier_name: supplierName || null,
    p_note: note || null,
  });

  if (error) {
    if (error.message.includes("INVENTORY_NOT_FOUND")) {
      return NextResponse.json({ error: "Inventory item not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not record restock." }, { status: 500 });
  }

  return NextResponse.json({ result: data }, { status: 201 });
}
