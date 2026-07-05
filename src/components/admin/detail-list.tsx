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
    <dl className="grid gap-px overflow-hidden border border-zinc-300 bg-zinc-200 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {field.label}
          </dt>
          <dd className="mt-1 text-sm text-zinc-900">
            {field.format === "status" ? (
              <Badge value={String(field.value(record) ?? "")} />
            ) : field.format === "image" ? (
              <DetailImage value={field.value(record)} />
            ) : (
              formatColumnValue(field, record)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DetailImage({ value }: { value: unknown }) {
  const imageUrl = typeof value === "string" && value ? value : "";

  if (!imageUrl) {
    return <span className="text-zinc-500">No image uploaded</span>;
  }

  return (
    <div className="max-w-sm overflow-hidden border border-zinc-200 bg-zinc-50">
      <img src={imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
    </div>
  );
}
