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
    .from("color_slips")
    .select("*, color_slip_items(id, variant, colors, qty_than, ratio, line_order)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load color slips." }, { status: 500 });
  }

  return NextResponse.json({ color_slips: data });
}

interface ColorSlipItemInput {
  variant?: unknown;
  colors?: unknown;
  qty_than?: unknown;
  ratio?: unknown;
}

/** Color Slip is purely a document — spec 3.3/47: it never touches inventory,
 * orders, customer financials, or the ledger. One slip now holds multiple
 * line items (one per variant/color group), stored in color_slip_items. */
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

  const rawItems = Array.isArray(body.items) ? (body.items as ColorSlipItemInput[]) : [];
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (rawItems.length === 0) {
    return NextResponse.json({ error: "At least one line item is required." }, { status: 400 });
  }

  const items = [];
  for (let idx = 0; idx < rawItems.length; idx++) {
    const raw = rawItems[idx];
    const variant = typeof raw.variant === "string" ? raw.variant.trim() : "";
    const colors = typeof raw.colors === "string" ? raw.colors.trim() : "";
    const qtyThan = Number(raw.qty_than);
    const ratio = typeof raw.ratio === "string" ? raw.ratio.trim() : "";
    const colorCount = colors.split(",").map((c) => c.trim()).filter(Boolean).length;

    if (!variant) {
      return NextResponse.json({ error: `Row ${idx + 1}: variant is required.` }, { status: 400 });
    }
    if (!colors || colorCount === 0) {
      return NextResponse.json(
        { error: `Row ${idx + 1}: at least one color is required.` },
        { status: 400 }
      );
    }
    if (!Number.isFinite(qtyThan) || qtyThan <= 0) {
      return NextResponse.json(
        { error: `Row ${idx + 1}: quantity must be greater than zero.` },
        { status: 400 }
      );
    }
    if (colorCount > 1 && !ratio) {
      return NextResponse.json(
        { error: `Row ${idx + 1}: ratio is required when multiple colors are entered.` },
        { status: 400 }
      );
    }

    items.push({ variant, colors, qty_than: qtyThan, ratio: ratio || null });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc("create_color_slip", {
    p_items: items,
    p_note: note || null,
  });

  if (error) {
    return NextResponse.json({ error: "Could not create color slip." }, { status: 500 });
  }

  const shopSettings = await getShopSettings();

  return NextResponse.json(
    {
      slip: { slip_id: data.slip_id, note: note || null, total_qty_than: data.total_qty_than },
      items,
      shop_settings: shopSettings,
    },
    { status: 201 }
  );
}
