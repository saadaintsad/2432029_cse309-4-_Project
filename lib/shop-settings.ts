import { createServiceRoleClient } from "./supabase-server";

export interface ShopSettingsData {
  shop_name: string;
  phone: string;
  address: string;
  owner_name: string;
  about_us: string;
}

const DEFAULT_SHOP_SETTINGS: ShopSettingsData = {
  shop_name: "New N Islam",
  phone: "01711280943",
  address: "Islampur, Old Dhaka",
  owner_name: "Md. Rafiqul Islam",
  about_us:
    "For over a generation, New N Islam has supplied premium wholesale fabrics — Poplin, Voile, Linen, and Bexi Voile — from our showroom and warehouse in Islampur, Old Dhaka to retailers and garment businesses across Bangladesh.",
};

export async function getShopSettings(): Promise<ShopSettingsData> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("shop_settings")
    .select("shop_name, phone, address, owner_name, about_us")
    .eq("id", "00000000-0000-0000-0000-000000000000")
    .maybeSingle();

  return data ?? DEFAULT_SHOP_SETTINGS;
}
