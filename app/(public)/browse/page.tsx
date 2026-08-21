import { Suspense } from "react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { BrowseGrid } from "@/components/public/browse/BrowseGrid";

export default function BrowsePage() {
  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Browse Stock</h1>
        <Suspense fallback={null}>
          <BrowseGrid />
        </Suspense>
      </div>
    </main>
  );
}
