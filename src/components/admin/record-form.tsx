import Link from "next/link";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  createRecordAction,
  updateRecordAction,
} from "@/lib/admin/actions";
import type { ModuleConfig, ModuleKey } from "@/lib/admin/module-config";
import { toInputDate, toInputDateTime } from "@/lib/utils";
import type { AnyRecord, RelationOption } from "@/types/database";

export function RecordForm({
  config,
  record,
  relationOptions,
}: {
  config: ModuleConfig;
  record?: AnyRecord | null;
  relationOptions: Record<string, RelationOption[]>;
}) {
  const action = record
    ? updateRecordAction.bind(null, config.key as ModuleKey, String(record.id))
    : createRecordAction.bind(null, config.key as ModuleKey);

  return (
    <form action={action} className="space-y-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
      <div className="grid gap-4 md:grid-cols-2">
        {config.formFields.map((field) => (
          <FieldControl
            key={field.name}
            field={field}
            value={record?.[field.name]}
            options={relationOptions[field.name] ?? []}
          />
        ))}
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
        <Link
          href={`/admin/${config.path}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:border-red-900 hover:text-red-900"
        >
          Cancel
        </Link>
        <SubmitButton>{record ? "Save changes" : `Add ${config.singular}`}</SubmitButton>
      </div>
    </form>
  );
}

function FieldControl({
  field,
  value,
  options,
}: {
  field: ModuleConfig["formFields"][number];
  value: unknown;
  options: RelationOption[];
}) {
  const base =
    "mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-900/10";
  const label = (
    <span className="text-sm font-medium text-zinc-800">
      {field.label}
      {field.required ? <span className="text-red-900"> *</span> : null}
    </span>
  );

  if (field.type === "textarea" || field.type === "multiline") {
    return (
      <label className="block md:col-span-2">
        {label}
        <textarea
          name={field.name}
          required={field.required}
          defaultValue={formatFieldValue(field.type, value)}
          rows={field.type === "multiline" ? 5 : 4}
          placeholder={field.placeholder}
          className={`${base} min-h-28 py-2`}
        />
        {field.help ? <p className="mt-1 text-xs text-zinc-500">{field.help}</p> : null}
      </label>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex min-h-16 items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
        <input
          name={field.name}
          type="checkbox"
          defaultChecked={Boolean(value)}
          className="h-4 w-4 rounded border-zinc-300 text-red-900 focus:ring-red-900"
        />
        <span>
          {label}
          {field.help ? <span className="block text-xs text-zinc-500">{field.help}</span> : null}
        </span>
      </label>
    );
  }

  if (field.type === "select") {
    const selectOptions: RelationOption[] =
      options.length > 0
        ? options
        : (field.options ?? []).map((option) => ({
            value: option.value,
            label: option.label,
          }));

    return (
      <label className="block">
        {label}
        <select
          name={field.name}
          required={field.required}
          defaultValue={String(value ?? "")}
          className={`${base} h-10`}
        >
          {!field.required ? <option value="">Not set</option> : null}
          {selectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.description ? `${option.label} - ${option.description}` : option.label}
            </option>
          ))}
        </select>
        {field.help ? <p className="mt-1 text-xs text-zinc-500">{field.help}</p> : null}
      </label>
    );
  }

  return (
    <label className="block">
      {label}
      <input
        name={field.name}
        type={field.type}
        min={field.min}
        step={field.step}
        required={field.required}
        defaultValue={formatFieldValue(field.type, value)}
        placeholder={field.placeholder}
        className={`${base} h-10`}
      />
      {field.help ? <p className="mt-1 text-xs text-zinc-500">{field.help}</p> : null}
    </label>
  );
}

function formatFieldValue(type: string, value: unknown) {
  if (Array.isArray(value)) return value.join("\n");
  if (type === "date") return toInputDate(value as string);
  if (type === "datetime-local") return toInputDateTime(value as string);
  if (value === null || value === undefined) return "";
  return String(value);
}
