import {
  expenseCategories,
  inventoryCategories,
  productCategories,
  serviceTypeOptions,
} from "@/lib/constants";
import { formatCurrency, formatDate, formatDateTime, labelize } from "@/lib/utils";
import type { AnyRecord } from "@/types/database";

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "datetime-local"
  | "textarea"
  | "select"
  | "checkbox"
  | "multiline"
  | "image";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  relation?: {
    table: string;
    valueColumn: string;
    labelColumn: string;
    descriptionColumn?: string;
    orderColumn?: string;
  };
  min?: number;
  step?: string;
  help?: string;
  accept?: string;
  storageBucket?: string;
  maxSizeMb?: number;
};

export type ColumnConfig = {
  label: string;
  value: (row: AnyRecord) => unknown;
  format?:
    | "text"
    | "money"
    | "date"
    | "datetime"
    | "status"
    | "boolean"
    | "image"
    | "links";
};

export type ModuleConfig = {
  key: ModuleKey;
  path: string;
  table: string;
  title: string;
  singular: string;
  description: string;
  select: string;
  orderBy: { column: string; ascending: boolean };
  searchFields: string[];
  dateField?: string;
  statusField?: string;
  paymentStatusField?: string;
  archiveValue?: string;
  creatable?: boolean;
  editable?: boolean;
  hardDelete?: boolean;
  columns: ColumnConfig[];
  detailFields: ColumnConfig[];
  formFields: FieldConfig[];
};

export type ModuleKey =
  | "clients"
  | "onlineOrders"
  | "projects"
  | "payments"
  | "expenses"
  | "inventory"
  | "products"
  | "services"
  | "packages"
  | "prices"
  | "orderOptions"
  | "logs";

const statusOptions = (values: string[]) =>
  values.map((value) => ({ value, label: labelize(value) }));

const money = (name: string, label: string): FieldConfig => ({
  name,
  label,
  type: "number",
  min: 0,
  step: "0.01",
});

