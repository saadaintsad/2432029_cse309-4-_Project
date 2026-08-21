"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface AboutUsButtonProps {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  aboutUs: string;
}

const SHOP_IMAGES = [
  { src: "/images/shop/shopImage1.jpg", alt: "New N Islam shop — view 1" },
  { src: "/images/shop/shopImage3.jpg", alt: "New N Islam shop — view 3" },
  { src: "/images/shop/shopImage2.jpg", alt: "New N Islam shop — view 2" },
];

export function AboutUsButton({
  shopName,
  ownerName,
  phone,
  address,
  aboutUs,
}: AboutUsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="w-full border border-slate-800 bg-white px-8 py-[14px] text-base text-slate-900 hover:bg-slate-50 lg:w-auto"
        onClick={() => setOpen(true)}
      >
        About Us
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="About Us" className="max-w-[600px]">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-medium text-slate-500">Shop Name</dt>
          <dd className="text-slate-900">{shopName}</dd>
          <dt className="font-medium text-slate-500">Owner Name</dt>
          <dd className="text-slate-900">{ownerName}</dd>
          <dt className="font-medium text-slate-500">Contact No</dt>
          <dd className="text-slate-900">{phone}</dd>
          <dt className="font-medium text-slate-500">Address</dt>
          <dd className="text-slate-900">{address}, Bangladesh</dd>
        </dl>

        <div className="mt-4">
          <p className="mb-1 text-sm font-medium text-slate-500">What We Do</p>
          <p className="text-sm leading-relaxed text-slate-700">{aboutUs}</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {SHOP_IMAGES.map((img) => (
            <div
              key={img.src}
              className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
            >
              <Image src={img.src} alt={img.alt} fill sizes="200px" className="object-cover" />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
