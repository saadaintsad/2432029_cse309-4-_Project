import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";

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

  const status = typeof body.status === "string" ? body.status : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // CONFIRMED is the critical transition — its own RPC handles the stock
  // re-check, price refresh, inventory deduction and customer financial
  // update atomically (spec 3.3 / 21 / Test 4 & 5).
  if (status === "CONFIRMED") {
    const { data, error } = await supabase.rpc("confirm_order", {
      p_order_id: params.id,
      p_changed_by: session.admin_id,
    });

    if (error) {
      if (error.message.includes("ORDER_NOT_FOUND")) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }
      if (error.message.includes("INSUFFICIENT_STOCK")) {
        return NextResponse.json(
          { error: error.message.replace("INSUFFICIENT_STOCK: ", "Insufficient stock — ") },
          { status: 409 }
        );
      }
      if (error.message.includes("INVALID_STATUS_TRANSITION")) {
        return NextResponse.json(
          { error: "Only an APPROVED request can be confirmed." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Could not confirm order." }, { status: 500 });
    }

    return NextResponse.json({ result: data });
  }

  const { data, error } = await supabase.rpc("transition_order_status", {
    p_order_id: params.id,
    p_new_status: status,
    p_changed_by: session.admin_id,
    p_note: note || null,
  });

  if (error) {
    if (error.message.includes("ORDER_NOT_FOUND")) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (error.message.includes("INVALID_STATUS_TRANSITION") || error.message.includes("USE_CONFIRM_ENDPOINT")) {
      return NextResponse.json(
        { error: "That status change isn't allowed from the order's current status." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not update order status." }, { status: 500 });
  }

  return NextResponse.json({ result: data });
}
