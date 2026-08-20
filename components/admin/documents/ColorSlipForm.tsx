"use client";

import { useState, FormEvent } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// See CashMemoForm.tsx for why this is one single dynamic import of a
// dedicated client-only wrapper file, not separate dynamic() wrappers for
// PDFDownloadLink and the PDF document component.
const ColorSlipDownload = dynamic(() => import("./ColorSlipDownload"), {
  ssr: false,
  loading: () => (
    <Button type="button" disabled>
      Preparing PDF…
    </Button>
  ),
});

interface SlipRow {
  variant: string;
  colors: string;
  qty_than: string;
  ratio: string;
}

interface GeneratedSlip {
  slip: { slip_id: string; note: string | null; total_qty_than: number };
  items: { variant: string; colors: string; qty_than: number; ratio: string | null }[];
  shop_settings: { shop_name: string; phone: string; address: string };
}

function emptyRow(): SlipRow {
  return { variant: "", colors: "", qty_than: "", ratio: "" };
}

function colorCount(colors: string) {
  return colors.split(",").map((c) => c.trim()).filter(Boolean).length;
}

export function ColorSlipForm() {
  const [rows, setRows] = useState<SlipRow[]>([emptyRow()]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState<GeneratedSlip | null>(null);

  function updateRow(index: number, field: keyof SlipRow, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      if (!row.variant.trim()) {
        setError(`Row ${idx + 1}: variant is required.`);
        return;
      }
      if (colorCount(row.colors) === 0) {
        setError(`Row ${idx + 1}: at least one color is required.`);
        return;
      }
      if (!Number.isFinite(Number(row.qty_than)) || Number(row.qty_than) <= 0) {
        setError(`Row ${idx + 1}: quantity must be greater than zero.`);
        return;
      }
      if (colorCount(row.colors) > 1 && !row.ratio.trim()) {
        setError(`Row ${idx + 1}: ratio is required when multiple colors are entered.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/color-slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: rows.map((r) => ({
            variant: r.variant,
            colors: r.colors,
            qty_than: Number(r.qty_than),
            ratio: r.ratio,
          })),
          note,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create color slip.");
        return;
      }

      setGenerated(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setRows([emptyRow()]);
    setNote("");
    setGenerated(null);
    setError(null);
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-slate-900">Color Slip</h2>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {!generated ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-end gap-2 rounded-md border border-slate-200 p-3"
              >
                <div className="min-w-[140px] flex-1 basis-40">
                  <Input
                    label={idx === 0 ? "Variant" : undefined}
                    placeholder="Variant"
                    value={row.variant}
                    onChange={(e) => updateRow(idx, "variant", e.target.value)}
                  />
                </div>
                <div className="min-w-[140px] flex-1 basis-40">
                  <Input
                    label={idx === 0 ? "Color(s)" : undefined}
                    placeholder="Red, Blue"
                    value={row.colors}
                    onChange={(e) => updateRow(idx, "colors", e.target.value)}
                  />
                </div>
                <div className="w-24 shrink-0">
                  <Input
                    label={idx === 0 ? "Qty (Than)" : undefined}
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Than"
                    value={row.qty_than}
                    onChange={(e) => updateRow(idx, "qty_than", e.target.value)}
                  />
                </div>
                <div className="w-24 shrink-0">
                  <Input
                    label={idx === 0 ? "Ratio" : undefined}
                    placeholder={colorCount(row.colors) > 1 ? "2:1" : "optional"}
                    value={row.ratio}
                    onChange={(e) => updateRow(idx, "ratio", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={rows.length === 1}
                  className="h-9 shrink-0 rounded-md px-2 text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="w-fit text-sm font-medium text-amber-700 hover:underline"
          >
            + Add Item
          </button>

          <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />

          <Button type="submit" loading={submitting} className="w-fit">
            Generate Color Slip
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <Alert variant="success">Color Slip {generated.slip.slip_id} created.</Alert>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Variant</th>
                  <th className="px-3 py-2 font-medium">Color(s)</th>
                  <th className="px-3 py-2 font-medium">Than</th>
                  <th className="px-3 py-2 font-medium">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {generated.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">{item.variant}</td>
                    <td className="px-3 py-2">{item.colors}</td>
                    <td className="px-3 py-2">{item.qty_than}</td>
                    <td className="px-3 py-2">{item.ratio || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ColorSlipDownload
            shop={generated.shop_settings}
            slip={generated.slip}
            items={generated.items}
          />
          <button
            type="button"
            className="w-fit text-sm text-amber-700 hover:underline"
            onClick={reset}
          >
            Create another
          </button>
        </div>
      )}
    </Card>
  );
}
