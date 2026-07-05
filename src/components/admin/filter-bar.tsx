import { Search } from "lucide-react";
import { serviceTypeOptions } from "@/lib/constants";
import type { AdminFilters } from "@/lib/admin/data";
import type { ModuleConfig } from "@/lib/admin/module-config";

export function FilterBar({
  config,
  filters,
}: {
  config: ModuleConfig;
  filters: AdminFilters;
}) {
  return (
    <form className="grid gap-3 border border-zinc-300 bg-white p-4 shadow-sm shadow-zinc-950/5 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          name="q"
          defaultValue={filters.q}
          placeholder={`Search ${config.title.toLowerCase()}`}
          className="h-10 w-full border border-zinc-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-900/10"
        />
      </label>
      {config.statusField ? (
        <select
          name="status"
          defaultValue={filters.status}
          className="h-10 border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-900/10"
        >
          <option value="">All statuses</option>
          {statusChoices(config.statusField).map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      ) : (
        <span className="hidden md:block" />
      )}
      {config.paymentStatusField ? (
        <select
          name="payment"
          defaultValue={filters.payment}
          className="h-10 border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-900/10"
        >
          <option value="">All payments</option>
          {["unpaid", "partial", "paid", "refunded"].map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      ) : config.key === "projects" ? (
        <select
          name="service"
          defaultValue={filters.service}
          className="h-10 border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-900/10"
        >
          <option value="">All services</option>
          {serviceTypeOptions.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      ) : (
        <span className="hidden md:block" />
      )}
      {config.dateField ? (
        <div className="grid grid-cols-2 gap-2">
          <input
            name="from"
            type="date"
            defaultValue={filters.from}
            className="h-10 border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-900/10"
            aria-label="From date"
          />
          <input
            name="to"
            type="date"
            defaultValue={filters.to}
            className="h-10 border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-900/10"
            aria-label="To date"
          />
        </div>
      ) : (
        <span className="hidden md:block" />
      )}
      <button className="h-10 bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-red-950">
        Apply
      </button>
    </form>
  );
}

function statusChoices(field: string) {
  if (field === "order_status") {
    return [
      "pending",
      "confirmed",
      "in_progress",
      "ready_for_pickup",
      "completed",
      "cancelled",
      "archived",
    ];
  }
  if (field === "action_type") {
    return [
      "create",
      "update",
      "delete",
      "archive",
      "status_change",
      "payment_added",
      "payment_updated",
      "expense_added",
      "inventory_updated",
      "login",
      "logout",
      "note_added",
    ];
  }
  if (field === "status") return ["active", "inactive", "archived", "in_stock", "low_stock", "out_of_stock"];
  return [];
}
