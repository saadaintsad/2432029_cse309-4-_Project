import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getShopSettings } from "@/lib/shop-settings";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { isValidBdPhone, normalizePhone } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const settings = await getShopSettings();
  return NextResponse.json({ settings });
}

/** Shop Details — spec 7.9: changes take effect immediately across the app,
 * including PDFs (both read from the same shop_settings row/table). */
export async function PATCH(request: NextRequest) {
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

  const shopName = typeof body.shop_name === "string" ? body.shop_name.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";

  if (!shopName) return NextResponse.json({ error: "Shop name is required." }, { status: 400 });
  if (!isValidBdPhone(phoneRaw)) {
    return NextResponse.json(
      { error: "Enter a valid Bangladeshi phone number." },
      { status: 400 }
    );
  }
  if (!address) return NextResponse.json({ error: "Address is required." }, { status: 400 });

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("shop_settings")
    .update({
      shop_name: shopName,
      phone: normalizePhone(phoneRaw),
      address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "00000000-0000-0000-0000-000000000000")
    .select("shop_name, phone, address")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not update shop details." }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
