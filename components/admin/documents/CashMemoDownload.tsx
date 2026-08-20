"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { CashMemoPDF } from "@/components/pdf/CashMemoPDF";
import { Button } from "@/components/ui/Button";

interface CashMemoDownloadProps {
  shop: { shop_name: string; phone: string; address: string };
  memo: {
    memo_id: string;
    customer_name: string;
    paid_amount: number;
    due_amount: number;
    total_amount: number;
  };
  order: { order_id: string };
  customerId: string;
  items: {
    variant: string;
    color: string;
    qty_than: number;
    rate_per_than: number;
    total_amount: number;
  }[];
}

/** Kept in its own client-only file, dynamically imported with ssr:false from
 * CashMemoForm.tsx. @react-pdf/renderer's <Document>/<Page> tree is processed
 * by its own internal renderer (not ReactDOM) — it must be built directly by
 * a component that statically imports react-pdf, never passed through an
 * intermediate next/dynamic() proxy, or the internal renderer chokes on a
 * loading placeholder instead of a real element tree. */
export default function CashMemoDownload({
  shop,
  memo,
  order,
  customerId,
  items,
}: CashMemoDownloadProps) {
  return (
    <PDFDownloadLink
      document={
        <CashMemoPDF shop={shop} memo={memo} order={order} customerId={customerId} items={items} />
      }
      fileName={`${memo.memo_id}.pdf`}
    >
      {({ loading }) => (
        <Button type="button" disabled={loading}>
          {loading ? "Preparing PDF…" : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
