"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { moduleConfigs, type FieldConfig, type ModuleKey } from "@/lib/admin/module-config";
import { requireSupabaseServerClient } from "@/lib/supabase/server";
import { toNumber } from "@/lib/utils";
import type { AnyRecord } from "@/types/database";

const uuidSchema = z.string().uuid();

export async function createRecordAction(moduleKey: ModuleKey, formData: FormData) {
  const config = moduleConfigs[moduleKey];
  if (!config?.creatable) throw new Error("This module does not allow new records.");

  const supabase = await requireSupabaseServerClient();
  const payload = await buildPayload(moduleKey, formData);

  const { data, error } = await supabase
    .from(config.table)
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const recordId = String(data.id);

  if (moduleKey === "payments") {
    await refreshOrderPaymentTotals(String(payload.order_id));
  }

  await logActivity({
    action_type: moduleKey === "payments" ? "payment_added" : "create",
    module: config.table,
    record_id: recordId,
    record_label: getRecordLabel(moduleKey, payload),
    description: `Created ${config.singular.toLowerCase()} ${getRecordLabel(moduleKey, payload)}.`,
    metadata: payload,
  });

  revalidatePath(`/admin/${config.path}`);
  redirect(`/admin/${config.path}/${recordId}?saved=1`);
}

export async function updateRecordAction(
  moduleKey: ModuleKey,
  id: string,
  formData: FormData,
) {
  const config = moduleConfigs[moduleKey];
  if (!config?.editable) throw new Error("This module does not allow editing.");
  uuidSchema.parse(id);

  const supabase = await requireSupabaseServerClient();
  const payload = await buildPayload(moduleKey, formData, id);

  const { data, error } = await supabase
    .from(config.table)
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  if (moduleKey === "payments") {
    await refreshOrderPaymentTotals(String(payload.order_id));
  }

  await logActivity({
    action_type: moduleKey === "payments" ? "payment_updated" : "update",
    module: config.table,
    record_id: id,
    record_label: getRecordLabel(moduleKey, data as AnyRecord),
    description: `Updated ${config.singular.toLowerCase()} ${getRecordLabel(
      moduleKey,
      data as AnyRecord,
    )}.`,
    metadata: payload,
  });

  revalidatePath(`/admin/${config.path}`);
  revalidatePath(`/admin/${config.path}/${id}`);
  redirect(`/admin/${config.path}/${id}?saved=1`);
}

export async function archiveRecordAction(moduleKey: ModuleKey, id: string) {
  const config = moduleConfigs[moduleKey];
  uuidSchema.parse(id);

  const supabase = await requireSupabaseServerClient();

  if (!config.archiveValue || !config.statusField) {
    await hardDeleteRecordAction(moduleKey, id);
    return;
  }

  const { data, error } = await supabase
    .from(config.table)
    .update({ [config.statusField]: config.archiveValue })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    action_type: "archive",
    module: config.table,
    record_id: id,
    record_label: getRecordLabel(moduleKey, data as AnyRecord),
    description: `Archived ${config.singular.toLowerCase()} ${getRecordLabel(
      moduleKey,
      data as AnyRecord,
    )}.`,
    metadata: { [config.statusField]: config.archiveValue },
  });

  revalidatePath(`/admin/${config.path}`);
  redirect(`/admin/${config.path}?archived=1`);
}

export async function hardDeleteRecordAction(moduleKey: ModuleKey, id: string) {
  const config = moduleConfigs[moduleKey];
  uuidSchema.parse(id);

  const supabase = await requireSupabaseServerClient();

  if (moduleKey === "payments") {
    const { data: existing } = await supabase
      .from("payments")
      .select("order_id, amount")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) throw new Error(error.message);
    if (existing?.order_id) await refreshOrderPaymentTotals(String(existing.order_id));
  } else {
    const { error } = await supabase.from(config.table).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  await logActivity({
    action_type: "delete",
    module: config.table,
    record_id: id,
    record_label: id,
    description: `Deleted ${config.singular.toLowerCase()} record.`,
    metadata: {},
  });

  revalidatePath(`/admin/${config.path}`);
  redirect(`/admin/${config.path}?deleted=1`);
}

