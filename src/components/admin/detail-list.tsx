import Image from "next/image";
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
            ) : field.format === "links" ? (
              <DetailLinks value={field.value(record)} />
            ) : (
              formatColumnValue(field, record)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DetailLinks({ value }: { value: unknown }) {
  const links = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : typeof value === "string" && value
      ? [value]
      : [];

  if (!links.length) {
    return <span className="text-zinc-500">No files uploaded</span>;
  }

  return (
    <div className="space-y-2">
      {links.map((link, index) => (
        <a
          key={link}
          href={link}
          target="_blank"
          rel="noreferrer"
          className="block border border-red-900/15 bg-[#fff7ed] px-3 py-2 font-semibold text-red-950 hover:border-red-900"
        >
          Open file {index + 1}
        </a>
      ))}
    </div>
  );
}

function DetailImage({ value }: { value: unknown }) {
  const imageUrl = typeof value === "string" && value ? value : "";

  if (!imageUrl) {
    return <span className="text-zinc-500">No image uploaded</span>;
  }

  return (
    <div className="relative aspect-[4/3] max-w-sm overflow-hidden border border-zinc-200 bg-zinc-50">
      <Image src={imageUrl} alt="Uploaded record image" fill sizes="384px" className="object-cover" />
    </div>
  );
}
