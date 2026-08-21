import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { normalizeVariant } from "@/lib/utils";

const PUBLIC_FIELDS =
  "id, variant, color, suta_count, qty_than, selling_price_per_than, created_at, inventory_images(id, image_url)";
const ADMIN_FIELDS =
  "id, variant, color, suta_count, qty_than, buying_price_per_than, dying_cost_per_than, selling_price_per_than, location, display, created_at, inventory_images(id, image_url)";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  const isAdmin = !!session;

  const { searchParams } = request.nextUrl;
  const variant = searchParams.get("variant")?.trim();
  const color = searchParams.get("color")?.trim();
  const location = searchParams.get("location")?.trim();

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("inventory")
    .select(isAdmin ? ADMIN_FIELDS : PUBLIC_FIELDS)
    .order("variant", { ascending: true })
    .order("color", { ascending: true });

  if (!isAdmin) {
    query = query.eq("display", true);
  }
  if (variant) query = query.ilike("variant", `%${variant}%`);
  if (color && color.toLowerCase() !== "all") query = query.ilike("color", `%${color}%`);
  if (isAdmin && location) query = query.ilike("location", `%${location}%`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Could not load inventory." }, { status: 500 });
  }

  return NextResponse.json({ inventory: data });
}

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

  const variant =
    typeof body.variant === "string" ? normalizeVariant(body.variant) : "";
  const color = typeof body.color === "string" ? body.color.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const supplierName = typeof body.supplier_name === "string" ? body.supplier_name.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  const sutaCount = Number(body.suta_count);
  const qtyThan = Number(body.qty_than ?? 0);
  const buyingPrice = Number(body.buying_price_per_than);
  const dyingCost = Number(body.dying_cost_per_than ?? 0);
  const sellingPrice = Number(body.selling_price_per_than);
  const paidAmount = Number(body.paid_amount ?? 0);
  const display = body.display !== false;

  if (!variant) return NextResponse.json({ error: "Variant is required." }, { status: 400 });
  if (!color) return NextResponse.json({ error: "Color is required." }, { status: 400 });
  if (!location) return NextResponse.json({ error: "Location is required." }, { status: 400 });
  if (!Number.isInteger(sutaCount) || sutaCount < 10 || sutaCount > 120) {
    return NextResponse.json(
      { error: "Suta count must be a whole number between 10 and 120." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(qtyThan) || qtyThan < 0) {
    return NextResponse.json({ error: "Quantity cannot be negative." }, { status: 400 });
  }
  if (!Number.isFinite(buyingPrice) || buyingPrice < 0) {
    return NextResponse.json({ error: "Buying price cannot be negative." }, { status: 400 });
  }
  if (!Number.isFinite(dyingCost) || dyingCost < 0) {
    return NextResponse.json({ error: "Dying cost cannot be negative." }, { status: 400 });
  }
  if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
    return NextResponse.json({ error: "Selling price cannot be negative." }, { status: 400 });
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    return NextResponse.json({ error: "Paid amount cannot be negative." }, { status: 400 });
  }
  if (qtyThan > 0 && paidAmount > qtyThan * (buyingPrice + dyingCost)) {
    return NextResponse.json(
      { error: "Paid amount cannot exceed the total cost." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc("create_inventory_item", {
    p_variant: variant,
    p_color: color,
    p_suta_count: sutaCount,
    p_qty_than: qtyThan,
    p_buying_price: buyingPrice,
    p_dying_cost: dyingCost,
    p_selling_price: sellingPrice,
    p_location: location,
    p_display: display,
    p_paid_amount: paidAmount,
    p_supplier_name: supplierName || null,
    p_note: note || null,
  });

  if (error) {
    if (error.message.includes("DUPLICATE_INVENTORY_ITEM")) {
      return NextResponse.json(
        {
          error:
            "An item with this Variant + Suta Count + Color already exists. Use Restock to add quantity to it instead.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not create inventory item." }, { status: 500 });
  }

  return NextResponse.json({ result: data }, { status: 201 });
}
