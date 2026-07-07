import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, labelize } from "@/lib/utils";
import type { AnyRecord, DashboardSummary } from "@/types/database";

type ChartRow = {
  label: string;
  value: number;
  tone?: "red" | "dark" | "muted";
};

export function DashboardGraphs({
  summary,
  recentProjects,
  recentOnlineOrders,
  lowStock,
}: {
  summary: DashboardSummary;
  recentProjects: AnyRecord[];
  recentOnlineOrders: AnyRecord[];
  lowStock: AnyRecord[];
}) {
  const onlineOrderRows: ChartRow[] = [
    { label: "Pending", value: summary.pendingOnlineOrders, tone: "muted" },
    { label: "Working", value: summary.workingOnlineOrders, tone: "dark" },
    { label: "Ready", value: summary.readyOnlineOrders, tone: "red" },
  ];

  const orderRows: ChartRow[] = [
    { label: "Pending", value: summary.pendingOrders, tone: "muted" },
    { label: "In progress", value: summary.inProgressOrders, tone: "dark" },
    { label: "Pickup", value: summary.readyForPickupOrders, tone: "red" },
    { label: "Complete", value: summary.completedOrders, tone: "dark" },
  ];

  const financeRows: ChartRow[] = [
    { label: "Sales", value: summary.monthlySales, tone: "dark" },
    { label: "Expenses", value: summary.totalExpenses, tone: "red" },
    { label: "Profit", value: summary.estimatedNetProfit, tone: "muted" },
  ];

  const serviceRows = topCounts(
    [...recentOnlineOrders, ...recentProjects],
    "service_type",
  ).slice(0, 5);
  const stockRows = lowStock.slice(0, 5).map((item) => ({
    label: String(item.item_name ?? "Item"),
    value: Number(item.quantity ?? 0),
    tone: String(item.status) === "out_of_stock" ? "red" : "muted",
  })) satisfies ChartRow[];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <BarGraph
        title="Online Orders"
        rows={onlineOrderRows}
        emptyText="No online bookings yet"
      />
      <BarGraph
        title="Order Flow"
        rows={orderRows}
        emptyText="No orders yet"
      />
      <BarGraph
        title="Monthly Money"
        rows={financeRows}
        money
        emptyText="No payments or expenses yet"
      />
      <BarGraph
        title="Recent Demand"
        rows={serviceRows}
        emptyText="No recent project data"
      />
      <BarGraph
        title="Stock Watch"
        rows={stockRows}
        emptyText="No low-stock items"
      />
    </div>
  );
}

function BarGraph({
  title,
  rows,
  money = false,
  emptyText,
}: {
  title: string;
  rows: ChartRow[];
  money?: boolean;
  emptyText: string;
}) {
  const visibleRows = rows.filter((row) => Number.isFinite(row.value));
  const max = Math.max(...visibleRows.map((row) => Math.abs(row.value)), 0);

  return (
    <Card className="border-zinc-300">
      <CardHeader className="p-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-zinc-950">
          {title}
        </h2>
      </CardHeader>
      <CardContent className="p-4">
        {max > 0 ? (
          <div className="space-y-4">
            {visibleRows.map((row) => {
              const width = Math.max(4, (Math.abs(row.value) / max) * 100);

              return (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between gap-4 text-xs">
                    <span className="font-semibold uppercase tracking-wide text-zinc-600">
                      {labelize(row.label)}
                    </span>
                    <span className="font-semibold text-zinc-950">
                      {money ? formatCurrency(row.value) : row.value}
                    </span>
                  </div>
                  <div className="h-3 border border-zinc-200 bg-zinc-50">
                    <div
                      className={barTone(row.tone)}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-40 items-center border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm font-semibold text-zinc-500">
            {emptyText}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function barTone(tone: ChartRow["tone"]) {
  if (tone === "red") return "h-full bg-red-900";
  if (tone === "dark") return "h-full bg-zinc-950";
  return "h-full bg-zinc-500";
}

function topCounts(rows: AnyRecord[], key: string): ChartRow[] {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const label = String(row[key] ?? "not_applicable");
    map.set(label, (map.get(label) ?? 0) + 1);
  });

  return [...map.entries()]
    .map(([label, value]) => ({ label, value, tone: "red" as const }))
    .sort((a, b) => b.value - a.value);
}
