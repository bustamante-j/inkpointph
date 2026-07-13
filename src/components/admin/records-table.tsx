import Link from "next/link";
import Image from "next/image";
import { Archive, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  archiveRecordAction,
  hardDeleteRecordAction,
} from "@/lib/admin/actions";
import {
  formatColumnValue,
  type ModuleConfig,
  type ModuleKey,
} from "@/lib/admin/module-config";
import type { AnyRecord } from "@/types/database";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";

export function RecordsTable({
  config,
  rows,
}: {
  config: ModuleConfig;
  rows: AnyRecord[];
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={`No ${config.title.toLowerCase()} found`}
        description="Try a different filter or add a new record."
      />
    );
  }

  return (
    <div className="overflow-hidden border border-zinc-300 bg-white shadow-sm shadow-zinc-950/5">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              {config.columns.map((column) => (
                <th key={column.label} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <tr key={String(row.id)} className="hover:bg-red-50/40">
                {config.columns.map((column) => (
                  <td key={column.label} className="max-w-xs px-4 py-3 text-zinc-700">
                    {column.format === "status" ? (
                      <Badge value={String(column.value(row) ?? "")} />
                    ) : column.format === "image" ? (
                      <ImageCell value={column.value(row)} />
                    ) : (
                      <span className="line-clamp-2">{formatColumnValue(column, row)}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconLink href={`/admin/${config.path}/${row.id}`} label="View">
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </IconLink>
                    {config.editable ? (
                      <IconLink href={`/admin/${config.path}/${row.id}/edit`} label="Edit">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </IconLink>
                    ) : null}
                    {config.archiveValue ? (
                      <form action={archiveRecordAction.bind(null, config.key as ModuleKey, String(row.id))}>
                        <ConfirmActionButton
                          className="inline-flex h-8 w-8 items-center justify-center border border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-zinc-100 hover:text-red-900"
                          label="Archive"
                          message={`Archive this ${config.singular.toLowerCase()}?`}
                        >
                          <Archive className="h-4 w-4" aria-hidden="true" />
                        </ConfirmActionButton>
                      </form>
                    ) : config.hardDelete ? (
                      <form action={hardDeleteRecordAction.bind(null, config.key as ModuleKey, String(row.id))}>
                        <ConfirmActionButton
                          className="inline-flex h-8 w-8 items-center justify-center border border-transparent text-zinc-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          label="Delete"
                          message={`Permanently delete this ${config.singular.toLowerCase()}? This cannot be undone.`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </ConfirmActionButton>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImageCell({ value }: { value: unknown }) {
  const imageUrl = typeof value === "string" && value ? value : "";

  return (
    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden border border-zinc-200 bg-zinc-50 text-[10px] font-medium uppercase text-zinc-400">
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill sizes="48px" className="object-cover" />
      ) : (
        "None"
      )}
    </div>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 w-8 items-center justify-center border border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-zinc-100 hover:text-red-900"
      aria-label={label}
      title={label}
    >
      {children}
    </Link>
  );
}
