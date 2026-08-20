import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

// Public — the customer landing page needs these without authentication
// (spec 6.1/57: uploaded landing images, if any, appear on the landing page).
export async function GET() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("landing_images")
    .select("id, image_url, display_order, created_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load landing images." }, { status: 500 });
  }

  return NextResponse.json({ images: data });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, or WebP images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be 5MB or smaller." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("landing-images")
    .upload(path, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "Could not upload image." }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from("landing-images").getPublicUrl(path);

  const { count } = await supabase
    .from("landing_images")
    .select("id", { count: "exact", head: true });

  const { data: imageRow, error: insertError } = await supabase
    .from("landing_images")
    .insert({ image_url: publicUrlData.publicUrl, display_order: count ?? 0 })
    .select("id, image_url, display_order")
    .single();

  if (insertError || !imageRow) {
    await supabase.storage.from("landing-images").remove([path]);
    return NextResponse.json({ error: "Could not save image reference." }, { status: 500 });
  }

  return NextResponse.json({ image: imageRow }, { status: 201 });
}
