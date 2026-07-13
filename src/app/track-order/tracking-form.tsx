"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, Search } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { lookupOrderAction, type TrackingState } from "@/lib/public/tracking-actions";
import { formatCurrency, formatDate, formatDateTime, labelize } from "@/lib/utils";

const initialState: TrackingState = { status: "idle", message: "" };
const statuses = ["pending", "working_on_it", "ready_for_pickup", "completed"];

export function TrackingForm({ initialOrderNumber }: { initialOrderNumber: string }) {
  const [state, action] = useActionState(lookupOrderAction, initialState);
  const order = state.order;
  const currentIndex = order ? statuses.indexOf(String(order.order_status)) : -1;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-red-900"><ArrowLeft className="h-4 w-4" /> Back to InkPoint</Link>
      <div className="mt-6 border border-red-900/20 bg-white">
        <div className="border-b border-red-900/10 bg-red-950 p-5 text-white">
          <h1 className="text-2xl font-black">Track your order</h1>
          <p className="mt-1 text-sm text-red-100">No account is needed. Your contact number keeps the lookup private.</p>
        </div>
        <form action={action} className="grid gap-4 p-5 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
          <label className="block"><span className="text-sm font-semibold">Order number</span><input name="order_number" required defaultValue={initialOrderNumber} placeholder="IPO-20260713-000001" className="mt-1.5 h-11 w-full border border-red-900/20 px-3 text-sm uppercase outline-none focus:border-red-900" /></label>
          <label className="block"><span className="text-sm font-semibold">Last 4 contact digits</span><input name="contact_last_four" required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} className="mt-1.5 h-11 w-full border border-red-900/20 px-3 text-sm outline-none focus:border-red-900" /></label>
          <SubmitButton pendingText="Checking..." className="h-11"><Search className="h-4 w-4" /> Check</SubmitButton>
        </form>
        {state.status === "error" ? <p className="mx-5 mb-5 border border-rose-700/20 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{state.message}</p> : null}
      </div>

      {order ? <section className="mt-5 border border-red-900/20 bg-white p-5" aria-live="polite">
        <div className="flex flex-col gap-3 border-b border-red-900/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-semibold uppercase text-red-800">{String(order.order_number)}</p><h2 className="mt-1 text-2xl font-black text-zinc-950">{String(order.service_type)}</h2></div>
          <span className="border border-red-900/20 bg-red-50 px-3 py-2 text-xs font-black uppercase text-red-950">{labelize(String(order.order_status))}</span>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-4">
          {statuses.map((status, index) => <div key={status} className={`border p-3 ${index <= currentIndex ? "border-red-900 bg-red-50" : "border-zinc-200 bg-zinc-50"}`}><span className={`flex h-6 w-6 items-center justify-center ${index <= currentIndex ? "bg-red-900 text-white" : "bg-zinc-200 text-zinc-500"}`}>{index <= currentIndex ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span><p className="mt-3 text-xs font-black uppercase text-zinc-700">{labelize(status)}</p></div>)}
        </div>

        <dl className="mt-6 grid gap-4 border-t border-red-900/10 pt-5 sm:grid-cols-2">
          <Info label="Payment" value={labelize(String(order.payment_status))} />
          <Info label="Calculated total" value={formatCurrency(Number(order.estimated_total ?? 0))} />
          <Info label="Needed by" value={order.needed_by ? formatDate(String(order.needed_by)) : "Not specified"} />
          <Info label="Pickup / delivery" value={labelize(String(order.pickup_or_delivery))} />
          {order.admin_notes ? <Info label="Update from InkPoint" value={String(order.admin_notes)} /> : null}
          <Info label="Last updated" value={formatDateTime(String(order.updated_at))} />
        </dl>
      </section> : <div className="mt-5 flex items-center gap-3 border border-dashed border-red-900/20 bg-white p-5 text-sm text-zinc-600"><Clock3 className="h-5 w-5 text-red-900" /> Enter your details to see the latest status.</div>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase text-zinc-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-zinc-950">{value}</dd></div>;
}
