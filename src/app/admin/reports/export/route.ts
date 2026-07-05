import { NextResponse } from "next/server";
import { fetchReportData, paramsToFilters } from "@/lib/admin/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const data = await fetchReportData(paramsToFilters(params));

  if (!data.configured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const rows = [
    ["report", "label", "amount_or_count"],
    ["sales", "total_sales", sum(data.payments, "amount")],
    ["expenses", "total_expenses", sum(data.expenses, "amount")],
    ["profit", "net_profit", sum(data.payments, "amount") - sum(data.expenses, "amount")],
    ["orders", "unpaid", count(data.projects, "payment_status", "unpaid")],
    ["orders", "partial", count(data.projects, "payment_status", "partial")],
    ["orders", "completed", count(data.projects, "order_status", "completed")],
    ["inventory", "low_stock", data.inventory.filter((item) => item.status === "low_stock").length],
  ];

  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inkpoint-report.csv"`,
    },
  });
}

function sum(rows: Record<string, unknown>[], field: string) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

function count(rows: Record<string, unknown>[], field: string, value: string) {
  return rows.filter((row) => row[field] === value).length;
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}
