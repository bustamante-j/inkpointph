import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getNestedValue, normalizeSearchParam } from "@/lib/utils";
import {
  moduleConfigs,
  type FieldConfig,
  type ModuleConfig,
  type ModuleKey,
} from "@/lib/admin/module-config";
import type { AnyRecord, DashboardSummary, RelationOption } from "@/types/database";

export type AdminFilters = {
  q?: string;
  status?: string;
  payment?: string;
  service?: string;
  from?: string;
  to?: string;
};

export async function fetchModuleRows(
  moduleKey: ModuleKey,
  filters: AdminFilters = {},
) {
  const config = moduleConfigs[moduleKey];
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { configured: false, rows: [] as AnyRecord[], error: null };
  }

  const { data, error } = await supabase
    .from(config.table)
    .select(config.select)
    .order(config.orderBy.column, { ascending: config.orderBy.ascending })
    .limit(500);

  if (error) return { configured: true, rows: [] as AnyRecord[], error: error.message };

  return {
    configured: true,
    rows: filterRows(asRows(data), config, filters),
    error: null,
  };
}

export async function fetchRecord(moduleKey: ModuleKey, id: string) {
  const config = moduleConfigs[moduleKey];
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { configured: false, record: null, error: null };

  const { data, error } = await supabase
    .from(config.table)
    .select(config.select)
    .eq("id", id)
    .single();

  const record = asRecord(data);
  if (moduleKey === "onlineOrders" && record) {
    const filePaths = Array.isArray(record.order_file_paths)
      ? record.order_file_paths.map(String)
      : [];
    if (filePaths.length) {
      const { data: signedFiles } = await supabase.storage
        .from("order-uploads")
        .createSignedUrls(filePaths, 60 * 30);
      record.order_file_signed_urls = signedFiles?.map((file) => file.signedUrl) ?? [];
    }

    if (record.payment_screenshot_path) {
      const { data: screenshot } = await supabase.storage
        .from("order-uploads")
        .createSignedUrl(String(record.payment_screenshot_path), 60 * 30);
      record.payment_screenshot_signed_url = screenshot?.signedUrl ?? null;
    }
  }

  return {
    configured: true,
    record,
    error: error?.message ?? null,
  };
}

export async function fetchRelationOptions(fields: FieldConfig[]) {
  const supabase = await createSupabaseServerClient();
  const options: Record<string, RelationOption[]> = {};

  if (!supabase) return options;

  await Promise.all(
    fields
      .filter((field) => field.relation)
      .map(async (field) => {
        const relation = field.relation!;
        const columns = [
          relation.valueColumn,
          relation.labelColumn,
          relation.descriptionColumn,
        ]
          .filter(Boolean)
          .join(",");

        const query = supabase.from(relation.table).select(columns).limit(250);
        const ordered = relation.orderColumn
          ? query.order(relation.orderColumn, {
              ascending: relation.orderColumn !== "created_at",
            })
          : query;

        const { data } = await ordered;
        options[field.name] = asRows(data).map((row) => ({
          value: String(row[relation.valueColumn]),
          label: String(row[relation.labelColumn] ?? "Untitled"),
          description: relation.descriptionColumn
            ? String(row[relation.descriptionColumn] ?? "")
            : undefined,
        }));
      }),
  );

  return options;
}

export async function fetchProjectDetail(id: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      configured: false,
      project: null,
      payments: [] as AnyRecord[],
      logs: [] as AnyRecord[],
      notes: [] as AnyRecord[],
      error: null,
    };
  }

  const [projectResult, paymentsResult, logsResult, notesResult] = await Promise.all([
    supabase
      .from("projects_orders")
      .select("*, clients(full_name, phone_number, messenger_name, email)")
      .eq("id", id)
      .single(),
    supabase
      .from("payments")
      .select("*")
      .eq("order_id", id)
      .order("payment_date", { ascending: false }),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("record_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("order_timeline_entries")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return {
    configured: true,
    project: asRecord(projectResult.data),
    payments: asRows(paymentsResult.data),
    logs: asRows(logsResult.data),
    notes: asRows(notesResult.data),
    error:
      projectResult.error?.message ??
      paymentsResult.error?.message ??
      logsResult.error?.message ??
      notesResult.error?.message ??
      null,
  };
}

export async function fetchClientDetail(id: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      configured: false,
      client: null,
      projects: [] as AnyRecord[],
      error: null,
    };
  }

  const [clientResult, projectsResult] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("projects_orders")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    configured: true,
    client: asRecord(clientResult.data),
    projects: asRows(projectsResult.data),
    error: clientResult.error?.message ?? projectsResult.error?.message ?? null,
  };
}

