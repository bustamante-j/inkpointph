"use server";

import { headers } from "next/headers";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateOrderEstimate } from "@/lib/public/pricing";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { PublicPriceItem, PublicService } from "@/types/site";

export type OnlineOrderState = {
  status: "idle" | "error" | "success";
  message: string;
  orderNumber?: string;
};

const optionalText = z.preprocess(
  (value) => String(value ?? "").trim() || undefined,
  z.string().optional(),
);

const optionalEmail = z.preprocess(
  (value) => String(value ?? "").trim() || undefined,
  z.string().email("Enter a valid email address.").optional(),
);

const optionalNumber = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.coerce.number().int().min(1).optional(),
);

const orderSchema = z.object({
  customer_name: z.string().trim().min(2, "Enter your name."),
  contact_number: z.string().trim().min(7, "Enter a valid contact number."),
  messenger_name: optionalText,
  email: optionalEmail,
  service_type: z.string().trim().min(2),
  quantity: z.coerce.number().int().min(1).max(1000),
  page_count: optionalNumber,
  print_color: optionalText,
  paper_size: optionalText,
  print_sides: optionalText,
  photo_size: optionalText,
  certificate_type: optionalText,
  needed_by: optionalText,
  pickup_or_delivery: z.enum(["pickup", "delivery"]),
  delivery_address: optionalText,
  additional_instructions: optionalText,
  is_rush: z.boolean(),
  privacy_consent: z.literal(true, { error: "Please confirm the file and contact-data notice." }),
  website: optionalText,
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

export async function submitOnlineOrderAction(
  _previousState: OnlineOrderState,
  formData: FormData,
): Promise<OnlineOrderState> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return fail("Online ordering is being configured. Please message InkPoint for now.");
  }

  const parsed = orderSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    is_rush: formData.get("is_rush") === "on",
    privacy_consent: formData.get("privacy_consent") === "on",
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check your order details.");
  if (parsed.data.website) return fail("The order could not be submitted.");

  const payload = parsed.data;
  const [{ data: service, error: serviceError }, { data: priceRows, error: priceError }] =
    await Promise.all([
      supabase
        .from("services")
        .select("*")
        .eq("name", payload.service_type)
        .eq("is_available", true)
        .maybeSingle(),
      supabase
        .from("price_items")
        .select("*")
        .eq("service_name", payload.service_type)
        .eq("is_available", true),
    ]);

  if (serviceError || priceError || !service) {
    return fail("That service is not available right now. Refresh the page and try again.");
  }

  const serviceMeta = service as PublicService;
  const detailError = validateServiceDetails(payload, serviceMeta);
  if (detailError) return fail(detailError);

  const estimate = calculateOrderEstimate(
    {
      serviceType: payload.service_type,
      quantity: payload.quantity,
      pageCount: payload.page_count,
      printColor: payload.print_color,
      photoSize: payload.photo_size,
    },
    (priceRows ?? []) as PublicPriceItem[],
  );
  if (!estimate) return fail("A complete price is not configured for this order option yet.");

  const orderFiles = formData.getAll("order_files").filter(isUploadedFile);
  const paymentScreenshot = formData.get("payment_screenshot");
  if (orderFiles.length === 0) return fail("Upload at least one file for your order.");
  if (orderFiles.length > 5) return fail("Upload up to 5 order files only.");
  if (!isUploadedFile(paymentScreenshot)) {
    return fail("Attach your GCash payment screenshot before submitting.");
  }

  const fingerprint = await requestFingerprint();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("online_orders")
    .select("id", { count: "exact", head: true })
    .eq("request_fingerprint", fingerprint)
    .gte("created_at", since);
  if ((count ?? 0) >= 5) {
    return fail("Too many recent orders were sent from this connection. Please try again later.");
  }

  const orderId = crypto.randomUUID();
  const uploadedPaths: string[] = [];

  try {
    for (const file of orderFiles) {
      uploadedPaths.push(
        await uploadPrivateOrderFile(supabase, file, `online-orders/${orderId}/files`, {
          allowedTypes: allowedOrderFileTypes,
          maxSizeMb: 15,
        }),
      );
    }

    const paymentScreenshotPath = await uploadPrivateOrderFile(
      supabase,
      paymentScreenshot,
      `online-orders/${orderId}/payments`,
      { allowedTypes: allowedScreenshotTypes, maxSizeMb: 8 },
    );
    uploadedPaths.push(paymentScreenshotPath);

    const orderDetails = buildOrderDetails(payload, estimate.total, orderFiles.length);
    const { data, error } = await supabase
      .from("online_orders")
      .insert({
        id: orderId,
        customer_name: payload.customer_name,
        contact_number: payload.contact_number,
        messenger_name: payload.messenger_name ?? null,
        email: payload.email ?? null,
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
        delivery_address: payload.delivery_address ?? null,
        is_rush: payload.is_rush,
        order_file_paths: uploadedPaths.slice(0, orderFiles.length),
        order_file_names: orderFiles.map((file) => file.name),
        payment_screenshot_path: paymentScreenshotPath,
        estimated_total: estimate.total,
        payment_status: "pending_verification",
        payment_method: "gcash",
        payment_reference: "Private GCash screenshot attached",
        additional_instructions: payload.additional_instructions ?? null,
        request_fingerprint: fingerprint,
        privacy_consent_at: new Date().toISOString(),
      })
      .select("order_number")
      .single();

    if (error) throw new Error(error.message);

    return {
      status: "success",
      message: "Order received. Keep your order number for tracking.",
      orderNumber: String(data.order_number),
    };
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from("order-uploads").remove(uploadedPaths);
    }
    return fail(error instanceof Error ? error.message : "The order could not be submitted.");
  }
}