export async function addProjectNoteAction(orderId: string, formData: FormData) {
  uuidSchema.parse(orderId);
  const note = String(formData.get("note") ?? "").trim();
  if (!note) throw new Error("A timeline note is required.");

  const supabase = await requireSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("order_timeline_entries").insert({
    order_id: orderId,
    user_id: user?.id ?? null,
    entry_type: "note",
    title: "Manual note",
    description: note,
  });

  if (error) throw new Error(error.message);

  await logActivity({
    action_type: "note_added",
    module: "projects",
    record_id: orderId,
    record_label: "Project note",
    description: note,
    metadata: { entry_type: "note" },
  });

  revalidatePath(`/admin/projects/${orderId}`);
}

export async function addPaymentToProjectAction(orderId: string, formData: FormData) {
  uuidSchema.parse(orderId);
  const supabase = await requireSupabaseServerClient();
  const payload = {
    order_id: orderId,
    amount: toNumber(formData.get("amount")),
    payment_method: String(formData.get("payment_method") || "cash"),
    payment_date:
      String(formData.get("payment_date") || "") || new Date().toISOString().slice(0, 10),
    reference_number: emptyToNull(formData.get("reference_number")),
    notes: emptyToNull(formData.get("notes")),
  };

  const { error } = await supabase.from("payments").insert(payload);
  if (error) throw new Error(error.message);

  await refreshOrderPaymentTotals(orderId);

  await logActivity({
    action_type: "payment_added",
    module: "payments",
    record_id: orderId,
    record_label: "Project payment",
    description: `Added payment of ${payload.amount}.`,
    metadata: payload,
  });

  revalidatePath(`/admin/projects/${orderId}`);
}

export async function logoutAction() {
  const supabase = await requireSupabaseServerClient();
  await logActivity({
    action_type: "logout",
    module: "authentication",
    record_id: null,
    record_label: "Admin logout",
    description: "Admin signed out.",
    metadata: {},
  });
  await supabase.auth.signOut();
  redirect("/login");
}

async function buildPayload(moduleKey: ModuleKey, formData: FormData, id?: string) {
  const config = moduleConfigs[moduleKey];
  const payload: AnyRecord = {};

  for (const field of config.formFields) {
    const value = await parseFieldValue(field, formData);
    if (value !== undefined) {
      payload[field.name] = value;
    }
  }

  if (moduleKey === "projects") {
    const amountPaid = Number(payload.amount_paid ?? 0);
    const totalPrice = Number(payload.total_price ?? 0);
    payload.quantity = Number(payload.quantity || 1);
    payload.page_count = Number(payload.page_count || 0);
    payload.balance_due = Math.max(totalPrice - amountPaid, 0);
    payload.payment_status = derivePaymentStatus(
      totalPrice,
      amountPaid,
      String(payload.payment_status ?? "unpaid"),
    );
    payload.file_received_via_messenger = Boolean(payload.file_received_via_messenger);

    if (!id) {
      payload.order_number = await generateOrderNumber();
    }
  }

  if (moduleKey === "inventory") {
    payload.quantity = Number(payload.quantity ?? 0);
    payload.minimum_stock_level = Number(payload.minimum_stock_level ?? 0);
    payload.status = deriveInventoryStatus(
      Number(payload.quantity),
      Number(payload.minimum_stock_level),
      String(payload.status || "in_stock"),
    );
  }

  if (moduleKey === "payments") {
    payload.amount = Number(payload.amount ?? 0);
  }

  return payload;
}

