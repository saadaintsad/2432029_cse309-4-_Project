"use client";

import { useEffect, useRef, useState, TouchEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Collection {
  name: string;
  image: string;
  variant: string;
}

const COLLECTIONS: Collection[] = [
  { name: "Premium Poplin", image: "/images/poplin.jpg", variant: "Poplin" },
  { name: "Printed Voile", image: "/images/chapa.jpg", variant: "Voile" },
  { name: "Exclusive Linen", image: "/images/Cotton-Voile-Fabric.jpg", variant: "Linen" },
  { name: "Toray", image: "/images/toray.jpg", variant: "Toray" },
  { name: "Polyester", image: "/images/polester.jpg", variant: "Polyester" },
];

const SWIPE_THRESHOLD = 40;

export function FeaturedCollectionsCarousel() {
  const [cardsPerView, setCardsPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setCardsPerView(mq.matches ? 3 : 2);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const maxIndex = Math.max(0, COLLECTIONS.length - cardsPerView);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setIndex((i) => Math.min(maxIndex, i + 1));
  }

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) goPrev();
    else if (delta < -SWIPE_THRESHOLD) goNext();
    touchStartX.current = null;
  }

  const itemWidthPct = 100 / cardsPerView;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8">
      <h2 className="mb-5 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
        Featured Collections
      </h2>

      <div className="relative">
        <button
          type="button"
          aria-label="Previous collections"
          onClick={goPrev}
          disabled={index === 0}
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          className="overflow-hidden mx-10 sm:mx-12"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${index * itemWidthPct}%)` }}
          >
            {COLLECTIONS.map((c) => (
              <div
                key={c.name}
                className="shrink-0 px-2"
                style={{ width: `${itemWidthPct}%` }}
              >
                <Link
                  href={`/browse?variant=${encodeURIComponent(c.variant)}`}
                  className="group relative block h-[280px] w-full overflow-hidden rounded-xl shadow-md"
                >
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[20px] font-bold text-white">{c.name}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Next collections"
          onClick={goNext}
          disabled={index === maxIndex}
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
