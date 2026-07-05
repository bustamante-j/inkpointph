import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  PackageCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
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
        description="A quick operating view of clients, projects, payments, expenses, inventory, and recent activity."
      />
      {!data.configured ? (
        <Notice title="Connect Supabase to activate live data" tone="warning">
          Add your Supabase URL and anon key to `.env.local`, run the SQL schema,
          then sign in as the admin owner.
        </Notice>
      ) : null}
      {data.error ? <Notice title="Dashboard data issue" tone="warning">{data.error}</Notice> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Clients" value={summary.totalClients} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Total Projects / Orders" value={summary.totalProjects} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label="Pending Orders" value={summary.pendingOrders} icon={<Clock3 className="h-5 w-5" />} />
        <StatCard label="In Progress Orders" value={summary.inProgressOrders} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Ready for Pickup" value={summary.readyForPickupOrders} icon={<PackageCheck className="h-5 w-5" />} tone="red" />
        <StatCard label="Completed Orders" value={summary.completedOrders} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Unpaid Orders" value={summary.unpaidOrders} icon={<CreditCard className="h-5 w-5" />} tone="red" />
        <StatCard label="Today Sales" value={formatCurrency(summary.todaySales)} icon={<Banknote className="h-5 w-5" />} tone="dark" />
        <StatCard label="Monthly Sales" value={formatCurrency(summary.monthlySales)} icon={<Banknote className="h-5 w-5" />} />
        <StatCard label="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={<CreditCard className="h-5 w-5" />} />
        <StatCard label="Estimated Net Profit" value={formatCurrency(summary.estimatedNetProfit)} icon={<TrendingUp className="h-5 w-5" />} tone="dark" />
        <StatCard label="Low Stock Items" value={summary.lowStockItems} icon={<AlertTriangle className="h-5 w-5" />} tone="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-950">Recent projects / orders</h2>
          </CardHeader>
          <CardContent>
            {data.recentProjects.length ? (
              <div className="space-y-3">
                {data.recentProjects.map((project) => (
                  <div key={String(project.id)} className="flex items-center justify-between gap-4 rounded-md border border-zinc-100 p-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">{String(project.order_number ?? project.title)}</p>
                      <p className="text-xs text-zinc-500">{String(project.title ?? "Untitled order")}</p>
                    </div>
                    <Badge value={String(project.order_status ?? "")} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No recent projects" description="Orders will appear here after they are added." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-950">Recent activity logs</h2>
          </CardHeader>
          <CardContent>
            {data.recentLogs.length ? (
              <div className="space-y-3">
                {data.recentLogs.map((log) => (
                  <div key={String(log.id)} className="rounded-md border border-zinc-100 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Badge value={String(log.action_type ?? "")} />
                      <span className="text-xs text-zinc-500">{formatDateTime(String(log.created_at ?? ""))}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-700">{String(log.description ?? "Activity recorded")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No activity yet" description="Audit entries will appear here after admin actions." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-950">Recent clients</h2>
          </CardHeader>
          <CardContent>
            {data.recentClients.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.recentClients.map((client) => (
                  <div key={String(client.id)} className="rounded-md border border-zinc-100 p-3">
                    <p className="text-sm font-semibold text-zinc-950">{String(client.full_name ?? "Client")}</p>
                    <p className="text-xs text-zinc-500">{String(client.messenger_name ?? client.phone_number ?? "No contact")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No clients yet" description="Client records will appear here after they are added." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-950">Low-stock inventory alerts</h2>
          </CardHeader>
          <CardContent>
            {data.lowStock.length ? (
              <div className="space-y-3">
                {data.lowStock.map((item) => (
                  <div key={String(item.id)} className="flex items-center justify-between rounded-md border border-zinc-100 p-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">{String(item.item_name ?? "Item")}</p>
                      <p className="text-xs text-zinc-500">{String(item.quantity ?? 0)} {String(item.unit ?? "")}</p>
                    </div>
                    <Badge value={String(item.status ?? "")} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No low-stock alerts" description="Items below minimum stock will appear here." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
