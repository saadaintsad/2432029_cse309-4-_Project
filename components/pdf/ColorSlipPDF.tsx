"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { THAN_TO_GOJ } from "@/lib/constants";
import { pdfStyles as s } from "./styles";

interface ColorSlipItem {
  variant: string;
  colors: string;
  qty_than: number;
  ratio: string | null;
}

interface ColorSlipPDFProps {
  shop: { shop_name: string; phone: string; address: string };
  slip: { slip_id: string; note: string | null; total_qty_than: number };
  items: ColorSlipItem[];
}

export function ColorSlipPDF({ shop, slip, items }: ColorSlipPDFProps) {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.shopName}>{shop.shop_name}</Text>
        <Text style={s.shopMeta}>
          {shop.phone} | {shop.address}
        </Text>

        <View style={s.headerRow}>
          <Text>Date: {today}</Text>
          <Text>Slip No: {slip.slip_id}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={s.colSl}>SL</Text>
            <Text style={s.colItem}>Variant</Text>
            <Text style={s.colColor}>Color(s)</Text>
            <Text style={s.colThan}>Than</Text>
            <Text style={s.colRate}>Ratio</Text>
          </View>
          {items.map((item, idx) => (
            <View style={s.tableRow} key={idx}>
              <Text style={s.colSl}>{idx + 1}</Text>
              <Text style={s.colItem}>{item.variant}</Text>
              <Text style={s.colColor}>{item.colors}</Text>
              <Text style={s.colThan}>{item.qty_than}</Text>
              <Text style={s.colRate}>{item.ratio || "-"}</Text>
            </View>
          ))}
        </View>

        <View style={s.summarySection}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Total Quantity</Text>
            <Text style={s.summaryValueBold}>
              {slip.total_qty_than} Than ({slip.total_qty_than * THAN_TO_GOJ} Goj)
            </Text>
          </View>
        </View>

        {slip.note && (
          <Text style={{ marginTop: 16 }}>
            <Text style={s.label}>Note: </Text>
            {slip.note}
          </Text>
        )}
      </Page>
    </Document>
  );
}
