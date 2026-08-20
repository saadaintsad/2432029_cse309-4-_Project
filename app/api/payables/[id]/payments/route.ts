import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { PAYMENT_METHODS } from "@/lib/constants";

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

  const amount = Number(body.amount);
  const method = typeof body.method === "string" ? body.method : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Payment amount must be greater than zero." },
      { status: 400 }
    );
  }
  if (!(PAYMENT_METHODS as readonly string[]).includes(method)) {
    return NextResponse.json(
      { error: "Method must be CASH, CHEQUE, or BANK." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc("record_payable_payment", {
    p_payable_id: params.id,
    p_amount: amount,
    p_method: method,
    p_note: note || null,
    p_recorded_by: session.sub,
  });

  if (error) {
    if (error.message.includes("PAYABLE_NOT_FOUND")) {
      return NextResponse.json({ error: "Payable not found." }, { status: 404 });
    }
    if (error.message.includes("PAYMENT_EXCEEDS_DUE")) {
      return NextResponse.json(
        { error: "Payment amount cannot exceed the outstanding due." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Could not record payment." }, { status: 500 });
  }

  return NextResponse.json({ result: data }, { status: 201 });
}
