"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";

interface BrowseItem {
  id: string;
  variant: string;
  color: string;
  suta_count: number;
  qty_than: number;
  selling_price_per_than: number;
  inventory_images: { id: string; image_url: string }[];
}

export function BrowseGrid() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<BrowseItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variant, setVariant] = useState(searchParams.get("variant") ?? "");
  const [color, setColor] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (variant) params.set("variant", variant);
    if (color) params.set("color", color);

    try {
      const res = await fetch(`/api/inventory?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load stock.");
        return;
      }
      setItems(data.inventory);
    } catch {
      setError("Network error while loading stock.");
    }
  }, [variant, color]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Variant"
          placeholder="e.g. Voil"
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
        />
        <Input
          label="Color"
          placeholder="All Colors"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {items === null ? (
        <p className="text-sm text-slate-500">Loading stock…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">No items match your search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link key={item.id} href={`/browse/${item.id}`}>
              <Card className="flex h-full flex-col gap-3 transition-shadow hover:shadow-md">
                <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-100">
                  {item.inventory_images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.inventory_images[0].image_url}
                      alt={`${item.variant} ${item.color}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{item.variant}</p>
                  <p className="text-sm text-slate-500">{item.color}</p>
                </div>
                <div className="mt-auto flex items-center justify-between text-sm">
                  <span className="text-slate-500">{item.qty_than} Than in stock</span>
                  <span className="font-semibold text-amber-700">
                    {formatCurrency(item.selling_price_per_than)}/Than
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