function validateServiceDetails(payload: z.infer<typeof orderSchema>, service: PublicService) {
  if (service.requires_page_count && !payload.page_count) return "Number of pages is required.";
  if (service.allows_color && !payload.print_color) return "Choose a color option.";
  if (service.requires_paper_size && !payload.paper_size) return "Choose a paper size.";
  if (service.allows_sides && !payload.print_sides) return "Choose single-sided or double-sided.";
  if (service.allows_photo_size && !payload.photo_size) return "Choose a photo size.";
  if (service.allows_certificate_type && !payload.certificate_type) return "Choose a certificate type.";
  if (payload.pickup_or_delivery === "delivery" && !payload.delivery_address) {
    return "Enter a delivery address or landmark.";
  }
  return null;
}

async function uploadPrivateOrderFile(
  supabase: SupabaseClient,
  file: File,
  folder: string,
  options: { allowedTypes: Set<string>; maxSizeMb: number },
) {
  if (!options.allowedTypes.has(file.type)) throw new Error(`${file.name} is not an accepted file type.`);
  if (file.size > options.maxSizeMb * 1024 * 1024) {
    throw new Error(`${file.name} must be ${options.maxSizeMb} MB or smaller.`);
  }

  const objectPath = `${folder}/${crypto.randomUUID()}.${getFileExtension(file)}`;
  const { error } = await supabase.storage.from("order-uploads").upload(objectPath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return objectPath;
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return Boolean(value && typeof value === "object" && "size" in value && value.size > 0);
}

function getFileExtension(file: File) {
  const byName = file.name.split(".").pop()?.toLowerCase();
  if (byName && /^[a-z0-9]+$/.test(byName)) return byName;
  const byType = file.type.split("/")[1]?.toLowerCase();
  return byType === "jpeg" ? "jpg" : byType?.replace(/[^a-z0-9]/g, "") || "file";
}

function buildOrderDetails(payload: z.infer<typeof orderSchema>, total: number, fileCount: number) {
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
    payload.delivery_address ? `Delivery address: ${payload.delivery_address}` : null,
    `Rush order: ${payload.is_rush ? "Yes" : "No"}`,
    `Uploaded files: ${fileCount}`,
    `Calculated total: PHP ${total.toFixed(2)}`,
    payload.additional_instructions ? `Additional details: ${payload.additional_instructions}` : null,
  ].filter(Boolean).join("\n");
}

async function requestFingerprint() {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const userAgent = requestHeaders.get("user-agent") || "unknown";
  const bytes = new TextEncoder().encode(`${ip}|${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function labelize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function fail(message: string): OnlineOrderState {
  return { status: "error", message };
}
