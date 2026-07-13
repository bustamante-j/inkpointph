import { NextResponse } from "next/server";
import { fetchReportData, paramsToFilters } from "@/lib/admin/data";
import { escapeCsvCell } from "@/lib/csv";

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
    [],
    ["payments"],
    ["date", "order", "method", "amount", "reference"],
    ...data.payments.map((payment) => [
      payment.payment_date,
      (payment.projects_orders as Record<string, unknown> | null)?.order_number,
      payment.payment_method,
      payment.amount,
      payment.reference_number,
    ]),
    [],
    ["expenses"],
    ["date", "name", "category", "supplier", "amount"],
    ...data.expenses.map((expense) => [
      expense.expense_date,
      expense.expense_name,
      expense.category,
      expense.supplier,
      expense.amount,
    ]),
    [],
    ["orders"],
    ["order_number", "service", "status", "payment_status", "total", "paid", "balance"],
    ...data.projects.map((project) => [
      project.order_number,
      project.service_type,
      project.order_status,
      project.payment_status,
      project.total_price,
      project.amount_paid,
      project.balance_due,
    ]),
  ];

  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");

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