export const moduleConfigs: Record<ModuleKey, ModuleConfig> = {
  clients: {
    key: "clients",
    path: "clients",
    table: "clients",
    title: "Clients",
    singular: "Client",
    description: "Manage customer contact details, notes, status, and order history.",
    select: "*",
    orderBy: { column: "created_at", ascending: false },
    searchFields: ["full_name", "phone_number", "messenger_name", "email"],
    statusField: "status",
    archiveValue: "archived",
    creatable: true,
    editable: true,
    columns: [
      { label: "Name", value: (row) => row.full_name },
      { label: "Messenger", value: (row) => row.messenger_name },
      { label: "Phone", value: (row) => row.phone_number },
      { label: "Status", value: (row) => row.status, format: "status" },
      { label: "Created", value: (row) => row.created_at, format: "date" },
    ],
    detailFields: [
      { label: "Full name", value: (row) => row.full_name },
      { label: "Phone number", value: (row) => row.phone_number },
      { label: "Messenger name", value: (row) => row.messenger_name },
      { label: "Email", value: (row) => row.email },
      { label: "Address / landmark", value: (row) => row.address_or_landmark },
      { label: "Notes", value: (row) => row.notes },
      { label: "Status", value: (row) => row.status, format: "status" },
      { label: "Created", value: (row) => row.created_at, format: "datetime" },
      { label: "Updated", value: (row) => row.updated_at, format: "datetime" },
    ],
    formFields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "phone_number", label: "Phone number", type: "tel" },
      { name: "messenger_name", label: "Messenger name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      {
        name: "address_or_landmark",
        label: "Address or landmark",
        type: "textarea",
      },
      { name: "notes", label: "Notes", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions(["active", "inactive", "archived"]),
      },
    ],
  },
  onlineOrders: {
    key: "onlineOrders",
    path: "online-orders",
    table: "online_orders",
    title: "Online Orders",
    singular: "Online Order",
    description: "Review public booking requests and update customer order status.",
    select: "*",
    orderBy: { column: "created_at", ascending: false },
    searchFields: [
      "customer_name",
      "contact_number",
      "messenger_name",
      "service_type",
      "order_details",
      "additional_instructions",
    ],
    statusField: "order_status",
    dateField: "created_at",
    creatable: false,
    editable: true,
    columns: [
      { label: "Order", value: (row) => row.order_number },
      { label: "Customer", value: (row) => row.customer_name },
      { label: "Service", value: (row) => row.service_type },
      { label: "Total", value: (row) => row.estimated_total, format: "money" },
      { label: "Payment", value: (row) => row.payment_status, format: "status" },
      { label: "Status", value: (row) => row.order_status, format: "status" },
      { label: "Needed", value: (row) => row.needed_by, format: "date" },
      { label: "Created", value: (row) => row.created_at, format: "date" },
    ],
    detailFields: [
      { label: "Customer", value: (row) => row.customer_name },
      { label: "Contact number", value: (row) => row.contact_number },
      { label: "Messenger name", value: (row) => row.messenger_name },
      { label: "Email", value: (row) => row.email },
      { label: "Service", value: (row) => row.service_type },
      { label: "Order details", value: (row) => row.order_details },
      { label: "Quantity", value: (row) => row.quantity },
      { label: "Page count", value: (row) => row.page_count },
      { label: "Color", value: (row) => row.print_color, format: "status" },
      { label: "Paper size", value: (row) => row.paper_size, format: "status" },
      { label: "Print side", value: (row) => row.print_sides, format: "status" },
      { label: "Photo size", value: (row) => row.photo_size },
      { label: "Certificate type", value: (row) => row.certificate_type, format: "status" },
      { label: "Needed by", value: (row) => row.needed_by, format: "date" },
      { label: "Pickup / delivery", value: (row) => row.pickup_or_delivery, format: "status" },
      { label: "Uploaded files", value: (row) => row.order_file_signed_urls ?? row.order_file_urls, format: "links" },
      { label: "GCash screenshot", value: (row) => row.payment_screenshot_signed_url ?? row.payment_screenshot_url, format: "image" },
      { label: "Calculated total", value: (row) => row.estimated_total, format: "money" },
      { label: "Payment verification", value: (row) => row.payment_status, format: "status" },
      { label: "Rush order", value: (row) => row.is_rush, format: "boolean" },
      { label: "Delivery address", value: (row) => row.delivery_address },
      { label: "Additional details", value: (row) => row.additional_instructions },
      { label: "Order status", value: (row) => row.order_status, format: "status" },
      { label: "Admin notes", value: (row) => row.admin_notes },
      { label: "Created", value: (row) => row.created_at, format: "datetime" },
    ],
    formFields: [
      {
        name: "order_status",
        label: "Order status",
        type: "select",
        options: statusOptions([
          "pending",
          "working_on_it",
          "ready_for_pickup",
          "completed",
          "cancelled",
        ]),
      },
      {
        name: "payment_status",
        label: "Payment verification",
        type: "select",
        options: statusOptions([
          "not_submitted",
          "pending_verification",
          "verified",
          "rejected",
        ]),
      },
      money("estimated_total", "Confirmed total"),
      { name: "admin_notes", label: "Admin notes", type: "textarea" },
    ],
  },
  projects: {
    key: "projects",
    path: "projects",
    table: "projects_orders",
    title: "Projects / Orders",
    singular: "Project / Order",
    description: "Track manual orders, uploaded files, pickup, delivery, and payment.",
    select: "*, clients(full_name, phone_number, messenger_name)",
    orderBy: { column: "created_at", ascending: false },
    searchFields: ["order_number", "title", "service_type", "clients.full_name"],
    statusField: "order_status",
    paymentStatusField: "payment_status",
    dateField: "created_at",
    archiveValue: "archived",
    creatable: true,
    editable: true,
    columns: [
      { label: "Order", value: (row) => row.order_number },
      { label: "Client", value: (row) => (row.clients as AnyRecord)?.full_name },
      { label: "Title", value: (row) => row.title },
      { label: "Status", value: (row) => row.order_status, format: "status" },
      { label: "Payment", value: (row) => row.payment_status, format: "status" },
      { label: "Balance", value: (row) => row.balance_due, format: "money" },
    ],
    detailFields: [
      { label: "Order number", value: (row) => row.order_number },
      { label: "Client", value: (row) => (row.clients as AnyRecord)?.full_name },
      { label: "Service type", value: (row) => row.service_type },
      { label: "Title", value: (row) => row.title },
      { label: "Description", value: (row) => row.description },
      { label: "Quantity", value: (row) => row.quantity },
      { label: "Page count", value: (row) => row.page_count },
      { label: "Paper size", value: (row) => row.paper_size },
      { label: "Color type", value: (row) => row.color_type, format: "status" },
      { label: "Material type", value: (row) => row.material_type },
      { label: "Editing required", value: (row) => row.editing_required, format: "boolean" },
      {
        label: "File received online",
        value: (row) => row.file_received_via_messenger,
        format: "boolean",
      },
      { label: "Deadline", value: (row) => row.deadline, format: "datetime" },
      { label: "Pickup date", value: (row) => row.pickup_date, format: "datetime" },
      { label: "Order status", value: (row) => row.order_status, format: "status" },
      { label: "Payment status", value: (row) => row.payment_status, format: "status" },
      { label: "Total price", value: (row) => row.total_price, format: "money" },
      { label: "Amount paid", value: (row) => row.amount_paid, format: "money" },
      { label: "Balance due", value: (row) => row.balance_due, format: "money" },
      { label: "Payment method", value: (row) => row.payment_method },
      { label: "Notes", value: (row) => row.notes },
    ],
    formFields: [
      {
        name: "client_id",
        label: "Client",
        type: "select",
        required: true,
        relation: {
          table: "clients",
          valueColumn: "id",
          labelColumn: "full_name",
          descriptionColumn: "phone_number",
          orderColumn: "full_name",
        },
      },
      {
        name: "service_type",
        label: "Service type",
        type: "select",
        required: true,
        options: serviceTypeOptions.map((service) => ({
          value: service,
          label: service,
        })),
      },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "quantity", label: "Quantity", type: "number", min: 1 },
      { name: "page_count", label: "Page count", type: "number", min: 0 },
      {
        name: "paper_size",
        label: "Paper size",
        type: "select",
        options: statusOptions(["not_applicable", "short", "a4", "legal", "custom"]),
      },
      {
        name: "color_type",
        label: "Color type",
        type: "select",
        options: statusOptions([
          "black_and_white",
          "colored",
          "mixed",
          "not_applicable",
        ]),
      },
      { name: "material_type", label: "Material type", type: "text" },
      {
        name: "editing_required",
        label: "Editing required",
        type: "checkbox",
      },
      {
        name: "file_received_via_messenger",
        label: "File received via Messenger",
        type: "checkbox",
        help: "Use this for files received through the website or Messenger.",
      },
      { name: "deadline", label: "Deadline", type: "datetime-local" },
      { name: "pickup_date", label: "Pickup date", type: "datetime-local" },
      {
        name: "order_status",
        label: "Order status",
        type: "select",
        options: statusOptions([
          "pending",
          "confirmed",
          "in_progress",
          "ready_for_pickup",
          "completed",
          "cancelled",
          "archived",
        ]),
      },
      {
        name: "payment_status",
        label: "Payment status",
        type: "select",
        options: statusOptions(["unpaid", "partial", "paid", "refunded"]),
      },
      money("total_price", "Total price"),
      money("amount_paid", "Amount paid"),
      {
        name: "payment_method",
        label: "Payment method",
        type: "select",
        options: statusOptions(["", "cash", "gcash", "bank_transfer", "other"]),
      },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  payments: {
    key: "payments",
    path: "payments",
    table: "payments",
    title: "Payments",
    singular: "Payment",
    description: "Record manual Cash, GCash, bank transfer, and other payments.",
    select: "*, projects_orders(order_number, title, total_price, balance_due)",
    orderBy: { column: "payment_date", ascending: false },
    searchFields: ["reference_number", "notes", "projects_orders.order_number"],
    dateField: "payment_date",
    creatable: true,
    editable: true,
    hardDelete: true,
    columns: [
      { label: "Order", value: (row) => (row.projects_orders as AnyRecord)?.order_number },
      { label: "Amount", value: (row) => row.amount, format: "money" },
      { label: "Method", value: (row) => row.payment_method, format: "status" },
      { label: "Date", value: (row) => row.payment_date, format: "date" },
      { label: "Reference", value: (row) => row.reference_number },
    ],
    detailFields: [
      { label: "Order", value: (row) => (row.projects_orders as AnyRecord)?.order_number },
      { label: "Amount", value: (row) => row.amount, format: "money" },
      { label: "Payment method", value: (row) => row.payment_method, format: "status" },
      { label: "Payment date", value: (row) => row.payment_date, format: "date" },
      { label: "Reference number", value: (row) => row.reference_number },
      { label: "Notes", value: (row) => row.notes },
    ],
    formFields: [
      {
        name: "order_id",
        label: "Project / order",
        type: "select",
        required: true,
        relation: {
          table: "projects_orders",
          valueColumn: "id",
          labelColumn: "order_number",
          descriptionColumn: "title",
          orderColumn: "created_at",
        },
      },
      money("amount", "Amount"),
      {
        name: "payment_method",
        label: "Payment method",
        type: "select",
        required: true,
        options: statusOptions(["cash", "gcash", "bank_transfer", "other"]),
      },
      { name: "payment_date", label: "Payment date", type: "date", required: true },
      { name: "reference_number", label: "Reference number", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  expenses: {
    key: "expenses",
    path: "expenses",
    table: "expenses",
    title: "Expenses",
    singular: "Expense",
    description: "Track supplies, utilities, equipment, transportation, and other costs.",
    select: "*",
    orderBy: { column: "expense_date", ascending: false },
    searchFields: ["expense_name", "category", "supplier"],
    dateField: "expense_date",
    creatable: true,
    editable: true,
    hardDelete: true,
    columns: [
      { label: "Expense", value: (row) => row.expense_name },
      { label: "Category", value: (row) => row.category, format: "status" },
      { label: "Amount", value: (row) => row.amount, format: "money" },
      { label: "Date", value: (row) => row.expense_date, format: "date" },
      { label: "Supplier", value: (row) => row.supplier },
    ],
    detailFields: [
      { label: "Expense", value: (row) => row.expense_name },
      { label: "Category", value: (row) => row.category, format: "status" },
      { label: "Amount", value: (row) => row.amount, format: "money" },
      { label: "Expense date", value: (row) => row.expense_date, format: "date" },
      { label: "Supplier", value: (row) => row.supplier },
      { label: "Notes", value: (row) => row.notes },
    ],
    formFields: [
      { name: "expense_name", label: "Expense name", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: expenseCategories.map((category) => ({
          value: category,
          label: category,
        })),
      },
      money("amount", "Amount"),
      { name: "expense_date", label: "Expense date", type: "date", required: true },
      { name: "supplier", label: "Supplier", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  inventory: {
    key: "inventory",
    path: "inventory",
    table: "inventory_items",
    title: "Inventory",
    singular: "Inventory Item",
    description: "Monitor supplies, restocks, stock levels, and low-stock alerts.",
    select: "*",
    orderBy: { column: "item_name", ascending: true },
    searchFields: ["item_name", "category", "supplier"],
    statusField: "status",
    archiveValue: "archived",
    creatable: true,
    editable: true,
    columns: [
      { label: "Item", value: (row) => row.item_name },
      { label: "Category", value: (row) => row.category, format: "status" },
      { label: "Quantity", value: (row) => `${row.quantity ?? 0} ${row.unit ?? ""}` },
      { label: "Minimum", value: (row) => row.minimum_stock_level },
      { label: "Status", value: (row) => row.status, format: "status" },
    ],
    detailFields: [
      { label: "Item name", value: (row) => row.item_name },
      { label: "Category", value: (row) => row.category, format: "status" },
      { label: "Quantity", value: (row) => `${row.quantity ?? 0} ${row.unit ?? ""}` },
      { label: "Minimum stock level", value: (row) => row.minimum_stock_level },
      { label: "Supplier", value: (row) => row.supplier },
      { label: "Status", value: (row) => row.status, format: "status" },
      { label: "Notes", value: (row) => row.notes },
    ],
    formFields: [
      { name: "item_name", label: "Item name", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: inventoryCategories.map((category) => ({
          value: category,
          label: category,
        })),
      },
      { name: "quantity", label: "Quantity", type: "number", min: 0, step: "0.01" },
      { name: "unit", label: "Unit", type: "text", placeholder: "reams, sheets, bottles" },
      {
        name: "minimum_stock_level",
        label: "Minimum stock level",
        type: "number",
        min: 0,
        step: "0.01",
      },
      { name: "supplier", label: "Supplier", type: "text" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions(["in_stock", "low_stock", "out_of_stock", "archived"]),
      },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  products: {
    key: "products",
    path: "products",
    table: "products",
    title: "Products",
    singular: "Product",
    description: "Manage public product photos, descriptions, pricing, and availability.",
    select: "*",
    orderBy: { column: "display_order", ascending: true },
    searchFields: ["name", "description", "category"],
    creatable: true,
    editable: true,
    columns: [
      { label: "Image", value: (row) => row.image_url, format: "image" },
      { label: "Product", value: (row) => row.name },
      { label: "Category", value: (row) => row.category, format: "status" },
      { label: "Starting price", value: (row) => row.starting_price, format: "money" },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Order", value: (row) => row.display_order },
    ],
    detailFields: [
      { label: "Image", value: (row) => row.image_url, format: "image" },
      { label: "Name", value: (row) => row.name },
      { label: "Description", value: (row) => row.description },
      { label: "Starting price", value: (row) => row.starting_price, format: "money" },
      { label: "Category", value: (row) => row.category, format: "status" },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Display order", value: (row) => row.display_order },
    ],
    formFields: [
      {
        name: "image_url",
        label: "Product image",
        type: "image",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        storageBucket: "product-images",
        maxSizeMb: 5,
        help: "Upload a clear product photo. PNG, JPG, WebP, or GIF up to 5 MB.",
      },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: productCategories.map((category) => ({
          value: category,
          label: category,
        })),
      },
      money("starting_price", "Starting price"),
      { name: "is_available", label: "Available on public site", type: "checkbox" },
      { name: "display_order", label: "Display order", type: "number", min: 0 },
    ],
  },
  services: {
    key: "services",
    path: "services",
    table: "services",
    title: "Services",
    singular: "Service",
    description: "Manage public service offerings and availability.",
    select: "*",
    orderBy: { column: "display_order", ascending: true },
    searchFields: ["name", "description", "category"],
    creatable: true,
    editable: true,
    columns: [
      { label: "Service", value: (row) => row.name },
      { label: "Category", value: (row) => row.category, format: "status" },
      { label: "Starting price", value: (row) => row.starting_price, format: "money" },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Order", value: (row) => row.display_order },
    ],
    detailFields: [
      { label: "Name", value: (row) => row.name },
      { label: "Description", value: (row) => row.description },
      { label: "Starting price", value: (row) => row.starting_price, format: "money" },
      { label: "Category", value: (row) => row.category, format: "status" },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Display order", value: (row) => row.display_order },
    ],
    formFields: [
      {
        name: "image_url",
        label: "Service image",
        type: "image",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        storageBucket: "product-images",
        maxSizeMb: 5,
        help: "Shown in the public service catalog.",
      },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, placeholder: "photo-printing" },
      { name: "description", label: "Description", type: "textarea" },
      money("starting_price", "Starting price"),
      { name: "pricing_summary", label: "Short price summary", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "quantity_label", label: "Quantity field label", type: "text", required: true },
      { name: "requires_page_count", label: "Ask for page count", type: "checkbox" },
      { name: "allows_color", label: "Ask for colored / non-colored", type: "checkbox" },
      { name: "requires_paper_size", label: "Ask for paper size", type: "checkbox" },
      { name: "allows_sides", label: "Ask for print sides", type: "checkbox" },
      { name: "allows_photo_size", label: "Ask for photo size", type: "checkbox" },
      { name: "allows_certificate_type", label: "Ask for certificate type", type: "checkbox" },
      { name: "is_available", label: "Available on public site", type: "checkbox" },
      { name: "display_order", label: "Display order", type: "number", min: 0 },
    ],
  },
  packages: {
    key: "packages",
    path: "packages",
    table: "packages",
    title: "Packages",
    singular: "Package",
    description: "Manage bundled offers shown on the public website.",
    select: "*",
    orderBy: { column: "display_order", ascending: true },
    searchFields: ["name", "description", "included_services"],
    creatable: true,
    editable: true,
    columns: [
      { label: "Package", value: (row) => row.name },
      { label: "Starting price", value: (row) => row.starting_price, format: "money" },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Order", value: (row) => row.display_order },
    ],
    detailFields: [
      { label: "Name", value: (row) => row.name },
      { label: "Description", value: (row) => row.description },
      { label: "Included services", value: (row) => row.included_services },
      { label: "Starting price", value: (row) => row.starting_price, format: "money" },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Display order", value: (row) => row.display_order },
    ],
    formFields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "included_services",
        label: "Included services",
        type: "multiline",
        help: "One service per line.",
      },
      money("starting_price", "Starting price"),
      { name: "is_available", label: "Available on public site", type: "checkbox" },
      { name: "display_order", label: "Display order", type: "number", min: 0 },
    ],
  },
  prices: {
    key: "prices",
    path: "prices",
    table: "price_items",
    title: "Prices",
    singular: "Price Item",
    description: "Manage the public price list shown on the website.",
    select: "*",
    orderBy: { column: "display_order", ascending: true },
    searchFields: ["service_name", "unit_label", "category"],
    creatable: true,
    editable: true,
    columns: [
      { label: "Service", value: (row) => row.service_name },
      { label: "Unit", value: (row) => row.unit_label },
      { label: "Price", value: (row) => row.price_label },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Order", value: (row) => row.display_order },
    ],
    detailFields: [
      { label: "Service", value: (row) => row.service_name },
      { label: "Unit", value: (row) => row.unit_label },
      { label: "Price", value: (row) => row.price_label },
      { label: "Category", value: (row) => row.category },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Display order", value: (row) => row.display_order },
    ],
    formFields: [
      { name: "service_name", label: "Service", type: "text", required: true },
      { name: "unit_label", label: "Unit", type: "text", required: true },
      { name: "price_label", label: "Price label", type: "text", required: true },
      { name: "option_key", label: "Calculator option key", type: "text", required: true, help: "Examples: non_colored, colored, 2x2, 4r, 5r, or default." },
      money("unit_price", "Unit price used by calculator"),
      money("max_price", "Maximum price (optional)"),
      { name: "category", label: "Category", type: "text" },
      { name: "is_available", label: "Show on public website", type: "checkbox" },
      { name: "display_order", label: "Display order", type: "number", min: 0 },
    ],
  },
  orderOptions: {
    key: "orderOptions",
    path: "order-options",
    table: "order_form_options",
    title: "Order Form Choices",
    singular: "Order Form Choice",
    description: "Manage the selectable choices customers see while placing an order.",
    select: "*",
    orderBy: { column: "field_key", ascending: true },
    searchFields: ["field_key", "option_value", "option_label"],
    creatable: true,
    editable: true,
    hardDelete: true,
    columns: [
      { label: "Field", value: (row) => row.field_key, format: "status" },
      { label: "Customer label", value: (row) => row.option_label },
      { label: "Value", value: (row) => row.option_value },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Order", value: (row) => row.display_order },
    ],
    detailFields: [
      { label: "Field", value: (row) => row.field_key, format: "status" },
      { label: "Customer label", value: (row) => row.option_label },
      { label: "Stored value", value: (row) => row.option_value },
      { label: "Available", value: (row) => row.is_available, format: "boolean" },
      { label: "Display order", value: (row) => row.display_order },
    ],
    formFields: [
      {
        name: "field_key",
        label: "Order field",
        type: "select",
        required: true,
        options: statusOptions(["print_color", "paper_size", "print_sides", "certificate_type", "fulfillment"]),
      },
      { name: "option_label", label: "Customer-facing label", type: "text", required: true },
      { name: "option_value", label: "Stored value", type: "text", required: true, help: "Use a short lowercase value with underscores, such as glossy_photo." },
      { name: "is_available", label: "Available in the public form", type: "checkbox" },
      { name: "display_order", label: "Display order", type: "number", min: 0 },
    ],
  },
  logs: {
    key: "logs",
    path: "logs",
    table: "activity_logs",
    title: "Activity Logs",
    singular: "Activity Log",
    description: "Audit important admin actions across clients, orders, payments, and settings.",
    select: "*",
    orderBy: { column: "created_at", ascending: false },
    searchFields: ["action_type", "module", "record_label", "description"],
    dateField: "created_at",
    statusField: "action_type",
    creatable: false,
    editable: false,
    columns: [
      { label: "Action", value: (row) => row.action_type, format: "status" },
      { label: "Module", value: (row) => row.module, format: "status" },
      { label: "Record", value: (row) => row.record_label },
      { label: "Description", value: (row) => row.description },
      { label: "When", value: (row) => row.created_at, format: "datetime" },
    ],
    detailFields: [
      { label: "Action", value: (row) => row.action_type, format: "status" },
      { label: "Module", value: (row) => row.module, format: "status" },
      { label: "Record ID", value: (row) => row.record_id },
      { label: "Record label", value: (row) => row.record_label },
      { label: "Description", value: (row) => row.description },
      { label: "Created", value: (row) => row.created_at, format: "datetime" },
    ],
    formFields: [],
  },
};

export const moduleKeys = Object.keys(moduleConfigs) as ModuleKey[];

export function getModuleConfig(module: string): ModuleConfig | undefined {
  return (
    moduleConfigs[module as ModuleKey] ??
    moduleKeys.map((key) => moduleConfigs[key]).find((config) => config.path === module)
  );
}

export function formatColumnValue(column: ColumnConfig, row: AnyRecord) {
  const value = column.value(row);

  if (column.format === "money") return formatCurrency(value as string | number);
  if (column.format === "date") return formatDate(value as string);
  if (column.format === "datetime") return formatDateTime(value as string);
  if (column.format === "boolean") return value ? "Yes" : "No";
  if (column.format === "image") return value ? "Image uploaded" : "No image";
  if (Array.isArray(value)) return value.join(", ");
  return value === null || value === undefined || value === "" ? "Not set" : String(value);
}
