import { Badge } from "@/components/ui/badge";
import {
  formatColumnValue,
  type ColumnConfig,
} from "@/lib/admin/module-config";
import type { AnyRecord } from "@/types/database";

export function DetailList({
  fields,
  record,
}: {
  fields: ColumnConfig[];
  record: AnyRecord;
}) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {field.label}
          </dt>
          <dd className="mt-1 text-sm text-zinc-900">
            {field.format === "status" ? (
              <Badge value={String(field.value(record) ?? "")} />
            ) : (
              formatColumnValue(field, record)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
