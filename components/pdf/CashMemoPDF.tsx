"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./styles";

interface CashMemoPDFProps {
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

function money(n: number) {
  return `৳${n.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

export function CashMemoPDF({ shop, memo, order, customerId, items }: CashMemoPDFProps) {
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
          <Text>Memo No: {memo.memo_id}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.row}>
          <Text>
            <Text style={s.label}>Customer: </Text>
            {memo.customer_name}
          </Text>
          <Text>
            <Text style={s.label}>Customer ID: </Text>
            {customerId}
          </Text>
        </View>
        <Text style={s.row}>
          <Text style={s.label}>Order ID: </Text>
          {order.order_id}
        </Text>

        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={s.colSl}>SL</Text>
            <Text style={s.colItem}>Item</Text>
            <Text style={s.colColor}>Color</Text>
            <Text style={s.colThan}>Than</Text>
            <Text style={s.colRate}>Rate/Than</Text>
            <Text style={s.colTotal}>Total</Text>
          </View>
          {items.map((item, idx) => (
            <View style={s.tableRow} key={idx}>
              <Text style={s.colSl}>{idx + 1}</Text>
              <Text style={s.colItem}>{item.variant}</Text>
              <Text style={s.colColor}>{item.color}</Text>
              <Text style={s.colThan}>{item.qty_than}</Text>
              <Text style={s.colRate}>{money(item.rate_per_than)}</Text>
              <Text style={s.colTotal}>{money(item.total_amount)}</Text>
            </View>
          ))}
        </View>

        <View style={s.summarySection}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Grand Total</Text>
            <Text style={s.summaryValueBold}>{money(memo.total_amount)}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Paid</Text>
            <Text>{money(memo.paid_amount)}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Due</Text>
            <Text>{money(memo.due_amount)}</Text>
          </View>
        </View>

        <View style={s.signatureRow}>
          <Text style={s.signatureLine}>Customer Signature: ___________________</Text>
          <Text style={s.signatureLine}>Authorized: ___________________</Text>
        </View>
      </Page>
    </Document>
  );
}
