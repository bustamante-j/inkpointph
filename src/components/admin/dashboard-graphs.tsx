"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, labelize } from "@/lib/utils";
import type { AnyRecord, DashboardAnalytics } from "@/types/database";

export function DashboardGraphs({ analytics, lowStock }: { analytics: DashboardAnalytics; lowStock: AnyRecord[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard title="30-day cash flow" className="xl:col-span-2">
        {hasMoney(analytics.cashFlow) ? <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={analytics.cashFlow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `P${value}`} width={70} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Area type="monotone" dataKey="sales" name="Sales" stroke="#166534" fill="#dcfce7" strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#7f1017" fill="#fee2e2" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer> : <ChartEmpty text="Record payments and expenses to build the cash-flow chart." />}
      </ChartCard>

      <PipelineChart title="Online order pipeline" rows={analytics.onlineOrderStatus} />
      <PipelineChart title="Managed order pipeline" rows={analytics.managedOrderStatus} />

      <ChartCard title="Service demand">
        {analytics.serviceDemand.length ? <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics.serviceDemand.map((row) => ({ ...row, label: labelize(row.label) }))} layout="vertical" margin={{ left: 16, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="label" width={112} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" name="Orders" fill="#7f1017" barSize={18} />
          </BarChart>
        </ResponsiveContainer> : <ChartEmpty text="Service demand appears after orders are recorded." />}
      </ChartCard>

      <ChartCard title="Stock watch">
        {lowStock.length ? <div className="divide-y divide-zinc-100">
          {lowStock.slice(0, 7).map((item) => <div key={String(item.id)} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-semibold text-zinc-950">{String(item.item_name ?? "Item")}</p><p className="mt-1 text-xs text-zinc-500">Minimum: {String(item.minimum_stock_level ?? 0)} {String(item.unit ?? "")}</p></div><div className="text-right"><p className="text-xl font-black text-red-900">{String(item.quantity ?? 0)}</p><p className="text-[10px] font-semibold uppercase text-zinc-500">{labelize(String(item.status ?? ""))}</p></div></div>)}
        </div> : <ChartEmpty text="No low-stock items. Inventory is in good shape." />}
      </ChartCard>
    </div>
  );
}

function PipelineChart({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  return <ChartCard title={title}>{rows.length ? <ResponsiveContainer width="100%" height={230}><BarChart data={rows.map((row) => ({ ...row, label: labelize(row.label) }))} margin={{ top: 8, right: 8, left: 0, bottom: 28 }}><CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} /><XAxis dataKey="label" angle={-18} textAnchor="end" height={58} tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" name="Orders" fill="#18181b" barSize={28} /></BarChart></ResponsiveContainer> : <ChartEmpty text="No orders in this pipeline yet." />}</ChartCard>;
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <Card className={`border-zinc-300 ${className}`}><CardHeader className="p-4"><h2 className="text-sm font-black uppercase text-zinc-950">{title}</h2></CardHeader><CardContent className="p-4">{children}</CardContent></Card>;
}

function ChartEmpty({ text }: { text: string }) {
  return <div className="flex min-h-52 items-center border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm font-semibold text-zinc-500">{text}</div>;
}

function hasMoney(rows: DashboardAnalytics["cashFlow"]) {
  return rows.some((row) => row.sales > 0 || row.expenses > 0);
}
