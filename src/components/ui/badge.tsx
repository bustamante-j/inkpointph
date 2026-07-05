import { cn, labelize } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  archived: "bg-zinc-950 text-white ring-zinc-950",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-sky-50 text-sky-700 ring-sky-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
  ready_for_pickup: "bg-violet-50 text-violet-700 ring-violet-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  unpaid: "bg-rose-50 text-rose-700 ring-rose-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  refunded: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  low_stock: "bg-amber-50 text-amber-700 ring-amber-200",
  out_of_stock: "bg-rose-50 text-rose-700 ring-rose-200",
  in_stock: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  create: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  update: "bg-blue-50 text-blue-700 ring-blue-200",
  delete: "bg-rose-50 text-rose-700 ring-rose-200",
  payment_added: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  note_added: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function Badge({
  value,
  className,
}: {
  value: string | null | undefined;
  className?: string;
}) {
  const key = value ?? "";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        statusClasses[key] ?? "bg-zinc-100 text-zinc-700 ring-zinc-200",
        className,
      )}
    >
      {labelize(key)}
    </span>
  );
}
