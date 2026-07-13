"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminSupabaseClient } from "@/lib/supabase/server";

const optionalText = z.preprocess(
  (value) => String(value ?? "").trim() || null,
  z.string().nullable(),
);

const optionalUrl = z.preprocess(
  (value) => String(value ?? "").trim() || null,
  z.string().url().nullable(),
);

const settingsSchema = z.object({
  business_name: z.string().trim().min(2),
  location: z.string().trim().min(2),
  address_note: optionalText,
  motto: z.string().trim().min(2),
  business_description: optionalText,
  hero_eyebrow: optionalText,
  hero_title: z.string().trim().min(4),
  hero_description: optionalText,
  messenger_url: optionalUrl,
  facebook_url: optionalUrl,
  facebook_name: optionalText,
  email: z.preprocess(
    (value) => String(value ?? "").trim() || null,
    z.string().email().nullable(),
  ),
  phone: optionalText,
  website_url: optionalUrl,
  hours: optionalText,
  hours_note: optionalText,
  payment_instructions: optionalText,
  walk_in_note: optionalText,
  announcement: optionalText,
  seo_title: optionalText,
  seo_description: optionalText,
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  background_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function updateSiteSettingsAction(formData: FormData) {
  const supabase = await requireAdminSupabaseClient();
  const payload = settingsSchema.parse(Object.fromEntries(formData.entries()));

  const heroImage = await uploadSiteAsset(supabase, formData.get("hero_image"), "hero");
  const logoImage = await uploadSiteAsset(supabase, formData.get("logo_image"), "logo");
  const mascotImage = await uploadSiteAsset(supabase, formData.get("mascot_image"), "mascot");

  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    ...payload,
    hero_image_url: heroImage ?? textOrNull(formData.get("current_hero_image")),
    logo_url: logoImage ?? textOrNull(formData.get("current_logo_image")),
    mascot_url: mascotImage ?? textOrNull(formData.get("current_mascot_image")),
  });

  if (error) throw new Error(error.message);
  refreshWebsite();
  redirect("/admin/website?saved=settings#business-content");
}

export async function saveSiteSectionAction(sectionKey: string, formData: FormData) {
  const supabase = await requireAdminSupabaseClient();
  const { error } = await supabase.from("site_sections").upsert(
    {
      section_key: sectionKey,
      title: requiredText(formData.get("title"), "Section title"),
      is_visible: formData.get("is_visible") === "on",
      display_order: toInteger(formData.get("display_order"), 0),
    },
    { onConflict: "section_key" },
  );

  if (error) throw new Error(error.message);
  refreshWebsite();
  redirect("/admin/website?saved=sections#page-sections");
}

export async function saveSiteListItemAction(
  collection: "faq_items" | "order_steps",
  id: string | null,
  formData: FormData,
) {
  const supabase = await requireAdminSupabaseClient();
  const base = {
    is_visible: formData.get("is_visible") === "on",
    display_order: toInteger(formData.get("display_order"), 0),
  };
  const recordId = id ? z.string().uuid().parse(id) : null;
  let error: { message: string } | null = null;

  if (collection === "faq_items") {
    const payload = {
      ...base,
      question: requiredText(formData.get("question"), "Question"),
      answer: requiredText(formData.get("answer"), "Answer"),
    };
    const result = recordId
      ? await supabase.from("faq_items").update(payload).eq("id", recordId)
      : await supabase.from("faq_items").insert(payload);
    error = result.error;
  } else {
    const payload = {
      ...base,
      title: requiredText(formData.get("title"), "Step title"),
      description: textOrNull(formData.get("description")),
    };
    const result = recordId
      ? await supabase.from("order_steps").update(payload).eq("id", recordId)
      : await supabase.from("order_steps").insert(payload);
    error = result.error;
  }

  if (error) throw new Error(error.message);
  refreshWebsite();
  redirect(`/admin/website?saved=${collection}#${collection}`);
}

export async function deleteSiteListItemAction(
  collection: "faq_items" | "order_steps",
  id: string,
) {
  const supabase = await requireAdminSupabaseClient();
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq("id", z.string().uuid().parse(id));
  if (error) throw new Error(error.message);

  refreshWebsite();
  redirect(`/admin/website?deleted=${collection}#${collection}`);
}

async function uploadSiteAsset(
  supabase: Awaited<ReturnType<typeof requireAdminSupabaseClient>>,
  value: FormDataEntryValue | null,
  folder: string,
) {
  if (!isUploadedFile(value)) return null;
  if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(value.type)) {
    throw new Error("Website images must be PNG, JPG, WebP, or GIF files.");
  }
  if (value.size > 8 * 1024 * 1024) throw new Error("Website images must be 8 MB or smaller.");

  const extension = value.type === "image/jpeg" ? "jpg" : value.type.split("/")[1];
  const objectPath = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("site-assets").upload(objectPath, value, {
    contentType: value.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return supabase.storage.from("site-assets").getPublicUrl(objectPath).data.publicUrl;
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
      typeof value === "object" &&
      "size" in value &&
      "type" in value &&
      value.size > 0,
  );
}

function requiredText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} is required.`);
  return text;
}

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function toInteger(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function refreshWebsite() {
  revalidatePath("/");
  revalidatePath("/admin/website");
}
