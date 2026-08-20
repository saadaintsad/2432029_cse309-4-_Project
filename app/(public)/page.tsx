import Link from "next/link";
import Image from "next/image";
import { Search, Phone, MapPin, PackageSearch, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/public/PublicHeader";
import { TrackOrderInline } from "@/components/public/TrackOrderInline";
import { getShopSettings } from "@/lib/shop-settings";

// shop_settings changes (Settings -> Shop Details) must show up immediately
// per spec — see lib/supabase-server.ts for why this alone isn't quite
// enough (createServiceRoleClient already forces cache:"no-store" too).
export const dynamic = "force-dynamic";

const COLLECTIONS = [
  { name: "Premium Poplin", image: "/images/poplin.jpg" },
  { name: "Printed Voile", image: "/images/chapa.jpg" },
  { name: "Exclusive Linen", image: "/images/Cotton-Voile-Fabric.jpg" },
];

export default async function HomePage() {
  const shop = await getShopSettings();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, rgba(180,83,9,0.07), transparent 45%), radial-gradient(circle at 10% 85%, rgba(180,83,9,0.05), transparent 40%)",
          }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:py-28">
          {/* Text content */}
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {shop.shop_name}
            </h1>
            <p className="mt-2 text-base font-semibold text-amber-700 sm:text-lg">
              Wholesale Cloth Merchants — Islampur, Old Dhaka
            </p>
            <h2 className="mt-6 max-w-xl text-3xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              সাশ্রয়ী দামে প্রিমিয়াম পাইকারি কাপড়
            </h2>
            <p className="mt-4 max-w-xl text-slate-600 sm:text-lg">
              ইসলামপুরের শতভাগ মানসম্মত পপলিন, ভয়েল, লিনেন ও বেক্সি ভয়েল কাপড়ের
              পাইকারি বুকিং ও সার্বক্ষণিক স্টক আপডেট।
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/browse" className="w-full sm:w-auto">
                <Button className="w-full px-8 py-3 sm:w-auto">Browse Stock Catalog</Button>
              </Link>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full px-8 py-3 sm:w-auto">
                  Create an Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Model images */}
          <div className="order-1 lg:order-2">
            {/* Mobile: single centered image above the text */}
            <div className="relative mx-auto aspect-square w-56 sm:w-72 lg:hidden">
              <Image
                src="/images/img04.png"
                alt="New N Islam wholesale cloth collection"
                fill
                priority
                sizes="(max-width: 1024px) 60vw, 0px"
                className="object-contain"
              />
            </div>

            {/* Desktop/tablet: 2 images arranged overlapping */}
            <div className="relative mx-auto hidden aspect-square max-w-lg lg:block">
              <div className="absolute left-0 top-4 h-[80%] w-[52%] drop-shadow-xl">
                <Image
                  src="/images/img03.png"
                  alt="New N Islam premium fabric — model portrait"
                  fill
                  sizes="(min-width: 1024px) 26vw, 0px"
                  className="object-contain object-bottom"
                />
              </div>
              <div className="absolute bottom-0 right-0 h-[92%] w-[72%] drop-shadow-2xl">
                <Image
                  src="/images/img04.png"
                  alt="New N Islam wholesale cloth collection"
                  fill
                  priority
                  sizes="(min-width: 1024px) 36vw, 0px"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Featured Collections
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <div
              key={c.name}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-md"
            >
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-lg font-bold text-white sm:text-xl">{c.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Track Order */}
      <section className="mx-auto w-full max-w-3xl px-6 py-4">
        <Card className="border-amber-100 p-6 shadow-md sm:p-8">
          <div className="mb-5 flex items-start gap-4">
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
      <section className="mx-auto w-full max-w-5xl px-6 py-14 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-3">
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
