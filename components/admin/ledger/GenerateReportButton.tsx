"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { LedgerReportPDF } from "@/components/pdf/LedgerReportPDF";
import { Button } from "@/components/ui/Button";

interface Summary {
  total_revenue: number;
  total_cash_received: number;
  gross_profit: number;
  net_profit: number;
  total_expenses: number;
}

interface GenerateReportButtonProps {
  dateFrom: string;
  dateTo: string;
  summary: Summary;
}

/** Kept in its own client-only file, dynamically imported with ssr:false from
 * LedgerPage.tsx — same reasoning as CashMemoDownload.tsx: @react-pdf/renderer
 * touches browser-only APIs and must be built directly by a component that
 * statically imports react-pdf, not routed through a nested dynamic() proxy.
 *
 * Unlike the Cash Memo / Color Slip downloads, there's no record to create
 * first, so this fetches its own report data and generates + downloads the
 * PDF in one click via the imperative `pdf()` API, rather than rendering a
 * PDFDownloadLink that needs a second click once ready. */
export default function GenerateReportButton({
  dateFrom,
  dateTo,
  summary,
}: GenerateReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const res = await fetch(`/api/ledger/report?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not generate report.");
        return;
      }

      const blob = await pdf(
        <LedgerReportPDF
          shop={data.shop_settings}
          dateFrom={dateFrom || null}
          dateTo={dateTo || null}
          summary={summary}
          payments={data.payments}
          expenses={data.expenses}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Financial-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not generate report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        className="border border-slate-300 bg-white hover:bg-slate-50"
        onClick={handleClick}
        loading={loading}
      >
        {loading ? "Preparing Report…" : "Generate Report"}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