async function parseFieldValue(field: FieldConfig, formData: FormData) {
  const rawValue = formData.get(field.name);

  if (field.type === "image") {
    return uploadImageField(field, rawValue);
  }

  if (field.required && (rawValue === null || String(rawValue).trim() === "")) {
    throw new Error(`${field.label} is required.`);
  }

  if (field.type === "checkbox") return rawValue === "on";
  if (field.type === "number") return toNumber(rawValue);
  if (field.type === "multiline") {
    return String(rawValue ?? "")
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return emptyToNull(rawValue);
}

async function uploadImageField(
  field: FieldConfig,
  rawValue: FormDataEntryValue | null,
) {
  if (!isUploadedFile(rawValue) || rawValue.size === 0) return undefined;

  if (!rawValue.type.startsWith("image/")) {
    throw new Error(`${field.label} must be an image file.`);
  }

  const maxSizeMb = field.maxSizeMb ?? 5;
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (rawValue.size > maxBytes) {
    throw new Error(`${field.label} must be ${maxSizeMb} MB or smaller.`);
  }

  const supabase = await requireSupabaseServerClient();
  const bucket = field.storageBucket ?? "product-images";
  const extension = getImageExtension(rawValue);
  const objectPath = `products/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, rawValue, {
      cacheControl: "31536000",
      contentType: rawValue.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    value !== null &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value &&
    "type" in value
  );
}

function getImageExtension(file: File) {
  const byType = file.type.split("/")[1]?.toLowerCase();
  if (byType === "jpeg") return "jpg";
  if (byType && ["png", "jpg", "webp", "gif"].includes(byType)) return byType;

  const byName = file.name.split(".").pop()?.toLowerCase();
  if (byName && ["png", "jpg", "jpeg", "webp", "gif"].includes(byName)) {
    return byName === "jpeg" ? "jpg" : byName;
  }

  return "png";
}

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text === "" ? null : text;
}

async function generateOrderNumber() {
  const supabase = await requireSupabaseServerClient();
  const dateKey = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const prefix = `IP-${dateKey}`;

  const { count } = await supabase
    .from("projects_orders")
    .select("id", { count: "exact", head: true })
    .like("order_number", `${prefix}-%`);

  return `${prefix}-${String((count ?? 0) + 1).padStart(3, "0")}`;
}

async function refreshOrderPaymentTotals(orderId: string) {
  const supabase = await requireSupabaseServerClient();
  const [payments, project] = await Promise.all([
    supabase.from("payments").select("amount").eq("order_id", orderId),
    supabase.from("projects_orders").select("total_price").eq("id", orderId).single(),
  ]);

  if (payments.error) throw new Error(payments.error.message);
  if (project.error) throw new Error(project.error.message);

  const amountPaid = (payments.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0,
  );
  const totalPrice = Number(project.data.total_price ?? 0);
  const balanceDue = Math.max(totalPrice - amountPaid, 0);
  const paymentStatus = derivePaymentStatus(totalPrice, amountPaid);

  const { error } = await supabase
    .from("projects_orders")
    .update({
      amount_paid: amountPaid,
      balance_due: balanceDue,
      payment_status: paymentStatus,
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

function derivePaymentStatus(totalPrice: number, amountPaid: number, fallback = "unpaid") {
  if (fallback === "refunded") return "refunded";
  if (amountPaid <= 0) return "unpaid";
  if (amountPaid < totalPrice) return "partial";
  return "paid";
}

function deriveInventoryStatus(quantity: number, minimum: number, fallback = "in_stock") {
  if (fallback === "archived") return "archived";
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= minimum) return "low_stock";
  return "in_stock";
}

async function logActivity(log: {
  action_type: string;
  module: string;
  record_id: string | null;
  record_label: string | null;
  description: string;
  metadata: AnyRecord;
}) {
  const supabase = await requireSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("activity_logs").insert({
    user_id: user?.id ?? null,
    ...log,
  });
}

function getRecordLabel(moduleKey: ModuleKey, record: AnyRecord) {
  if (moduleKey === "clients") return String(record.full_name ?? "client");
  if (moduleKey === "projects") return String(record.order_number ?? record.title ?? "order");
  if (moduleKey === "payments") return String(record.reference_number ?? "payment");
  if (moduleKey === "expenses") return String(record.expense_name ?? "expense");
  if (moduleKey === "inventory") return String(record.item_name ?? "inventory item");
  if (moduleKey === "products") return String(record.name ?? "product");
  if (moduleKey === "services") return String(record.name ?? "service");
  if (moduleKey === "packages") return String(record.name ?? "package");
  if (moduleKey === "prices") return String(record.service_name ?? "price item");
  return String(record.id ?? "record");
}
