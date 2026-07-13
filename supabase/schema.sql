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
  role text not null check (role in ('owner', 'admin')),
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

create table if not exists public.online_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  contact_number text not null,
  messenger_name text,
  email text,
  service_type text not null,
  order_details text not null,
  quantity numeric not null default 1 check (quantity >= 1),
  page_count numeric,
  print_color text,
  paper_size text,
  print_sides text,
  photo_size text,
  certificate_type text,
  needed_by date,
  pickup_or_delivery text not null default 'pickup' check (pickup_or_delivery in ('pickup', 'delivery')),
  delivery_address text,
  is_rush boolean not null default false,
  order_file_urls text[] not null default '{}',
  order_file_names text[] not null default '{}',
  payment_screenshot_url text,
  payment_method text default 'gcash' check (payment_method in ('gcash', 'cash', 'other')),
  payment_reference text,
  payment_note text,
  additional_instructions text,
  order_number text unique,
  estimated_total numeric not null default 0 check (estimated_total >= 0),
  payment_status text not null default 'pending_verification' check (payment_status in ('not_submitted', 'pending_verification', 'verified', 'rejected')),
  order_file_paths text[] not null default '{}',
  payment_screenshot_path text,
  project_order_id uuid,
  request_fingerprint text,
  privacy_consent_at timestamptz,
  order_status text not null default 'pending' check (order_status in ('pending', 'working_on_it', 'ready_for_pickup', 'completed', 'cancelled')),
  admin_notes text,
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
  order_source text not null default 'walk_in' check (order_source in ('online', 'walk_in', 'messenger')),
  source_online_order_id uuid unique references public.online_orders(id) on delete set null,
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
  option_key text,
  unit_price numeric check (unit_price is null or unit_price >= 0),
  max_price numeric check (max_price is null or max_price >= 0),
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
  slug text unique,
  image_url text,
  pricing_summary text,
  quantity_label text not null default 'Quantity',
  requires_page_count boolean not null default false,
  allows_color boolean not null default false,
  requires_paper_size boolean not null default false,
  allows_sides boolean not null default false,
  allows_photo_size boolean not null default false,
  allows_certificate_type boolean not null default false,
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

create table if not exists public.site_settings (
  id text primary key default 'main' check (id = 'main'),
  business_name text not null default 'InkPoint Prints & Services',
  location text not null default 'Crystal Cave, Baguio City',
  address_note text,
  motto text not null default 'Prints that make a point.',
  business_description text,
  hero_eyebrow text,
  hero_title text not null,
  hero_description text,
  hero_image_url text,
  logo_url text,
  mascot_url text,
  messenger_url text,
  facebook_url text,
  facebook_name text,
  email text,
  phone text,
  website_url text,
  hours text,
  hours_note text,
  payment_instructions text,
  walk_in_note text,
  announcement text,
  seo_title text,
  seo_description text,
  primary_color text not null default '#7f1017',
  background_color text not null default '#fff7ed',
  updated_at timestamptz not null default now()
);

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  is_visible boolean not null default true,
  display_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_visible boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_visible boolean not null default true,
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
    'inventory', 'inventory_items', 'online_orders', 'products', 'services', 'packages', 'prices', 'price_items', 'reports',
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

drop trigger if exists set_online_orders_updated_at on public.online_orders;
create trigger set_online_orders_updated_at
before update on public.online_orders
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

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_site_sections_updated_at on public.site_sections;
create trigger set_site_sections_updated_at
before update on public.site_sections
for each row execute function public.set_updated_at();

drop trigger if exists set_faq_items_updated_at on public.faq_items;
create trigger set_faq_items_updated_at
before update on public.faq_items
for each row execute function public.set_updated_at();

drop trigger if exists set_order_steps_updated_at on public.order_steps;
create trigger set_order_steps_updated_at
before update on public.order_steps
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

create or replace function public.is_owner()
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
      and role = 'owner'
  );
$$;

create sequence if not exists public.order_number_sequence;
create sequence if not exists public.online_order_number_sequence;

create or replace function public.assign_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'IP-' || to_char(now(), 'YYYYMMDD') || '-' ||
      lpad(nextval('public.order_number_sequence')::text, 6, '0');
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

