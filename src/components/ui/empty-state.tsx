import { Inbox } from "lucide-react";

export function EmptyState({
  title = "No records yet",
  description = "Add the first record when you are ready.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
      <Inbox className="mb-3 h-8 w-8 text-zinc-400" aria-hidden="true" />
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
    </div>
  );
}
