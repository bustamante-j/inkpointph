create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('owner', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text,
  messenger_name text,
  email text,
  address_or_landmark text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  service_type text not null,
  title text not null,
  description text,
  quantity numeric not null default 1,
  page_count numeric not null default 0,
  paper_size text default 'not_applicable',
  color_type text not null default 'not_applicable' check (color_type in ('black_and_white', 'colored', 'mixed', 'not_applicable')),
  material_type text,
  editing_required boolean not null default false,
  file_received_via_messenger boolean not null default true,
  deadline timestamptz,
  pickup_date timestamptz,
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'in_progress', 'ready_for_pickup', 'completed', 'cancelled', 'archived')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid', 'refunded')),
  total_price numeric not null default 0,
  amount_paid numeric not null default 0,
  balance_due numeric not null default 0,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.projects_orders(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  payment_method text not null default 'cash' check (payment_method in ('cash', 'gcash', 'bank_transfer', 'other')),
  payment_date date not null default current_date,
  reference_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_name text not null,
  category text not null,
  amount numeric not null check (amount >= 0),
  expense_date date not null default current_date,
  supplier text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  category text not null,
  quantity numeric not null default 0,
  unit text,
  minimum_stock_level numeric not null default 0,
  supplier text,
  notes text,
  status text not null default 'in_stock' check (status in ('in_stock', 'low_stock', 'out_of_stock', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('restock', 'adjustment', 'usage')),
  quantity_change numeric not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  starting_price numeric not null default 0,
  category text,
  image_url text,
  is_available boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_items (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,
  unit_label text not null,
  price_label text not null,
  category text,
  is_available boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  starting_price numeric not null default 0,
  category text,
  is_available boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  included_services text[] not null default '{}',
  starting_price numeric not null default 0,
  is_available boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action_type text not null check (action_type in (
    'create', 'update', 'delete', 'archive', 'restore', 'status_change',
    'payment_added', 'payment_updated', 'expense_added', 'inventory_updated',
    'login', 'logout', 'note_added'
  )),
  module text not null check (module in (
    'clients', 'projects', 'projects_orders', 'payments', 'expenses',
    'inventory', 'inventory_items', 'products', 'services', 'packages', 'prices', 'price_items', 'reports',
    'settings', 'authentication'
  )),
  record_id uuid,
  record_label text,
  description text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.order_timeline_entries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.projects_orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  entry_type text not null default 'note' check (entry_type in ('note', 'status', 'payment', 'system')),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_orders_updated_at on public.projects_orders;
create trigger set_projects_orders_updated_at
before update on public.projects_orders
for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists set_expenses_updated_at on public.expenses;
create trigger set_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

drop trigger if exists set_inventory_items_updated_at on public.inventory_items;
create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_price_items_updated_at on public.price_items;
create trigger set_price_items_updated_at
before update on public.price_items
for each row execute function public.set_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists set_packages_updated_at on public.packages;
create trigger set_packages_updated_at
before update on public.packages
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.assign_order_number()
returns trigger
language plpgsql
as $$
declare
  date_key text := to_char(now(), 'YYYYMMDD');
  next_count integer;
begin
  if new.order_number is null or new.order_number = '' then
    select count(*) + 1
    into next_count
    from public.projects_orders
    where order_number like 'IP-' || date_key || '-%';

    new.order_number := 'IP-' || date_key || '-' || lpad(next_count::text, 3, '0');
  end if;

  new.balance_due := greatest(coalesce(new.total_price, 0) - coalesce(new.amount_paid, 0), 0);

  if new.payment_status <> 'refunded' then
    if coalesce(new.amount_paid, 0) <= 0 then
      new.payment_status := 'unpaid';
    elsif coalesce(new.amount_paid, 0) < coalesce(new.total_price, 0) then
      new.payment_status := 'partial';
    else
      new.payment_status := 'paid';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists assign_projects_order_number on public.projects_orders;
create trigger assign_projects_order_number
before insert or update on public.projects_orders
for each row execute function public.assign_order_number();

create or replace function public.refresh_order_payment_totals()
returns trigger
language plpgsql
as $$
declare
  target_order_id uuid;
  paid_total numeric;
  order_total numeric;
begin
  target_order_id := coalesce(new.order_id, old.order_id);

  select coalesce(sum(amount), 0)
  into paid_total
  from public.payments
  where order_id = target_order_id;

  select total_price
  into order_total
  from public.projects_orders
  where id = target_order_id;

  update public.projects_orders
  set amount_paid = paid_total,
      balance_due = greatest(coalesce(order_total, 0) - paid_total, 0),
      payment_status = case
        when paid_total <= 0 then 'unpaid'
        when paid_total < coalesce(order_total, 0) then 'partial'
        else 'paid'
      end
  where id = target_order_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_payment_totals_after_insert on public.payments;
create trigger refresh_payment_totals_after_insert
after insert on public.payments
for each row execute function public.refresh_order_payment_totals();

drop trigger if exists refresh_payment_totals_after_update on public.payments;
create trigger refresh_payment_totals_after_update
after update on public.payments
for each row execute function public.refresh_order_payment_totals();

drop trigger if exists refresh_payment_totals_after_delete on public.payments;
create trigger refresh_payment_totals_after_delete
after delete on public.payments
for each row execute function public.refresh_order_payment_totals();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects_orders enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.products enable row level security;
alter table public.price_items enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.activity_logs enable row level security;
alter table public.order_timeline_entries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
for insert to authenticated
with check (id = auth.uid());

drop policy if exists "clients_admin_all" on public.clients;
create policy "clients_admin_all" on public.clients
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "projects_orders_admin_all" on public.projects_orders;
create policy "projects_orders_admin_all" on public.projects_orders
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all" on public.payments
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "expenses_admin_all" on public.expenses;
create policy "expenses_admin_all" on public.expenses
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "inventory_items_admin_all" on public.inventory_items;
create policy "inventory_items_admin_all" on public.inventory_items
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "inventory_transactions_admin_all" on public.inventory_transactions;
create policy "inventory_transactions_admin_all" on public.inventory_transactions
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_public_available_read" on public.products;
create policy "products_public_available_read" on public.products
for select to anon, authenticated
using (is_available = true or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "price_items_public_available_read" on public.price_items;
create policy "price_items_public_available_read" on public.price_items
for select to anon, authenticated
using (is_available = true or public.is_admin());

drop policy if exists "price_items_admin_write" on public.price_items;
create policy "price_items_admin_write" on public.price_items
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "services_public_available_read" on public.services;
create policy "services_public_available_read" on public.services
for select to anon, authenticated
using (is_available = true or public.is_admin());

drop policy if exists "services_admin_write" on public.services;
create policy "services_admin_write" on public.services
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "packages_public_available_read" on public.packages;
create policy "packages_public_available_read" on public.packages
for select to anon, authenticated
using (is_available = true or public.is_admin());

drop policy if exists "packages_admin_write" on public.packages;
create policy "packages_admin_write" on public.packages
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "activity_logs_admin_all" on public.activity_logs;
create policy "activity_logs_admin_all" on public.activity_logs
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_timeline_entries_admin_all" on public.order_timeline_entries;
create policy "order_timeline_entries_admin_all" on public.order_timeline_entries
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_projects_orders_client_id on public.projects_orders(client_id);
create index if not exists idx_projects_orders_order_status on public.projects_orders(order_status);
create index if not exists idx_projects_orders_payment_status on public.projects_orders(payment_status);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_expenses_expense_date on public.expenses(expense_date);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);
create index if not exists idx_order_timeline_entries_order_id on public.order_timeline_entries(order_id);
create index if not exists idx_products_display_order on public.products(display_order);
create index if not exists idx_price_items_display_order on public.price_items(display_order);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());
