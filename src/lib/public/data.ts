import {
  defaultFaqs,
  defaultOrderStepItems,
  defaultPackages,
  defaultPriceItems,
  defaultProducts,
  defaultServices,
  defaultSiteSections,
  defaultSiteSettings,
} from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteListItem, SiteSection, SiteSettings } from "@/types/site";

export async function getPublicSiteData() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallbackData();

  const [settings, sections, services, products, packages, prices, faqs, steps] =
    await Promise.all([
      supabase.from("site_settings").select("*").eq("id", "main").maybeSingle(),
      supabase
        .from("site_sections")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("services")
        .select("*")
        .eq("is_available", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("packages")
        .select("*")
        .eq("is_available", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("price_items")
        .select("*")
        .eq("is_available", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("faq_items")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("order_steps")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),
    ]);

  return {
    settings: settings.error || !settings.data
      ? ({ ...defaultSiteSettings } as SiteSettings)
      : (settings.data as SiteSettings),
    sections: sections.error
      ? (defaultSiteSections as SiteSection[])
      : (sections.data as SiteSection[]),
    services: services.error ? defaultServices : services.data,
    products: products.error ? defaultProducts : products.data,
    packages: packages.error ? defaultPackages : packages.data,
    prices: prices.error ? defaultPriceItems : prices.data,
    faqs: faqs.error
      ? (defaultFaqs as SiteListItem[])
      : (faqs.data as SiteListItem[]),
    steps: steps.error
      ? (defaultOrderStepItems as SiteListItem[])
      : (steps.data as SiteListItem[]),
  };
}

export async function getWebsiteManagerData() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ...fallbackData(), configured: false, error: null };

  const [settings, sections, faqs, steps] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", "main").maybeSingle(),
    supabase.from("site_sections").select("*").order("display_order"),
    supabase.from("faq_items").select("*").order("display_order"),
    supabase.from("order_steps").select("*").order("display_order"),
  ]);

  return {
    ...fallbackData(),
    configured: true,
    settings: settings.data
      ? (settings.data as SiteSettings)
      : ({ ...defaultSiteSettings } as SiteSettings),
    sections: sections.data?.length
      ? (sections.data as SiteSection[])
      : (defaultSiteSections as SiteSection[]),
    faqs: faqs.data?.length
      ? (faqs.data as SiteListItem[])
      : (defaultFaqs as SiteListItem[]),
    steps: steps.data?.length
      ? (steps.data as SiteListItem[])
      : (defaultOrderStepItems as SiteListItem[]),
    error:
      settings.error?.message ??
      sections.error?.message ??
      faqs.error?.message ??
      steps.error?.message ??
      null,
  };
}

function fallbackData() {
  return {
    settings: { ...defaultSiteSettings } as SiteSettings,
    sections: defaultSiteSections as SiteSection[],
    services: defaultServices,
    products: defaultProducts,
    packages: defaultPackages,
    prices: defaultPriceItems,
    faqs: defaultFaqs as SiteListItem[],
    steps: defaultOrderStepItems as SiteListItem[],
  };
}
