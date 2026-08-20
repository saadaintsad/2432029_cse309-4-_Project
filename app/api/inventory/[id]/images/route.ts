import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

const MAX_IMAGES_PER_ITEM = 2;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file provided." }, { status: 400 });
  }
  if (file.type !== "image/png") {
    return NextResponse.json({ error: "Only PNG images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be 5MB or smaller." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: existingImages, error: countError } = await supabase
    .from("inventory_images")
    .select("id")
    .eq("inventory_id", params.id);

  if (countError) {
    return NextResponse.json({ error: "Could not check existing images." }, { status: 500 });
  }
  if ((existingImages?.length ?? 0) >= MAX_IMAGES_PER_ITEM) {
    return NextResponse.json(
      { error: `Maximum ${MAX_IMAGES_PER_ITEM} images per item.` },
      { status: 400 }
    );
  }

  const path = `${params.id}/${randomUUID()}.png`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("inventory-images")
    .upload(path, buffer, { contentType: "image/png" });

  if (uploadError) {
    return NextResponse.json({ error: "Could not upload image." }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from("inventory-images").getPublicUrl(path);

  const { data: imageRow, error: insertError } = await supabase
    .from("inventory_images")
    .insert({ inventory_id: params.id, image_url: publicUrlData.publicUrl })
    .select("id, image_url")
    .single();

  if (insertError || !imageRow) {
    await supabase.storage.from("inventory-images").remove([path]);
    return NextResponse.json({ error: "Could not save image reference." }, { status: 500 });
  }

  return NextResponse.json({ image: imageRow }, { status: 201 });
}
