"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function TrackOrderInline() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;
    router.push(`/track?order_id=${encodeURIComponent(orderId.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <Input
          placeholder="Enter your Order ID (e.g. ORD-2026-001)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
      </div>
      <Button type="submit" className="sm:w-fit">
        Track Order
      </Button>
    </form>
  );
}
