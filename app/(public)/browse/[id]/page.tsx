import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { PublicHeader } from "@/components/public/PublicHeader";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { BookNowButton } from "@/components/public/browse/BookNowButton";

// Same reasoning as app/(public)/page.tsx — direct Supabase reads with no
// cookies()/searchParams trigger are otherwise a caching risk; inventory
// price/stock/display changes must be visible immediately.
export const dynamic = "force-dynamic";

export default async function BrowseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceRoleClient();
  const { data: item } = await supabase
    .from("inventory")
    .select(
      "id, variant, color, suta_count, qty_than, selling_price_per_than, inventory_images(id, image_url)"
    )
    .eq("id", params.id)
    .eq("display", true)
    .maybeSingle();

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="grid gap-2">
            {item.inventory_images.length === 0 ? (
              <div className="flex aspect-square items-center justify-center rounded-md bg-slate-100 text-sm text-slate-400">
                No image available
              </div>
            ) : (
              item.inventory_images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={`${item.variant} ${item.color}`}
                  className="aspect-square w-full rounded-md object-cover"
                />
              ))
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{item.variant}</h1>
            <p className="text-slate-500">{item.color}</p>

            <Card className="mt-6">
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-slate-500">Suta Count</dt>
                <dd className="text-slate-900">{item.suta_count}</dd>
                <dt className="text-slate-500">Quantity Available</dt>
                <dd className="text-slate-900">{item.qty_than} Than</dd>
                <dt className="text-slate-500">Selling Price</dt>
                <dd className="font-semibold text-amber-700">
                  {formatCurrency(item.selling_price_per_than)} / Than
                </dd>
              </dl>
            </Card>

            <div className="mt-6">
              <BookNowButton
                inventoryId={item.id}
                sellingPricePerThan={item.selling_price_per_than}
                qtyAvailable={item.qty_than}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
