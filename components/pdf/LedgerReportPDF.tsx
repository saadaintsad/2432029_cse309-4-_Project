"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./styles";

interface LedgerReportPDFProps {
  shop: { shop_name: string; phone: string; address: string };
  dateFrom: string | null;
  dateTo: string | null;
  summary: {
    total_revenue: number;
    total_cash_received: number;
    gross_profit: number;
    net_profit: number;
    total_expenses: number;
  };
  payments: { customer_name: string; date: string; amount: number; method: string }[];
  expenses: { date: string; category: string; description: string; amount: number }[];
}

function money(n: number) {
  return `৳${n.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function LedgerReportPDF({
  shop,
  dateFrom,
  dateTo,
  summary,
  payments,
  expenses,
}: LedgerReportPDFProps) {
  const generatedOn = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const rangeText =
    dateFrom || dateTo
      ? `${dateFrom ? formatDate(dateFrom) : "—"} To ${dateTo ? formatDate(dateTo) : "—"}`
      : "All Time";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.shopName}>{shop.shop_name}</Text>
        <Text style={s.shopMeta}>
          {shop.phone} | {shop.address}
        </Text>

        <Text style={s.reportTitle}>Financial Report</Text>
        <View style={s.headerRow}>
          <Text>Date Range: {rangeText}</Text>
          <Text>Generated on: {generatedOn}</Text>
        </View>

        <View style={s.divider} />

        <Text style={s.sectionHeading}>Financial Summary</Text>
        <View style={s.summaryList}>
          <View style={s.summaryListRow}>
            <Text style={s.summaryListLabel}>Total Revenue</Text>
            <Text style={s.summaryListValue}>{money(summary.total_revenue)}</Text>
          </View>
          <View style={s.summaryListRow}>
            <Text style={s.summaryListLabel}>Total Cash Received</Text>
            <Text style={s.summaryListValue}>{money(summary.total_cash_received)}</Text>
          </View>
          <View style={s.summaryListRow}>
            <Text style={s.summaryListLabel}>Gross Profit</Text>
            <Text style={s.summaryListValue}>{money(summary.gross_profit)}</Text>
          </View>
          <View style={s.summaryListRow}>
            <Text style={s.summaryListLabel}>Net Profit / Loss</Text>
            <Text style={s.summaryListValue}>{money(summary.net_profit)}</Text>
          </View>
          <View style={s.summaryListRow}>
            <Text style={s.summaryListLabel}>Total Expenses</Text>
            <Text style={s.summaryListValue}>{money(summary.total_expenses)}</Text>
          </View>
        </View>

        <Text style={s.sectionHeading}>Payments Received</Text>
        {payments.length === 0 ? (
          <Text style={s.emptyNote}>No payments recorded in this period</Text>
        ) : (
          <View style={s.table}>
            <View style={s.tableHeaderRow}>
              <Text style={s.colCustomerName}>Customer Name</Text>
              <Text style={s.colPaymentDate}>Date</Text>
              <Text style={s.colPaymentAmount}>Amount</Text>
              <Text style={s.colPaymentMethod}>Method</Text>
            </View>
            {payments.map((p, idx) => (
              <View style={s.tableRow} key={idx} wrap={false}>
                <Text style={s.colCustomerName}>{p.customer_name}</Text>
                <Text style={s.colPaymentDate}>{formatDate(p.date)}</Text>
                <Text style={s.colPaymentAmount}>{money(p.amount)}</Text>
                <Text style={s.colPaymentMethod}>{p.method}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={s.sectionHeading}>Expenses</Text>
        {expenses.length === 0 ? (
          <Text style={s.emptyNote}>No expenses recorded in this period</Text>
        ) : (
          <View style={s.table}>
            <View style={s.tableHeaderRow}>
              <Text style={s.colExpenseDate}>Date</Text>
              <Text style={s.colExpenseCategory}>Category</Text>
              <Text style={s.colExpenseDescription}>Description</Text>
              <Text style={s.colExpenseAmount}>Amount</Text>
            </View>
            {expenses.map((e, idx) => (
              <View style={s.tableRow} key={idx} wrap={false}>
                <Text style={s.colExpenseDate}>{formatDate(e.date)}</Text>
                <Text style={s.colExpenseCategory}>{e.category}</Text>
                <Text style={s.colExpenseDescription}>{e.description}</Text>
                <Text style={s.colExpenseAmount}>{money(e.amount)}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
