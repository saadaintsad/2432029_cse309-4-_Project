import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { storagePathFromPublicUrl } from "@/lib/utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const { data: image, error: fetchError } = await supabase
    .from("inventory_images")
    .select("id, image_url")
    .eq("id", params.imageId)
    .eq("inventory_id", params.id)
    .maybeSingle();

  if (fetchError || !image) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  const path = storagePathFromPublicUrl(image.image_url, "inventory-images");
  if (path) {
    await supabase.storage.from("inventory-images").remove([path]);
  }

  const { error: deleteError } = await supabase
    .from("inventory_images")
    .delete()
    .eq("id", params.imageId);

  if (deleteError) {
    return NextResponse.json({ error: "Could not delete image." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
