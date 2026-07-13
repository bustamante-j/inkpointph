import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { DetailList } from "@/components/admin/detail-list";
import { PageHeader } from "@/components/admin/page-header";
import { RecordsTable } from "@/components/admin/records-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  fetchClientDetail,
  fetchProjectDetail,
  fetchRecord,
} from "@/lib/admin/data";
import {
  addPaymentToProjectAction,
  addProjectNoteAction,
  adjustInventoryAction,
  convertOnlineOrderAction,
} from "@/lib/admin/actions";
import {
  getModuleConfig,
  moduleConfigs,
} from "@/lib/admin/module-config";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ module: string; id: string }>;
};

export default async function RecordDetailPage({ params }: PageProps) {
  const { module, id } = await params;
  const config = getModuleConfig(module);
  if (!config) notFound();

  if (config.key === "projects") return <ProjectDetail id={id} />;
  if (config.key === "clients") return <ClientDetail id={id} />;

  const result = await fetchRecord(config.key, id);
  if (result.configured && !result.record) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${config.singular} Details`}
        description={config.description}
        action={
          config.editable
            ? {
                href: `/admin/${config.path}/${id}/edit`,
                label: "Edit",
                icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
              }
            : undefined
        }
      />
      {!result.configured ? <Notice title="Supabase is not configured" tone="warning">Record details will load after the database is connected.</Notice> : null}
      {result.error ? <Notice title="Record issue" tone="warning">{result.error}</Notice> : null}
      {result.record ? (
        <>
          <DetailList fields={config.detailFields} record={result.record} />
          {config.key === "onlineOrders" ? (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-zinc-950">Managed order</h2>
              </CardHeader>
              <CardContent>
                {result.record.project_order_id ? (
                  <a
                    href={`/admin/projects/${String(result.record.project_order_id)}`}
                    className="inline-flex h-10 items-center bg-red-950 px-4 text-sm font-semibold text-white"
                  >
                    Open managed order
                  </a>
                ) : (
                  <form action={convertOnlineOrderAction.bind(null, id)} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-2xl text-sm leading-6 text-zinc-600">
                      Verify the payment and total first. Conversion creates or matches the client, creates the project, and records a verified payment.
                    </p>
                    <SubmitButton>Convert to managed order</SubmitButton>
                  </form>
                )}
              </CardContent>
            </Card>
          ) : null}
          {config.key === "inventory" ? (
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card>
                <CardHeader><h2 className="font-semibold text-zinc-950">Record stock movement</h2></CardHeader>
                <CardContent>
                  <form action={adjustInventoryAction.bind(null, id)} className="space-y-4">
                    <label className="block"><span className="text-sm font-medium text-zinc-800">Movement</span><select name="transaction_type" className="mt-1.5 h-10 w-full border border-red-900/20 bg-white px-3 text-sm"><option value="restock">Restock</option><option value="usage">Used for orders</option><option value="adjustment">Manual adjustment</option></select></label>
                    <label className="block"><span className="text-sm font-medium text-zinc-800">Quantity</span><input name="quantity_change" type="number" step="0.01" required className="mt-1.5 h-10 w-full border border-red-900/20 bg-white px-3 text-sm" /></label>
                    <label className="block"><span className="text-sm font-medium text-zinc-800">Notes</span><textarea name="notes" rows={3} className="mt-1.5 w-full border border-red-900/20 bg-white px-3 py-2 text-sm" /></label>
                    <SubmitButton>Save stock movement</SubmitButton>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><h2 className="font-semibold text-zinc-950">Stock history</h2></CardHeader>
                <CardContent>
                  {Array.isArray(result.record.inventory_transactions) && result.record.inventory_transactions.length ? (
                    <div className="divide-y divide-zinc-100">
                      {(result.record.inventory_transactions as Record<string, unknown>[]).map((transaction) => <div key={String(transaction.id)} className="flex items-center justify-between gap-4 py-3"><div><Badge value={String(transaction.transaction_type)} /><p className="mt-2 text-xs text-zinc-500">{String(transaction.notes || "No note")}</p></div><div className="text-right"><p className={`font-black ${Number(transaction.quantity_change) < 0 ? "text-rose-700" : "text-emerald-700"}`}>{Number(transaction.quantity_change) > 0 ? "+" : ""}{String(transaction.quantity_change)}</p><p className="mt-1 text-xs text-zinc-500">{formatDateTime(String(transaction.created_at))}</p></div></div>)}
                    </div>
                  ) : <EmptyState title="No stock history yet" description="Restocks, usage, and corrections will appear here." />}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState title="Record unavailable" description="Connect Supabase or choose another record." />
      )}
    </div>
  );
}

async function ClientDetail({ id }: { id: string }) {
  const result = await fetchClientDetail(id);
  if (result.configured && !result.client) notFound();
  const completedOrders = result.projects.filter(
    (project) => project.order_status === "completed",
  ).length;
  const isRepeat = completedOrders > 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Details"
        description="Contact profile, notes, status, and project/order history."
        action={{
          href: `/admin/clients/${id}/edit`,
          label: "Edit Client",
          icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
        }}
      />
      {!result.configured ? <Notice title="Supabase is not configured" tone="warning">Client details will load after the database is connected.</Notice> : null}
      {result.error ? <Notice title="Client issue" tone="warning">{result.error}</Notice> : null}
      {result.client ? (
        <>
          <Card>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-zinc-950">{String(result.client.full_name)}</h2>
                  <Badge value={String(result.client.status ?? "")} />
                  {isRepeat ? <Badge value="repeat customer" className="bg-red-50 text-red-900 ring-red-200" /> : null}
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  {String(result.client.messenger_name ?? result.client.phone_number ?? "No contact yet")}
                </p>
              </div>
              <div className="text-sm text-zinc-600">
                <span className="font-semibold text-zinc-950">{completedOrders}</span> completed orders
              </div>
            </CardContent>
          </Card>
          <DetailList fields={moduleConfigs.clients.detailFields} record={result.client} />
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-zinc-950">Order history</h2>
            </CardHeader>
            <CardContent>
              <RecordsTable config={moduleConfigs.projects} rows={result.projects} />
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState title="Client unavailable" description="Connect Supabase or choose another client." />
      )}
    </div>
  );
}

async function ProjectDetail({ id }: { id: string }) {
  const result = await fetchProjectDetail(id);
  if (result.configured && !result.project) notFound();
  const project = result.project;
  const timeline = [
    ...result.notes.map((note) => ({
      id: `note-${note.id}`,
      type: "note",
      title: String(note.title ?? "Manual note"),
      description: String(note.description ?? ""),
      created_at: String(note.created_at ?? ""),
    })),
    ...result.logs.map((log) => ({
      id: `log-${log.id}`,
      type: String(log.action_type ?? "log"),
      title: String(log.action_type ?? "Activity"),
      description: String(log.description ?? ""),
      created_at: String(log.created_at ?? ""),
    })),
  ].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project / Order Details"
        description="Order scope, payment status, payment history, and project-specific timeline."
        action={{
          href: `/admin/projects/${id}/edit`,
          label: "Edit Order",
          icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
        }}
      />
      {!result.configured ? <Notice title="Supabase is not configured" tone="warning">Project details will load after the database is connected.</Notice> : null}
      {result.error ? <Notice title="Project issue" tone="warning">{result.error}</Notice> : null}
      {project ? (
        <>
          <Card>
            <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-zinc-950">{String(project.order_number)}</h2>
                  <Badge value={String(project.order_status ?? "")} />
                  <Badge value={String(project.payment_status ?? "")} />
                </div>
                <p className="mt-2 text-sm text-zinc-500">{String(project.title ?? "Untitled order")}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <Amount label="Total" value={project.total_price} />
                <Amount label="Paid" value={project.amount_paid} />
                <Amount label="Balance" value={project.balance_due} />
              </div>
            </CardContent>
          </Card>

          <DetailList fields={moduleConfigs.projects.detailFields} record={project} />

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-zinc-950">Add payment</h2>
              </CardHeader>
              <CardContent>
                <form action={addPaymentToProjectAction.bind(null, id)} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-zinc-800">Amount</span>
                      <input name="amount" type="number" min="0" step="0.01" required className="mt-1.5 h-10 w-full border border-red-900/20 bg-[#fffdf8] px-3 text-sm outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/10" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-zinc-800">Method</span>
                      <select name="payment_method" className="mt-1.5 h-10 w-full border border-red-900/20 bg-[#fffdf8] px-3 text-sm outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/10">
                        <option value="cash">Cash</option>
                        <option value="gcash">GCash</option>
                        <option value="bank_transfer">Bank transfer</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-zinc-800">Date</span>
                      <input name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1.5 h-10 w-full border border-red-900/20 bg-[#fffdf8] px-3 text-sm outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/10" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-zinc-800">Reference</span>
                      <input name="reference_number" className="mt-1.5 h-10 w-full border border-red-900/20 bg-[#fffdf8] px-3 text-sm outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/10" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-sm font-medium text-zinc-800">Notes</span>
                    <textarea name="notes" rows={3} className="mt-1.5 w-full border border-red-900/20 bg-[#fffdf8] px-3 py-2 text-sm outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/10" />
                  </label>
                  <SubmitButton>Add payment</SubmitButton>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-zinc-950">Payment history</h2>
              </CardHeader>
              <CardContent>
                {result.payments.length ? (
                  <div className="space-y-3">
                    {result.payments.map((payment) => (
                      <div key={String(payment.id)} className="flex items-center justify-between gap-4 border border-zinc-100 p-3">
                        <div>
                          <p className="font-semibold text-zinc-950">{formatCurrency(payment.amount as number)}</p>
                          <p className="text-xs text-zinc-500">{formatDate(String(payment.payment_date ?? ""))} - {String(payment.reference_number ?? "No reference")}</p>
                        </div>
                        <Badge value={String(payment.payment_method ?? "")} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No payments yet" description="Manual payments for this order will appear here." />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-zinc-950">Project timeline</h2>
            </CardHeader>
            <CardContent className="space-y-5">
              <form action={addProjectNoteAction.bind(null, id)} className="flex flex-col gap-3 sm:flex-row">
                <input
                  name="note"
                  placeholder="Add internal timeline note"
                  className="h-10 flex-1 border border-red-900/20 bg-[#fffdf8] px-3 text-sm outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/10"
                />
                <SubmitButton>Add note</SubmitButton>
              </form>
              {timeline.length ? (
                <div className="space-y-4 border-l border-zinc-200 pl-4">
                  {timeline.map((item) => (
                    <div key={item.id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 bg-red-900 ring-4 ring-white" />
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge value={item.type} />
                        <span className="text-xs text-zinc-500">{formatDateTime(item.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-zinc-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No timeline entries yet" description="Status changes, payments, and manual notes will appear here." />
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState title="Project unavailable" description="Connect Supabase or choose another order." />
      )}
    </div>
  );
}

function Amount({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="bg-zinc-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-zinc-950">{formatCurrency(value as number)}</p>
    </div>
  );
}
