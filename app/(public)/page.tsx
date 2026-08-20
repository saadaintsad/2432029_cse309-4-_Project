import Link from "next/link";
import { Store, Search, Phone, MapPin, PackageSearch, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/public/PublicHeader";
import { TrackOrderInline } from "@/components/public/TrackOrderInline";
import { getShopSettings } from "@/lib/shop-settings";
import { createServiceRoleClient } from "@/lib/supabase-server";

// This page reads shop_settings/landing_images/inventory directly via
// Supabase (no cookies()/searchParams usage), which Next's App Router would
// otherwise treat as a static-rendering candidate. createServiceRoleClient()
// already forces cache:"no-store" on every request (see lib/supabase-server.ts),
// but this is kept too for route-level clarity — admin changes here (shop
// details, landing images) must show up immediately per spec.
export const dynamic = "force-dynamic";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function getGalleryImages() {
  const supabase = createServiceRoleClient();

  const { data: landingImages } = await supabase
    .from("landing_images")
    .select("id, image_url")
    .order("display_order", { ascending: true });

  if (landingImages && landingImages.length > 0) {
    return landingImages.map((img) => ({ id: img.id, url: img.image_url }));
  }

  // Fallback: random display=ON inventory photos (spec 6.1/57).
  const { data: inventoryWithImages } = await supabase
    .from("inventory")
    .select("id, variant, color, inventory_images(image_url)")
    .eq("display", true);

  const eligible = (inventoryWithImages ?? []).filter((item) => item.inventory_images.length > 0);
  return shuffle(eligible)
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      url: item.inventory_images[0].image_url,
      label: `${item.variant} — ${item.color}`,
    }));
}

export default async function HomePage() {
  const [shop, gallery] = await Promise.all([getShopSettings(), getGalleryImages()]);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-amber-700/5" />
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 py-16 text-center sm:py-20">
          <div className="rounded-2xl bg-amber-700 p-4 text-white shadow-lg shadow-amber-700/20">
            <Store size={40} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {shop.shop_name}
          </h1>
          <p className="text-base font-medium text-amber-700 sm:text-lg">
            Wholesale Cloth Merchants — Islampur, Old Dhaka
          </p>
          <h2 className="max-w-3xl text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-4xl">
            সাশ্রয়ী দামে প্রিমিয়াম পাইকারি কাপড়
          </h2>
          <p className="max-w-2xl text-slate-600 sm:text-lg">
            ইসলামপুরের শতভাগ মানসম্মত পপলিন, ভয়েল, লিনেন ও বেক্সি ভয়েল কাপড়ের
            পাইকারি বুকিং ও সার্বক্ষণিক স্টক আপডেট।
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link href="/browse">
              <Button className="w-full px-8 py-3 sm:w-auto">Browse Stock Catalog</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" className="w-full px-8 py-3 sm:w-auto">
                Create an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">Gallery</h2>
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((img) => (
              <div
                key={img.id}
                className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={"label" in img ? (img as { label: string }).label : shop.shop_name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500">
            No gallery images yet. Check back soon.
          </p>
        )}
      </section>

      {/* Track Order */}
      <section className="mx-auto w-full max-w-3xl px-6 py-4">
        <Card className="p-6 sm:p-8">
          <div className="mb-5 flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-slate-100 p-3.5 text-slate-700">
              <Search size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Track Your Order</h2>
              <p className="mt-1 text-sm text-slate-500">
                Already placed a request? Enter your Order ID to check its current
                status — no login needed.
              </p>
            </div>
          </div>
          <TrackOrderInline />
        </Card>
      </section>

      {/* Feature highlights */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <PackageSearch className="mb-3 text-amber-700" size={28} />
            <h3 className="font-semibold text-slate-900">Live Stock Catalog</h3>
            <p className="mt-1 text-sm text-slate-500">
              Browse real-time inventory across our showroom and warehouse before
              you visit.
            </p>
          </Card>
          <Card>
            <Truck className="mb-3 text-amber-700" size={28} />
            <h3 className="font-semibold text-slate-900">Wholesale by the Than</h3>
            <p className="mt-1 text-sm text-slate-500">
              Book your quantity online, then confirm and collect at the shop —
              simple and direct.
            </p>
          </Card>
          <Card>
            <ShieldCheck className="mb-3 text-amber-700" size={28} />
            <h3 className="font-semibold text-slate-900">Trusted Since Day One</h3>
            <p className="mt-1 text-sm text-slate-500">
              A physical shop in Islampur — every order is confirmed and fulfilled
              in person.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-8 text-center">
        <p className="text-sm font-semibold text-slate-900">{shop.shop_name}</p>
        <div className="mt-2 flex flex-col items-center justify-center gap-1 text-sm text-slate-500 sm:flex-row sm:gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Phone size={14} /> {shop.phone}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} /> {shop.address}
          </span>
        </div>
        <Link
          href="/admin/login"
          className="mt-4 inline-block text-xs text-slate-400 hover:text-slate-600"
        >
          Admin
        </Link>
      </footer>
    </main>
  );
}
