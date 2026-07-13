import { DashboardGraphs } from "@/components/admin/dashboard-graphs";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { fetchDashboardData } from "@/lib/admin/data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await fetchDashboardData();
  const summary = data.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Today’s priorities, order flow, money, demand, and stock."
        action={{ href: "/admin/projects/new", label: "Add Walk-in Order" }}
      />
      {!data.configured ? (
        <Notice title="Connect Supabase to activate live data" tone="warning">
          Add your Supabase URL and anon key to `.env.local`, then run the SQL schema.
        </Notice>
      ) : null}
      {data.error ? <Notice title="Dashboard data issue" tone="warning">{data.error}</Notice> : null}

      <div className="grid gap-2 border border-red-900/15 bg-white p-3 sm:grid-cols-2 xl:grid-cols-5">
        <ButtonLink href="/admin/online-orders" variant="secondary">Review online orders</ButtonLink>
        <ButtonLink href="/admin/projects/new" variant="secondary">New walk-in order</ButtonLink>
        <ButtonLink href="/admin/expenses/new" variant="secondary">Record expense</ButtonLink>
        <ButtonLink href="/admin/inventory" variant="secondary">Update stock</ButtonLink>
        <ButtonLink href="/admin/website" variant="secondary">Edit website</ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Clients" value={summary.totalClients} />
        <StatCard
          label="Online orders"
          value={summary.totalOnlineOrders}
          detail={`${summary.pendingOnlineOrders} pending`}
          tone="red"
        />
        <StatCard label="Projects" value={summary.totalProjects} />
        <StatCard label="Today’s sales" value={formatCurrency(summary.todaySales)} tone="dark" />
        <StatCard label="Monthly sales" value={formatCurrency(summary.monthlySales)} tone="dark" />
        <StatCard label="Monthly expenses" value={formatCurrency(summary.monthlyExpenses)} />
        <StatCard label="Estimated monthly profit" value={formatCurrency(summary.estimatedNetProfit)} tone="red" />
        <StatCard label="Low stock" value={summary.lowStockItems} tone="red" />
      </div>

      <DashboardGraphs
        analytics={data.analytics}
        lowStock={data.lowStock}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-zinc-300">
          <CardHeader className="p-4">
            <h2 className="text-sm font-black uppercase tracking-wide text-zinc-950">
              Recent Online Orders
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            {data.recentOnlineOrders.length ? (
              <div className="space-y-2">
                {data.recentOnlineOrders.map((order) => (
                  <div
                    key={String(order.id)}
                    className="grid grid-cols-[1fr_auto] gap-4 border border-zinc-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">
                        {String(order.order_number ?? order.customer_name ?? "Online customer")}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {String(order.service_type ?? "Service")} -{" "}
                        {String(order.contact_number ?? "No contact")}
                      </p>
                    </div>
                    <Badge value={String(order.order_status ?? "")} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No online orders yet"
                description="Public booking requests will appear here."
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-300">
          <CardHeader className="p-4">
            <h2 className="text-sm font-black uppercase tracking-wide text-zinc-950">
              Recent Orders
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            {data.recentProjects.length ? (
              <div className="space-y-2">
                {data.recentProjects.map((project) => (
                  <div key={String(project.id)} className="grid grid-cols-[1fr_auto] gap-4 border border-zinc-200 p-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">
                        {String(project.order_number ?? project.title)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {String(project.title ?? "Untitled order")}
                      </p>
                    </div>
                    <Badge value={String(project.order_status ?? "")} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No orders yet" description="Orders will appear after they are added." />
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-300">
          <CardHeader className="p-4">
            <h2 className="text-sm font-black uppercase tracking-wide text-zinc-950">
              Activity
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            {data.recentLogs.length ? (
              <div className="space-y-2">
                {data.recentLogs.map((log) => (
                  <div key={String(log.id)} className="border border-zinc-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Badge value={String(log.action_type ?? "")} />
                      <span className="text-xs text-zinc-500">
                        {formatDateTime(String(log.created_at ?? ""))}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-700">
                      {String(log.description ?? "Activity recorded")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No activity yet" description="Admin actions will appear here." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
