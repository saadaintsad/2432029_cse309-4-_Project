import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { storagePathFromPublicUrl } from "@/lib/utils";

const PUBLIC_FIELDS =
  "id, variant, color, suta_count, qty_than, selling_price_per_than, created_at, inventory_images(id, image_url)";
const ADMIN_FIELDS =
  "id, variant, color, suta_count, qty_than, buying_price_per_than, dying_cost_per_than, selling_price_per_than, location, display, created_at, inventory_images(id, image_url)";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin(request);
  const isAdmin = !!session;

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("inventory")
    .select(isAdmin ? ADMIN_FIELDS : PUBLIC_FIELDS)
    .eq("id", params.id);

  if (!isAdmin) query = query.eq("display", true);

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({ item: data });
}

const EDITABLE_FIELDS = ["selling_price_per_than", "location", "display"] as const;

export async function PATCH(
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

  const disallowedKeys = Object.keys(body).filter(
    (key) => !(EDITABLE_FIELDS as readonly string[]).includes(key)
  );
  if (disallowedKeys.length > 0) {
    return NextResponse.json(
      {
        error: `Cannot edit: ${disallowedKeys.join(", ")}. Variant, Suta Count and Color are fixed once created; quantity and cost change only through Restock.`,
      },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {};

  if ("selling_price_per_than" in body) {
    const sellingPrice = Number(body.selling_price_per_than);
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
      return NextResponse.json(
        { error: "Selling price cannot be negative." },
        { status: 400 }
      );
    }
    update.selling_price_per_than = sellingPrice;
  }

  if ("location" in body) {
    const location = typeof body.location === "string" ? body.location.trim() : "";
    if (!location) {
      return NextResponse.json({ error: "Location is required." }, { status: 400 });
    }
    update.location = location;
  }

  if ("display" in body) {
    update.display = body.display === true;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("inventory")
    .update(update)
    .eq("id", params.id)
    .select(ADMIN_FIELDS)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Could not update item." }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const { data: images } = await supabase
    .from("inventory_images")
    .select("image_url")
    .eq("inventory_id", params.id);

  if (images && images.length > 0) {
    const paths = images
      .map((img) => storagePathFromPublicUrl(img.image_url, "inventory-images"))
      .filter((p): p is string => !!p);
    if (paths.length > 0) {
      await supabase.storage.from("inventory-images").remove(paths);
    }
  }

  const { error } = await supabase.from("inventory").delete().eq("id", params.id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          error:
            "This item has restock or order history and cannot be deleted. Turn off Display instead if you want to hide it from customers.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not delete item." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
