import Link from "next/link";
import Image from "next/image";
import { Search, Phone, MapPin, PackageSearch, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/public/PublicHeader";
import { TrackOrderInline } from "@/components/public/TrackOrderInline";
import { AboutUsButton } from "@/components/public/AboutUsButton";
import { FeaturedCollectionsCarousel } from "@/components/public/FeaturedCollectionsCarousel";
import { getShopSettings } from "@/lib/shop-settings";

// shop_settings changes (Settings -> Shop Details) must show up immediately
// per spec — see lib/supabase-server.ts for why this alone isn't quite
// enough (createServiceRoleClient already forces cache:"no-store" too).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const shop = await getShopSettings();

  return (
    <main className="flex min-h-screen flex-col bg-white font-inter">
      <PublicHeader />

      {/* Hero — compact, so the hero + top of Featured Collections both fit
          on first load without scrolling (matches reference1.jpg's proportions) */}
      <section className="relative flex min-h-[430px] flex-col overflow-hidden lg:flex-row">
        {/* Warm sandy background photo, full-bleed behind everything */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/img6.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle white wash on the left, fading out toward the models on
              the right, so the dark-navy text keeps enough contrast against
              the textured photo behind it. */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row">
          {/* Text content — 55% on desktop */}
          <div className="flex w-full flex-col items-center justify-center px-6 py-6 text-center lg:w-[55%] lg:items-start lg:justify-start lg:px-10 lg:pt-10 lg:text-left">
            <h1 className="font-playfair text-[36px] font-bold leading-tight text-[#1a2340] lg:text-[52px]">
              {shop.shop_name}
            </h1>
            <p className="mt-1 text-sm font-medium tracking-[0.5px] text-amber-700 sm:text-base">
              Wholesale Cloth Merchants — Islampur, Old Dhaka
            </p>
            <h2
              lang="bn"
              className="mt-3 max-w-xl font-hind-siliguri text-[30px] font-bold leading-tight tracking-tight text-[#1a2340] lg:text-[42px]"
            >
              সাশ্রয়ী দামে প্রিমিয়াম পাইকারি কাপড়
            </h2>
            <p
              lang="bn"
              className="mt-2 max-w-xl font-hind-siliguri text-[16px] leading-[1.7] text-[#4a5568]"
            >
              ইসলামপুরের শতভাগ মানসম্মত পপলিন, ভয়েল, লিনেন ও বেক্সি ভয়েল কাপড়ের
              পাইকারি বুকিং ও সার্বক্ষণিক স্টক আপডেট।
            </p>
            <div className="mt-4 flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row">
              <Link href="/browse" className="w-full lg:w-auto">
                <Button className="w-full px-8 py-[14px] text-base lg:w-auto">
                  Browse Stock Catalog
                </Button>
              </Link>
              <AboutUsButton
                shopName={shop.shop_name}
                ownerName={shop.owner_name}
                phone={shop.phone}
                address={shop.address}
                aboutUs={shop.about_us}
              />
            </div>
          </div>

          {/* Model images — 45% on desktop, anchored to the bottom edge, full
              image visible (contain) so heads stay in frame near the top */}
          <div className="relative order-first h-[240px] w-full lg:order-2 lg:h-auto lg:w-[45%]">
            <Image
              src="/images/img5.png"
              alt="New N Islam wholesale cloth collection — models wearing our fabrics"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </section>

      {/* Thin decorative divider */}
      <div className="mx-auto h-px w-full max-w-7xl bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      {/* Featured Collections */}
      <FeaturedCollectionsCarousel />

      {/* Track Order */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-8">
        <Card className="border-amber-100 p-5 shadow-md sm:p-6">
          <div className="mb-4 flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-amber-50 p-3.5 text-amber-700">
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
      <section className="mx-auto w-full max-w-5xl px-6 pb-10">
        <div className="grid gap-5 sm:grid-cols-3">
          <Card className="border-amber-100/70 shadow-sm">
            <PackageSearch className="mb-3 text-amber-700" size={28} />
            <h3 className="font-semibold text-slate-900">Live Stock Catalog</h3>
            <p className="mt-1 text-sm text-slate-500">
              Browse real-time inventory across our showroom and warehouse before
              you visit.
            </p>
          </Card>
          <Card className="border-amber-100/70 shadow-sm">
            <Truck className="mb-3 text-amber-700" size={28} />
            <h3 className="font-semibold text-slate-900">Wholesale by the Than</h3>
            <p className="mt-1 text-sm text-slate-500">
              Book your quantity online, then confirm and collect at the shop —
              simple and direct.
            </p>
          </Card>
          <Card className="border-amber-100/70 shadow-sm">
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
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-6 text-center">
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