create or replace function public.assign_online_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'IPO-' || to_char(now(), 'YYYYMMDD') || '-' ||
      lpad(nextval('public.online_order_number_sequence')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists assign_online_order_number on public.online_orders;
create trigger assign_online_order_number
before insert on public.online_orders
for each row execute function public.assign_online_order_number();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'online_orders_project_order_id_fkey'
  ) then
    alter table public.online_orders
      add constraint online_orders_project_order_id_fkey
      foreign key (project_order_id) references public.projects_orders(id) on delete set null;
  end if;
end $$;

create or replace function public.lookup_online_order(
  requested_order_number text,
  contact_last_four text
)
returns table (
  order_number text,
  customer_name text,
  service_type text,
  order_status text,
  payment_status text,
  needed_by date,
  pickup_or_delivery text,
  estimated_total numeric,
  admin_notes text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.order_number,
    o.customer_name,
    o.service_type,
    o.order_status,
    o.payment_status,
    o.needed_by,
    o.pickup_or_delivery,
    o.estimated_total,
    o.admin_notes,
    o.updated_at
  from public.online_orders o
  where upper(o.order_number) = upper(trim(requested_order_number))
    and right(regexp_replace(o.contact_number, '[^0-9]', '', 'g'), 4) =
      right(regexp_replace(contact_last_four, '[^0-9]', '', 'g'), 4)
  limit 1;
$$;

revoke all on function public.lookup_online_order(text, text) from public;
grant execute on function public.lookup_online_order(text, text) to anon, authenticated;

create or replace function public.record_inventory_transaction(
  target_item_id uuid,
  transaction_kind text,
  quantity_delta numeric,
  transaction_notes text default null
)
returns public.inventory_items
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_item public.inventory_items;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;
  if transaction_kind not in ('restock', 'adjustment', 'usage') then
    raise exception 'Invalid inventory transaction type';
  end if;

  update public.inventory_items
  set quantity = greatest(quantity + quantity_delta, 0),
      status = case
        when greatest(quantity + quantity_delta, 0) <= 0 then 'out_of_stock'
        when greatest(quantity + quantity_delta, 0) <= minimum_stock_level then 'low_stock'
        else 'in_stock'
      end
  where id = target_item_id
  returning * into updated_item;

  if updated_item.id is null then
    raise exception 'Inventory item not found';
  end if;

  insert into public.inventory_transactions (
    inventory_item_id, transaction_type, quantity_change, notes
  ) values (target_item_id, transaction_kind, quantity_delta, transaction_notes);

  return updated_item;
end;
$$;

revoke all on function public.record_inventory_transaction(uuid, text, numeric, text) from public;
grant execute on function public.record_inventory_transaction(uuid, text, numeric, text) to authenticated;

create or replace function public.convert_online_order_to_project(target_online_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  source_order public.online_orders;
  target_client_id uuid;
  new_project_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select * into source_order
  from public.online_orders
  where id = target_online_order_id
  for update;

  if source_order.id is null then
    raise exception 'Online order not found';
  end if;
  if source_order.project_order_id is not null then
    return source_order.project_order_id;
  end if;

  select id into target_client_id
  from public.clients
  where regexp_replace(coalesce(phone_number, ''), '[^0-9]', '', 'g') =
        regexp_replace(source_order.contact_number, '[^0-9]', '', 'g')
  order by created_at
  limit 1;

  if target_client_id is null then
    insert into public.clients (
      full_name, phone_number, messenger_name, email, notes, status
    ) values (
      source_order.customer_name,
      source_order.contact_number,
      source_order.messenger_name,
      source_order.email,
      'Created from online order ' || coalesce(source_order.order_number, source_order.id::text),
      'active'
    )
    returning id into target_client_id;
  end if;

  insert into public.projects_orders (
    client_id, service_type, title, description, quantity, page_count,
    paper_size, color_type, material_type, editing_required,
    file_received_via_messenger, deadline, order_status, total_price,
    amount_paid, payment_method, notes, order_source, source_online_order_id
  ) values (
    target_client_id,
    source_order.service_type,
    source_order.service_type || ' - ' || source_order.customer_name,
    source_order.order_details,
    source_order.quantity,
    coalesce(source_order.page_count, 0),
    coalesce(source_order.paper_size, 'not_applicable'),
    case
      when source_order.print_color = 'non_colored' then 'black_and_white'
      when source_order.print_color = 'colored' then 'colored'
      else 'not_applicable'
    end,
    coalesce(source_order.photo_size, source_order.certificate_type),
    source_order.certificate_type in ('needs_name_edit', 'needs_layout'),
    true,
    source_order.needed_by::timestamptz,
    case source_order.order_status
      when 'working_on_it' then 'in_progress'
      when 'ready_for_pickup' then 'ready_for_pickup'
      when 'completed' then 'completed'
      when 'cancelled' then 'cancelled'
      else 'confirmed'
    end,
    source_order.estimated_total,
    0,
    'gcash',
    source_order.additional_instructions,
    'online',
    source_order.id
  )
  returning id into new_project_id;

  if source_order.payment_status = 'verified' and source_order.estimated_total > 0 then
    insert into public.payments (
      order_id, amount, payment_method, payment_date, reference_number, notes
    ) values (
      new_project_id,
      source_order.estimated_total,
      'gcash',
      current_date,
      'Online payment screenshot',
      'Payment verified from online order ' || source_order.order_number
    );
  end if;

  update public.online_orders
  set project_order_id = new_project_id,
      order_status = case when order_status = 'pending' then 'working_on_it' else order_status end
  where id = source_order.id;

  return new_project_id;
end;
$$;

revoke all on function public.convert_online_order_to_project(uuid) from public;
grant execute on function public.convert_online_order_to_project(uuid) to authenticated;

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
alter table public.online_orders enable row level security;
alter table public.projects_orders enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.products enable row level security;
alter table public.price_items enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_sections enable row level security;
alter table public.faq_items enable row level security;
alter table public.order_steps enable row level security;
alter table public.activity_logs enable row level security;
alter table public.order_timeline_entries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;
drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all" on public.profiles
for all to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "clients_admin_all" on public.clients;
create policy "clients_admin_all" on public.clients
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "online_orders_public_insert" on public.online_orders;

drop policy if exists "online_orders_admin_all" on public.online_orders;
create policy "online_orders_admin_all" on public.online_orders
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

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
for select to anon, authenticated
using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "site_sections_public_read" on public.site_sections;
create policy "site_sections_public_read" on public.site_sections
for select to anon, authenticated
using (is_visible = true or public.is_admin());

drop policy if exists "site_sections_admin_write" on public.site_sections;
create policy "site_sections_admin_write" on public.site_sections
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "faq_items_public_read" on public.faq_items;
create policy "faq_items_public_read" on public.faq_items
for select to anon, authenticated
using (is_visible = true or public.is_admin());

drop policy if exists "faq_items_admin_write" on public.faq_items;
create policy "faq_items_admin_write" on public.faq_items
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_steps_public_read" on public.order_steps;
create policy "order_steps_public_read" on public.order_steps
for select to anon, authenticated
using (is_visible = true or public.is_admin());

drop policy if exists "order_steps_admin_write" on public.order_steps;
create policy "order_steps_admin_write" on public.order_steps
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
create index if not exists idx_online_orders_created_at on public.online_orders(created_at desc);
create index if not exists idx_online_orders_order_status on public.online_orders(order_status);
create index if not exists idx_online_orders_request_fingerprint on public.online_orders(request_fingerprint, created_at desc);
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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-uploads',
  'order-uploads',
  false,
  15728640,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  8388608,
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

drop policy if exists "order_uploads_public_read" on storage.objects;
drop policy if exists "order_uploads_public_insert" on storage.objects;

drop policy if exists "order_uploads_admin_read" on storage.objects;
create policy "order_uploads_admin_read" on storage.objects
for select to authenticated
using (bucket_id = 'order-uploads' and public.is_admin());

drop policy if exists "order_uploads_admin_delete" on storage.objects;
create policy "order_uploads_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'order-uploads' and public.is_admin());

drop policy if exists "site_assets_public_read" on storage.objects;
create policy "site_assets_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'site-assets');

drop policy if exists "site_assets_admin_insert" on storage.objects;
create policy "site_assets_admin_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "site_assets_admin_update" on storage.objects;
create policy "site_assets_admin_update" on storage.objects
for update to authenticated
using (bucket_id = 'site-assets' and public.is_admin())
with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "site_assets_admin_delete" on storage.objects;
create policy "site_assets_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'site-assets' and public.is_admin());
