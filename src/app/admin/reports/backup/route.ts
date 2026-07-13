import { requireAdminSupabaseClient } from "@/lib/supabase/server";

const tables = [
  "site_settings",
  "site_sections",
  "faq_items",
  "order_steps",
  "order_form_options",
  "services",
  "price_items",
  "products",
  "packages",
  "online_orders",
  "clients",
  "projects_orders",
  "payments",
  "expenses",
  "inventory_items",
  "inventory_transactions",
  "order_timeline_entries",
];

export async function GET() {
  const supabase = await requireAdminSupabaseClient();
  const entries = await Promise.all(
    tables.map(async (table) => {
      const { data, error } = await supabase.from(table).select("*").limit(10000);
      return [table, error ? { error: error.message } : data] as const;
    }),
  );
  const backup = {
    exported_at: new Date().toISOString(),
    application: "InkPoint Prints & Services",
    tables: Object.fromEntries(entries),
  };

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="inkpoint-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
