// Phase 0 seed script — creates Storage buckets and seeds initial admin + shop_settings.
// Run with: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureBucket(name) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const existing = buckets.find((b) => b.name === name);
  if (existing) {
    if (!existing.public) {
      const { error } = await supabase.storage.updateBucket(name, { public: true });
      if (error) throw error;
      console.log(`Bucket "${name}" existed but was private — set to public.`);
    } else {
      console.log(`Bucket "${name}" already exists and is public.`);
    }
    return;
  }

  const { error } = await supabase.storage.createBucket(name, { public: true });
  if (error) throw error;
  console.log(`Bucket "${name}" created (public).`);
}

async function seedAdmin() {
  const { data: existing, error: fetchError } = await supabase
    .from("admins")
    .select("id, admin_id, username")
    .eq("username", "boss")
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (existing) {
    console.log(`Admin "boss" already exists (${existing.admin_id}) — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash("1234", 10);
  const { data, error } = await supabase
    .from("admins")
    .insert({
      username: "boss",
      phone: "01711280943",
      password_hash: passwordHash,
      must_change_password: true,
    })
    .select("admin_id")
    .single();
  if (error) throw error;

  console.log(`Seeded initial admin: ${data.admin_id} / boss / 1234 (must_change_password=true)`);
}

async function seedShopSettings() {
  const { error } = await supabase.from("shop_settings").upsert(
    {
      id: "00000000-0000-0000-0000-000000000000",
      shop_name: "New N Islam",
      phone: "01711280943",
      address: "Islampur, Old Dhaka",
    },
    { onConflict: "id" }
  );
  if (error) throw error;
  console.log("Seeded shop_settings.");
}

try {
  await ensureBucket("inventory-images");
  await ensureBucket("landing-images");
  await seedAdmin();
  await seedShopSettings();
  console.log("Phase 0 seeding complete.");
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
}