export async function fetchDashboardData() {
  const supabase = await createSupabaseServerClient();
  const emptySummary: DashboardSummary = {
    totalClients: 0,
    totalProjects: 0,
    totalOnlineOrders: 0,
    pendingOnlineOrders: 0,
    workingOnlineOrders: 0,
    readyOnlineOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    readyForPickupOrders: 0,
    completedOrders: 0,
    unpaidOrders: 0,
    todaySales: 0,
    monthlySales: 0,
    totalExpenses: 0,
    estimatedNetProfit: 0,
    lowStockItems: 0,
  };

  if (!supabase) {
    return {
      configured: false,
      summary: emptySummary,
      recentProjects: [] as AnyRecord[],
      recentOnlineOrders: [] as AnyRecord[],
      recentClients: [] as AnyRecord[],
      recentLogs: [] as AnyRecord[],
      lowStock: [] as AnyRecord[],
      error: null,
    };
  }

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const monthKey = today.toISOString().slice(0, 7);

  const [clients, onlineOrders, projects, payments, expenses, inventory, logs] = await Promise.all([
    supabase.from("clients").select("*").neq("status", "archived").limit(1000),
    supabase
      .from("online_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("projects_orders")
      .select("*, clients(full_name)")
      .neq("order_status", "archived")
      .limit(1000),
    supabase.from("payments").select("*").limit(1000),
    supabase.from("expenses").select("*").limit(1000),
    supabase
      .from("inventory_items")
      .select("*")
      .in("status", ["low_stock", "out_of_stock"])
      .limit(100),
    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const onlineOrderRows = asRows(onlineOrders.data);
  const projectRows = asRows(projects.data);
  const paymentRows = asRows(payments.data);
  const expenseRows = asRows(expenses.data);
  const todaySales = sumByDate(paymentRows, "payment_date", todayKey);
  const monthlySales = sumByMonth(paymentRows, "payment_date", monthKey);
  const totalExpenses = expenseRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  const summary: DashboardSummary = {
    totalClients: clients.data?.length ?? 0,
    totalProjects: projectRows.length,
    totalOnlineOrders: onlineOrderRows.length,
    pendingOnlineOrders: countWhere(onlineOrderRows, "order_status", "pending"),
    workingOnlineOrders: countWhere(onlineOrderRows, "order_status", "working_on_it"),
    readyOnlineOrders: countWhere(onlineOrderRows, "order_status", "ready_for_pickup"),
    pendingOrders: countWhere(projectRows, "order_status", "pending"),
    inProgressOrders: countWhere(projectRows, "order_status", "in_progress"),
    readyForPickupOrders: countWhere(projectRows, "order_status", "ready_for_pickup"),
    completedOrders: countWhere(projectRows, "order_status", "completed"),
    unpaidOrders: projectRows.filter((row) =>
      ["unpaid", "partial"].includes(String(row.payment_status)),
    ).length,
    todaySales,
    monthlySales,
    totalExpenses,
    estimatedNetProfit: monthlySales - totalExpenses,
    lowStockItems: inventory.data?.length ?? 0,
  };

  return {
    configured: true,
    summary,
    recentProjects: projectRows.slice(0, 8),
    recentOnlineOrders: onlineOrderRows.slice(0, 8),
    recentClients: asRows(clients.data).slice(0, 8),
    recentLogs: asRows(logs.data),
    lowStock: asRows(inventory.data),
    error:
      clients.error?.message ??
      onlineOrders.error?.message ??
      projects.error?.message ??
      payments.error?.message ??
      expenses.error?.message ??
      inventory.error?.message ??
      logs.error?.message ??
      null,
  };
}

export async function fetchReportData(filters: AdminFilters = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      configured: false,
      payments: [] as AnyRecord[],
      expenses: [] as AnyRecord[],
      projects: [] as AnyRecord[],
      inventory: [] as AnyRecord[],
      clients: [] as AnyRecord[],
      error: null,
    };
  }

  const [payments, expenses, projects, inventory, clients] = await Promise.all([
    supabase.from("payments").select("*, projects_orders(service_type, order_number, client_id)"),
    supabase.from("expenses").select("*"),
    supabase.from("projects_orders").select("*, clients(full_name)"),
    supabase.from("inventory_items").select("*"),
    supabase.from("clients").select("*"),
  ]);

  const paymentRows = filterRows(
    asRows(payments.data),
    { ...moduleConfigs.payments, dateField: "payment_date" },
    filters,
  );
  const expenseRows = filterRows(
    asRows(expenses.data),
    { ...moduleConfigs.expenses, dateField: "expense_date" },
    filters,
  );
  const projectRows = filterRows(
    asRows(projects.data),
    { ...moduleConfigs.projects, dateField: "created_at" },
    filters,
  );

  return {
    configured: true,
    payments: paymentRows,
    expenses: expenseRows,
    projects: projectRows,
    inventory: asRows(inventory.data),
    clients: asRows(clients.data),
    error:
      payments.error?.message ??
      expenses.error?.message ??
      projects.error?.message ??
      inventory.error?.message ??
      clients.error?.message ??
      null,
  };
}

export async function getPublicCatalog() {
  if (!isSupabaseConfigured()) {
    return { services: null, packages: null, products: null, prices: null };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { services: null, packages: null, products: null, prices: null };

  const [services, packages, products, prices] = await Promise.all([
    supabase
      .from("services")
      .select("name,description,starting_price,category,display_order")
      .eq("is_available", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("packages")
      .select("name,description,starting_price,display_order")
      .eq("is_available", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("products")
      .select("name,description,starting_price,category,image_url,display_order")
      .eq("is_available", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("price_items")
      .select("service_name,unit_label,price_label,category,display_order")
      .eq("is_available", true)
      .order("display_order", { ascending: true }),
  ]);

  return {
    services: services.error ? null : services.data,
    packages: packages.error ? null : packages.data,
    products: products.error ? null : products.data,
    prices: prices.error ? null : prices.data,
  };
}

export function paramsToFilters(
  params: Record<string, string | string[] | undefined>,
): AdminFilters {
  return {
    q: normalizeSearchParam(params.q),
    status: normalizeSearchParam(params.status),
    payment: normalizeSearchParam(params.payment),
    service: normalizeSearchParam(params.service),
    from: normalizeSearchParam(params.from),
    to: normalizeSearchParam(params.to),
  };
}

function filterRows(rows: AnyRecord[], config: ModuleConfig, filters: AdminFilters) {
  const query = (filters.q ?? "").trim().toLowerCase();
  const status = filters.status ?? "";
  const payment = filters.payment ?? "";
  const service = filters.service ?? "";
  const from = filters.from ? new Date(filters.from) : null;
  const to = filters.to ? new Date(filters.to) : null;

  return rows.filter((row) => {
    if (query) {
      const searchable = config.searchFields
        .map((field) => String(getNestedValue(row, field) ?? ""))
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    if (status && config.statusField && row[config.statusField] !== status) return false;
    if (payment && config.paymentStatusField && row[config.paymentStatusField] !== payment) {
      return false;
    }
    if (service && row.service_type !== service) return false;

    if (config.dateField && (from || to)) {
      const dateValue = row[config.dateField];
      if (!dateValue) return false;
      const rowDate = new Date(String(dateValue));
      if (from && rowDate < from) return false;
      if (to) {
        const inclusiveTo = new Date(to);
        inclusiveTo.setHours(23, 59, 59, 999);
        if (rowDate > inclusiveTo) return false;
      }
    }

    return true;
  });
}

function asRows(data: unknown): AnyRecord[] {
  return Array.isArray(data) ? (data as AnyRecord[]) : [];
}

function asRecord(data: unknown): AnyRecord | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  return data as AnyRecord;
}

function countWhere(rows: AnyRecord[], key: string, value: string) {
  return rows.filter((row) => row[key] === value).length;
}

function sumByDate(rows: AnyRecord[], dateField: string, dateKey: string) {
  return rows
    .filter((row) => String(row[dateField] ?? "").startsWith(dateKey))
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
}

function sumByMonth(rows: AnyRecord[], dateField: string, monthKey: string) {
  return rows
    .filter((row) => String(row[dateField] ?? "").startsWith(monthKey))
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
}
