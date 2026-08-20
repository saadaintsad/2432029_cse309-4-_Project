"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { ColorSlipPDF } from "@/components/pdf/ColorSlipPDF";
import { Button } from "@/components/ui/Button";

interface ColorSlipItem {
  variant: string;
  colors: string;
  qty_than: number;
  ratio: string | null;
}

interface ColorSlipDownloadProps {
  shop: { shop_name: string; phone: string; address: string };
  slip: { slip_id: string; note: string | null; total_qty_than: number };
  items: ColorSlipItem[];
}

/** Same reasoning as CashMemoDownload.tsx — kept in its own client-only file,
 * dynamically imported with ssr:false, and statically imports react-pdf
 * directly so the <Document> tree it builds is never wrapped by an
 * intermediate next/dynamic() proxy. */
export default function ColorSlipDownload({ shop, slip, items }: ColorSlipDownloadProps) {
  return (
    <PDFDownloadLink
      document={<ColorSlipPDF shop={shop} slip={slip} items={items} />}
      fileName={`${slip.slip_id}.pdf`}
    >
      {({ loading }) => (
        <Button type="button" disabled={loading}>
          {loading ? "Preparing PDF…" : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
