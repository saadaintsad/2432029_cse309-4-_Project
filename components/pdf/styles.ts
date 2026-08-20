"use client";

import { StyleSheet } from "@react-pdf/renderer";
import { PDF_FONT_FAMILY } from "./font";

// Plain white background, clean readable font, no logos/watermarks — spec section 9.
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: PDF_FONT_FAMILY,
    color: "#0f172a",
  },
  shopName: {
    fontSize: 16,
    fontWeight: 700,
  },
  shopMeta: {
    fontSize: 10,
    color: "#334155",
    marginTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: "#334155",
  },
  table: {
    marginTop: 12,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
  },
  colSl: { width: "8%" },
  colItem: { width: "27%" },
  colColor: { width: "17%" },
  colThan: { width: "12%", textAlign: "right" },
  colRate: { width: "18%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  summarySection: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: "45%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    color: "#334155",
  },
  summaryValueBold: {
    fontWeight: 700,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 48,
  },
  signatureLine: {
    fontSize: 10,
  },
  colorRatioRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  colorRatioColor: {
    width: "60%",
  },
  colorRatioValue: {
    width: "40%",
  },
});
