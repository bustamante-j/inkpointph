"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const optionalText = z.preprocess(
  (value) => (value === null ? undefined : value),
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
);

const optionalEmail = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().trim().email().optional().or(z.literal("")),
);

const optionalNumber = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.coerce.number().min(1).optional(),
);

const orderSchema = z.object({
  customer_name: z.string().trim().min(2, "Name is required."),
  contact_number: z.string().trim().min(3, "Contact number is required."),
  messenger_name: optionalText,
  email: optionalEmail,
  service_type: z.enum(["Printing", "Photocopy", "Photo Printing", "Certificate Printing"]),
  quantity: z.coerce.number().min(1).default(1),
  page_count: optionalNumber,
  print_color: optionalText,
  paper_size: optionalText,
  print_sides: optionalText,
  photo_size: optionalText,
  certificate_type: optionalText,
  needed_by: optionalText,
  pickup_or_delivery: z.enum(["pickup", "delivery"]),
  additional_instructions: optionalText,
});

const allowedOrderFileTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

const allowedScreenshotTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function submitOnlineOrderAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Online orders are not available yet. Supabase is not configured.");
  }

  const payload = orderSchema.parse({
    customer_name: formData.get("customer_name"),
    contact_number: formData.get("contact_number"),
    messenger_name: formData.get("messenger_name"),
    email: formData.get("email"),
    service_type: formData.get("service_type"),
    quantity: formData.get("quantity"),
    page_count: formData.get("page_count"),
    print_color: formData.get("print_color"),
    paper_size: formData.get("paper_size"),
    print_sides: formData.get("print_sides"),
    photo_size: formData.get("photo_size"),
    certificate_type: formData.get("certificate_type"),
    needed_by: formData.get("needed_by"),
    pickup_or_delivery: formData.get("pickup_or_delivery"),
    additional_instructions: formData.get("additional_instructions"),
  });

  validateServiceDetails(payload);

  const orderId = crypto.randomUUID();
  const orderFiles = formData.getAll("order_files").filter(isUploadedFile);
  const paymentScreenshot = formData.get("payment_screenshot");

  if (orderFiles.length > 5) {
    throw new Error("Please upload up to 5 order files only.");
  }

  const uploadedFiles = await Promise.all(
    orderFiles.map((file) =>
      uploadOrderFile(supabase, file, `online-orders/${orderId}/files`, {
        allowedTypes: allowedOrderFileTypes,
        maxSizeMb: 15,
      }),
    ),
  );

  const paymentScreenshotUrl = isUploadedFile(paymentScreenshot)
    ? await uploadOrderFile(supabase, paymentScreenshot, `online-orders/${orderId}/payments`, {
        allowedTypes: allowedScreenshotTypes,
        maxSizeMb: 8,
      })
    : null;

  const orderDetails = buildOrderDetails({
    ...payload,
    fileCount: uploadedFiles.length,
    hasPaymentScreenshot: Boolean(paymentScreenshotUrl),
  });

  const { error } = await supabase.from("online_orders").insert({
    id: orderId,
    customer_name: payload.customer_name,
    contact_number: payload.contact_number,
    messenger_name: payload.messenger_name ?? null,
    email: payload.email || null,
    service_type: payload.service_type,
    order_details: orderDetails,
    quantity: payload.quantity,
    page_count: payload.page_count ?? null,
    print_color: payload.print_color ?? null,
    paper_size: payload.paper_size ?? null,
    print_sides: payload.print_sides ?? null,
    photo_size: payload.photo_size ?? null,
    certificate_type: payload.certificate_type ?? null,
    needed_by: payload.needed_by ?? null,
    pickup_or_delivery: payload.pickup_or_delivery,
    order_file_urls: uploadedFiles.map((file) => file.url),
    order_file_names: uploadedFiles.map((file) => file.name),
    payment_screenshot_url: paymentScreenshotUrl,
    payment_method: "gcash",
    payment_reference: paymentScreenshotUrl ? "GCash screenshot attached" : "No screenshot attached",
    payment_note: null,
    additional_instructions: payload.additional_instructions ?? null,
  });

  if (error) throw new Error(error.message);

  redirect("/?order=received#online-order");
}

function validateServiceDetails(payload: z.infer<typeof orderSchema>) {
  if (["Printing", "Photocopy"].includes(payload.service_type)) {
    if (!payload.page_count) throw new Error("Number of pages is required.");
    if (!payload.print_color) throw new Error("Color option is required.");
    if (!payload.paper_size) throw new Error("Paper size is required.");
  }

  if (payload.service_type === "Photo Printing" && !payload.photo_size) {
    throw new Error("Photo size is required.");
  }

  if (payload.service_type === "Certificate Printing") {
    if (!payload.print_color) throw new Error("Color option is required.");
    if (!payload.paper_size) throw new Error("Paper size is required.");
  }
}

async function uploadOrderFile(
  supabase: SupabaseClient,
  file: File,
  folder: string,
  options: {
    allowedTypes: Set<string>;
    maxSizeMb: number;
  },
) {
  if (!options.allowedTypes.has(file.type)) {
    throw new Error(`${file.name} is not an accepted file type.`);
  }

  const maxBytes = options.maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`${file.name} must be ${options.maxSizeMb} MB or smaller.`);
  }

  const extension = getFileExtension(file);
  const objectPath = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("order-uploads").upload(objectPath, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("order-uploads").getPublicUrl(objectPath);
  return { name: file.name, url: data.publicUrl };
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    value !== null &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value &&
    "type" in value &&
    value.size > 0
  );
}

function getFileExtension(file: File) {
  const byName = file.name.split(".").pop()?.toLowerCase();
  if (byName && /^[a-z0-9]+$/.test(byName)) return byName;

  const byType = file.type.split("/")[1]?.toLowerCase();
  if (byType === "jpeg") return "jpg";
  if (byType) return byType.replace(/[^a-z0-9]/g, "");
  return "file";
}

function buildOrderDetails(
  payload: z.infer<typeof orderSchema> & {
    fileCount: number;
    hasPaymentScreenshot: boolean;
  },
) {
  return [
    `Service: ${payload.service_type}`,
    `Quantity: ${payload.quantity}`,
    payload.page_count ? `Pages: ${payload.page_count}` : null,
    payload.print_color ? `Color: ${labelize(payload.print_color)}` : null,
    payload.paper_size ? `Paper size: ${labelize(payload.paper_size)}` : null,
    payload.print_sides ? `Print side: ${labelize(payload.print_sides)}` : null,
    payload.photo_size ? `Photo size: ${labelize(payload.photo_size)}` : null,
    payload.certificate_type ? `Certificate type: ${labelize(payload.certificate_type)}` : null,
    payload.needed_by ? `Needed by: ${payload.needed_by}` : null,
    `Pickup / delivery: ${labelize(payload.pickup_or_delivery)}`,
    `Uploaded order files: ${payload.fileCount}`,
    `GCash screenshot: ${payload.hasPaymentScreenshot ? "Attached" : "Not attached"}`,
    payload.additional_instructions
      ? `Additional details: ${payload.additional_instructions}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function labelize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
