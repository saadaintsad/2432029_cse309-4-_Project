import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { getCustomerId, requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";
import { createWalkInCustomer } from "@/lib/customers";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const orderSource = searchParams.get("order_source");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("orders")
    .select(
      "id, order_id, order_source, status, total_than, total_amount, created_at, confirmed_at, delivered_at, customers(id, customer_id, name, phone)"
    )
    .order("created_at", { ascending: false });

  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    query = query.eq("status", status);
  }
  if (orderSource === "ONLINE" || orderSource === "OFFLINE") {
    query = query.eq("order_source", orderSource);
  }
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}

export async function POST(request: NextRequest) {
  const adminSession = await requireAdmin(request);
  const customerId = adminSession ? null : await getCustomerId();

  if (!adminSession && !customerId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // ---- Customer flow: submit an ONLINE request (single item, PENDING). ----
  if (!adminSession) {
    const inventoryId = typeof body.inventory_id === "string" ? body.inventory_id : "";
    const qtyThan = Number(body.qty_than);
    const note = typeof body.note === "string" ? body.note.trim() : "";

    if (!inventoryId) {
      return NextResponse.json({ error: "Item is required." }, { status: 400 });
    }
    if (!Number.isFinite(qtyThan) || qtyThan < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1 Than." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("create_request", {
      p_customer_id: customerId,
      p_inventory_id: inventoryId,
      p_qty_than: qtyThan,
      p_note: note || null,
    });

    if (error) {
      if (error.message.includes("INVENTORY_NOT_FOUND")) {
        return NextResponse.json({ error: "Item not found." }, { status: 404 });
      }
      return NextResponse.json({ error: "Could not submit request." }, { status: 500 });
    }

    return NextResponse.json({ result: data }, { status: 201 });
  }

  // ---- Admin flow: create an OFFLINE order (multi-item, CONFIRMED immediately). ----
  const items = Array.isArray(body.items) ? body.items : [];
  const note = typeof body.note === "string" ? body.note.trim() : "";
  let targetCustomerId = typeof body.customer_id === "string" ? body.customer_id : "";

  if (items.length === 0) {
    return NextResponse.json({ error: "At least one item is required." }, { status: 400 });
  }
  for (const item of items) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Record<string, unknown>).inventory_id !== "string" ||
      !Number.isFinite(Number((item as Record<string, unknown>).qty_than)) ||
      Number((item as Record<string, unknown>).qty_than) < 1
    ) {
      return NextResponse.json(
        { error: "Each item needs a valid inventory_id and a quantity of at least 1 Than." },
        { status: 400 }
      );
    }
  }

  if (!targetCustomerId) {
    const newCustomer = body.new_customer as Record<string, unknown> | undefined;
    if (!newCustomer || typeof newCustomer.name !== "string" || !newCustomer.name.trim()) {
      return NextResponse.json(
        { error: "Select an existing customer or provide new customer details." },
        { status: 400 }
      );
    }

    const createResult = await createWalkInCustomer(newCustomer);
    if (!createResult.ok) {
      return NextResponse.json({ error: createResult.error }, { status: createResult.status });
    }
    targetCustomerId = createResult.customer.id;
  }

  const { data, error } = await supabase.rpc("create_offline_order", {
    p_customer_id: targetCustomerId,
    p_items: items.map((i) => ({
      inventory_id: (i as Record<string, unknown>).inventory_id,
      qty_than: Number((i as Record<string, unknown>).qty_than),
    })),
    p_note: note || null,
    p_changed_by: adminSession.admin_id,
  });

  if (error) {
    if (error.message.includes("CUSTOMER_NOT_FOUND")) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }
    if (error.message.includes("INVENTORY_NOT_FOUND")) {
      return NextResponse.json({ error: "One of the selected items was not found." }, { status: 404 });
    }
    if (error.message.includes("INSUFFICIENT_STOCK")) {
      return NextResponse.json(
        { error: error.message.replace("INSUFFICIENT_STOCK: ", "Insufficient stock — ") },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }

  return NextResponse.json({ result: data }, { status: 201 });
}
