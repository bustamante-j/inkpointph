import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { fetchReportData, paramsToFilters } from "@/lib/admin/data";
import { formatCurrency, labelize } from "@/lib/utils";
import type { AnyRecord } from "@/types/database";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportsPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const filters = paramsToFilters(query);
  const data = await fetchReportData(filters);
  const totalSales = sum(data.payments, "amount");
  const totalExpenses = sum(data.expenses, "amount");
  const netProfit = totalSales - totalExpenses;
  const unpaid = data.projects.filter((project) => project.payment_status === "unpaid");
  const partial = data.projects.filter((project) => project.payment_status === "partial");
  const completed = data.projects.filter((project) => project.order_status === "completed");
  const byService = groupSum(data.projects, "service_type", "total_price");
  const byPayment = groupSum(data.payments, "payment_method", "amount");
  const byStatus = groupCount(data.projects, "order_status");
  const lowStock = data.inventory.filter((item) =>
    ["low_stock", "out_of_stock"].includes(String(item.status)),
  );
  const repeatClients = getRepeatClients(data.projects);

  const exportParams = new URLSearchParams();
  if (filters.from) exportParams.set("from", filters.from);
  if (filters.to) exportParams.set("to", filters.to);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Sales, expenses, profit, unpaid orders, service demand, client history, and inventory summaries."
      />
      {!data.configured ? <Notice title="Supabase is not configured" tone="warning">Reports will calculate from live data after the database is connected.</Notice> : null}
      {data.error ? <Notice title="Reports issue" tone="warning">{data.error}</Notice> : null}

      <form className="grid gap-3 border border-zinc-300 bg-white p-4 shadow-sm shadow-zinc-950/5 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input name="from" type="date" defaultValue={filters.from} className="h-10 border border-zinc-300 px-3 text-sm outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/10" aria-label="From date" />
        <input name="to" type="date" defaultValue={filters.to} className="h-10 border border-zinc-300 px-3 text-sm outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/10" aria-label="To date" />
        <button className="h-10 bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-red-950">
          Apply dates
        </button>
        <ButtonLink href={`/admin/reports/export?${exportParams.toString()}`} variant="secondary">
          CSV Export
        </ButtonLink>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sales" value={formatCurrency(totalSales)} detail="Recorded payments" tone="dark" />
        <StatCard label="Expenses" value={formatCurrency(totalExpenses)} detail="Costs in range" />
        <StatCard label="Net Profit" value={formatCurrency(netProfit)} detail="Sales minus expenses" tone="red" />
        <StatCard label="Low Stock" value={lowStock.length} detail="Inventory alerts" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportCard title="Revenue by service type" rows={byService} money />
        <ReportCard title="Payment method summary" rows={byPayment} money />
        <ReportCard title="Project status summary" rows={byStatus} />
        <ReportCard title="Most requested services" rows={groupCount(data.projects, "service_type")} />
        <RecordReport title="Unpaid orders report" rows={unpaid} badgeField="payment_status" />
        <RecordReport title="Partially paid orders report" rows={partial} badgeField="payment_status" />
        <RecordReport title="Completed orders report" rows={completed} badgeField="order_status" />
        <RecordReport title="Repeat customer report" rows={repeatClients} />
        <RecordReport title="Inventory / low stock report" rows={lowStock} badgeField="status" />
      </div>
    </div>
  );
}

function ReportCard({
  title,
  rows,
  money = false,
}: {
  title: string;
  rows: { label: string; value: number }[];
  money?: boolean;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-zinc-950">{title}</h2>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="font-medium text-zinc-700">{labelize(row.label)}</span>
                  <span className="text-zinc-500">{money ? formatCurrency(row.value) : row.value}</span>
                </div>
                <div className="h-2 bg-zinc-100">
                  <div
                    className="h-2 bg-red-900"
                    style={{ width: `${Math.max(5, (row.value / max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No report data" description="Data will appear after matching records exist." />
        )}
      </CardContent>
    </Card>
  );
}

function RecordReport({
  title,
  rows,
  badgeField,
}: {
  title: string;
  rows: AnyRecord[];
  badgeField?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-zinc-950">{title}</h2>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="space-y-3">
            {rows.slice(0, 8).map((row) => (
              <div key={String(row.id ?? row.client_id)} className="flex items-center justify-between gap-4 border border-zinc-100 p-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    {String(row.order_number ?? row.full_name ?? row.item_name ?? row.service_type ?? "Record")}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {String(row.title ?? row.client_name ?? row.category ?? "Report record")}
                  </p>
                </div>
                {badgeField ? <Badge value={String(row[badgeField] ?? "")} /> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No matching records" description="This report has no rows for the selected range." />
        )}
      </CardContent>
    </Card>
  );
}

function sum(rows: AnyRecord[], field: string) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

function groupSum(rows: AnyRecord[], labelField: string, amountField: string) {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const label = String(row[labelField] ?? "not_applicable");
    map.set(label, (map.get(label) ?? 0) + Number(row[amountField] ?? 0));
  });
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function groupCount(rows: AnyRecord[], labelField: string) {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const label = String(row[labelField] ?? "not_applicable");
    map.set(label, (map.get(label) ?? 0) + 1);
  });
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function getRepeatClients(projects: AnyRecord[]) {
  const map = new Map<string, { id: string; full_name: string; count: number }>();
  projects
    .filter((project) => project.order_status === "completed" && project.client_id)
    .forEach((project) => {
      const client = (project.clients ?? {}) as AnyRecord;
      const id = String(project.client_id);
      const current = map.get(id) ?? {
        id,
        full_name: String(client.full_name ?? "Client"),
        count: 0,
      };
      current.count += 1;
      map.set(id, current);
    });

  return [...map.values()]
    .filter((client) => client.count > 1)
    .map((client) => ({
      id: client.id,
      full_name: client.full_name,
      title: `${client.count} completed orders`,
    }));
}
