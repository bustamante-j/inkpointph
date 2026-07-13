begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
  payment_method text default 'gcash',
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

alter table public.profiles alter column role drop default;

alter table public.services add column if not exists slug text;
alter table public.services add column if not exists image_url text;
alter table public.services add column if not exists pricing_summary text;
alter table public.services add column if not exists quantity_label text not null default 'Quantity';
alter table public.services add column if not exists requires_page_count boolean not null default false;
alter table public.services add column if not exists allows_color boolean not null default false;
alter table public.services add column if not exists requires_paper_size boolean not null default false;
alter table public.services add column if not exists allows_sides boolean not null default false;
alter table public.services add column if not exists allows_photo_size boolean not null default false;
alter table public.services add column if not exists allows_certificate_type boolean not null default false;

create unique index if not exists services_slug_unique on public.services(slug) where slug is not null;

alter table public.price_items add column if not exists option_key text;
alter table public.price_items add column if not exists unit_price numeric;
alter table public.price_items add column if not exists max_price numeric;

alter table public.online_orders add column if not exists page_count numeric;
alter table public.online_orders add column if not exists print_color text;
alter table public.online_orders add column if not exists paper_size text;
alter table public.online_orders add column if not exists print_sides text;
alter table public.online_orders add column if not exists photo_size text;
alter table public.online_orders add column if not exists certificate_type text;
alter table public.online_orders add column if not exists order_file_urls text[] not null default '{}';
alter table public.online_orders add column if not exists order_file_names text[] not null default '{}';
alter table public.online_orders add column if not exists payment_screenshot_url text;
alter table public.online_orders add column if not exists additional_instructions text;
alter table public.online_orders add column if not exists delivery_address text;
alter table public.online_orders add column if not exists is_rush boolean not null default false;
alter table public.online_orders add column if not exists order_number text;
alter table public.online_orders add column if not exists estimated_total numeric not null default 0;
alter table public.online_orders add column if not exists payment_status text not null default 'pending_verification';
alter table public.online_orders add column if not exists order_file_paths text[] not null default '{}';
alter table public.online_orders add column if not exists payment_screenshot_path text;
alter table public.online_orders add column if not exists project_order_id uuid;
alter table public.online_orders add column if not exists request_fingerprint text;
alter table public.online_orders add column if not exists privacy_consent_at timestamptz;
alter table public.online_orders alter column payment_reference drop not null;
alter table public.online_orders alter column payment_method drop not null;

create unique index if not exists online_orders_order_number_unique
  on public.online_orders(order_number) where order_number is not null;
create index if not exists online_orders_request_fingerprint_idx
  on public.online_orders(request_fingerprint, created_at desc);

alter table public.projects_orders add column if not exists order_source text not null default 'walk_in';
alter table public.projects_orders add column if not exists source_online_order_id uuid;
create unique index if not exists projects_source_online_order_unique
  on public.projects_orders(source_online_order_id) where source_online_order_id is not null;

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

create table if not exists public.order_form_options (
  id uuid primary key default gen_random_uuid(),
  field_key text not null,
  option_value text not null,
  option_label text not null,
  is_available boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (field_key, option_value)
);

create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('restock', 'adjustment', 'usage')),
  quantity_change numeric not null,
  notes text,
  created_at timestamptz not null default now()
);

drop trigger if exists set_online_orders_updated_at on public.online_orders;
create trigger set_online_orders_updated_at before update on public.online_orders
for each row execute function public.set_updated_at();
drop trigger if exists set_price_items_updated_at on public.price_items;
create trigger set_price_items_updated_at before update on public.price_items
for each row execute function public.set_updated_at();
drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();
drop trigger if exists set_site_sections_updated_at on public.site_sections;
create trigger set_site_sections_updated_at before update on public.site_sections
for each row execute function public.set_updated_at();
drop trigger if exists set_faq_items_updated_at on public.faq_items;
create trigger set_faq_items_updated_at before update on public.faq_items
for each row execute function public.set_updated_at();
drop trigger if exists set_order_steps_updated_at on public.order_steps;
create trigger set_order_steps_updated_at before update on public.order_steps
for each row execute function public.set_updated_at();
drop trigger if exists set_order_form_options_updated_at on public.order_form_options;
create trigger set_order_form_options_updated_at before update on public.order_form_options
for each row execute function public.set_updated_at();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'online_orders_project_order_id_fkey') then
    alter table public.online_orders
      add constraint online_orders_project_order_id_fkey
      foreign key (project_order_id) references public.projects_orders(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'projects_orders_source_online_order_id_fkey') then
    alter table public.projects_orders
      add constraint projects_orders_source_online_order_id_fkey
      foreign key (source_online_order_id) references public.online_orders(id) on delete set null;
  end if;
end $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

create sequence if not exists public.order_number_sequence;
create sequence if not exists public.online_order_number_sequence;

create or replace function public.assign_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'IP-' || to_char(now(), 'YYYYMMDD') || '-' ||
      lpad(nextval('public.order_number_sequence')::text, 6, '0');
  end if;
  new.balance_due := greatest(coalesce(new.total_price, 0) - coalesce(new.amount_paid, 0), 0);
  if new.payment_status <> 'refunded' then
    new.payment_status := case
      when coalesce(new.amount_paid, 0) <= 0 then 'unpaid'
      when coalesce(new.amount_paid, 0) < coalesce(new.total_price, 0) then 'partial'
      else 'paid'
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists assign_projects_order_number on public.projects_orders;
create trigger assign_projects_order_number
before insert or update on public.projects_orders
for each row execute function public.assign_order_number();

create or replace function public.assign_online_order_number()
returns trigger language plpgsql as $$
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

create or replace function public.lookup_online_order(requested_order_number text, contact_last_four text)
returns table (
  order_number text, customer_name text, service_type text, order_status text,
  payment_status text, needed_by date, pickup_or_delivery text,
  estimated_total numeric, admin_notes text, updated_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select o.order_number, o.customer_name, o.service_type, o.order_status,
    o.payment_status, o.needed_by, o.pickup_or_delivery, o.estimated_total,
    o.admin_notes, o.updated_at
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
  if not public.is_admin() then raise exception 'Admin access required'; end if;
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

  if updated_item.id is null then raise exception 'Inventory item not found'; end if;

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

alter table public.profiles enable row level security;
alter table public.online_orders enable row level security;
alter table public.price_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_sections enable row level security;
alter table public.faq_items enable row level security;
alter table public.order_steps enable row level security;
alter table public.order_form_options enable row level security;
alter table public.inventory_transactions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;
drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all" on public.profiles
for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "online_orders_public_insert" on public.online_orders;
drop policy if exists "online_orders_admin_all" on public.online_orders;
create policy "online_orders_admin_all" on public.online_orders
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inventory_transactions_admin_all" on public.inventory_transactions;
create policy "inventory_transactions_admin_all" on public.inventory_transactions
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "price_items_public_available_read" on public.price_items;
create policy "price_items_public_available_read" on public.price_items
for select to anon, authenticated using (is_available = true or public.is_admin());
drop policy if exists "price_items_admin_write" on public.price_items;
create policy "price_items_admin_write" on public.price_items
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "site_sections_public_read" on public.site_sections;
create policy "site_sections_public_read" on public.site_sections
for select to anon, authenticated using (is_visible = true or public.is_admin());
drop policy if exists "site_sections_admin_write" on public.site_sections;
create policy "site_sections_admin_write" on public.site_sections
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faq_items_public_read" on public.faq_items;
create policy "faq_items_public_read" on public.faq_items
for select to anon, authenticated using (is_visible = true or public.is_admin());
drop policy if exists "faq_items_admin_write" on public.faq_items;
create policy "faq_items_admin_write" on public.faq_items
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_steps_public_read" on public.order_steps;
create policy "order_steps_public_read" on public.order_steps
for select to anon, authenticated using (is_visible = true or public.is_admin());
drop policy if exists "order_steps_admin_write" on public.order_steps;
create policy "order_steps_admin_write" on public.order_steps
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_form_options_public_read" on public.order_form_options;
create policy "order_form_options_public_read" on public.order_form_options
for select to anon, authenticated using (is_available = true or public.is_admin());
drop policy if exists "order_form_options_admin_write" on public.order_form_options;
create policy "order_form_options_admin_write" on public.order_form_options
for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-uploads', 'order-uploads', false, 15728640,
  array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/gif','image/jpeg','image/png','image/webp','text/plain']
)
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-assets', 'site-assets', true, 8388608, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "order_uploads_public_read" on storage.objects;
drop policy if exists "order_uploads_public_insert" on storage.objects;
drop policy if exists "order_uploads_admin_read" on storage.objects;
create policy "order_uploads_admin_read" on storage.objects
for select to authenticated using (bucket_id = 'order-uploads' and public.is_admin());
drop policy if exists "order_uploads_admin_delete" on storage.objects;
create policy "order_uploads_admin_delete" on storage.objects
for delete to authenticated using (bucket_id = 'order-uploads' and public.is_admin());

drop policy if exists "site_assets_public_read" on storage.objects;
create policy "site_assets_public_read" on storage.objects
for select to anon, authenticated using (bucket_id = 'site-assets');
drop policy if exists "site_assets_admin_insert" on storage.objects;
create policy "site_assets_admin_insert" on storage.objects
for insert to authenticated with check (bucket_id = 'site-assets' and public.is_admin());
drop policy if exists "site_assets_admin_update" on storage.objects;
create policy "site_assets_admin_update" on storage.objects
for update to authenticated using (bucket_id = 'site-assets' and public.is_admin())
with check (bucket_id = 'site-assets' and public.is_admin());
drop policy if exists "site_assets_admin_delete" on storage.objects;
create policy "site_assets_admin_delete" on storage.objects
for delete to authenticated using (bucket_id = 'site-assets' and public.is_admin());

insert into public.site_settings (
  id, business_name, location, address_note, motto, business_description,
  hero_eyebrow, hero_title, hero_description, hero_image_url, logo_url, mascot_url,
  messenger_url, facebook_url, facebook_name, email, hours, hours_note,
  payment_instructions, walk_in_note, seo_title, seo_description
)
values (
  'main', 'InkPoint Prints & Services', 'Crystal Cave, Baguio City',
  null, 'Prints that make a point.',
  'Friendly and reliable printing for school, work, events, and everyday needs.',
  'Printing made simple', 'Bring your ideas. We will put them on paper.',
  'Choose a service, upload your file, review the calculated price, and attach your GCash payment screenshot.',
  '/images/inkpoint-hero-bright.png', '/brand/logo/inkpoint-logo.png', '/brand/mascot/inkpoint-mascot.png',
  'https://m.me/inkpointprints',
  'https://web.facebook.com/people/InkPoint-Prints-Services/61590990023674/',
  'InkPoint Prints and Services', 'inkpointph@gmail.com', '8:00 AM - 10:00 PM daily',
  'Except when the shopkeeper has classes.',
  'Online orders require a GCash payment screenshot before submission.',
  'Walk-ins are always welcome. No registration or online order is required.',
  'InkPoint Prints & Services | Printing in Baguio City',
  'Printing, photocopy, photo printing, and certificate printing in Crystal Cave, Baguio City.'
)
on conflict (id) do nothing;

insert into public.site_sections (section_key, title, is_visible, display_order)
values
  ('order', 'Start your order', true, 1),
  ('contact', 'Contact InkPoint', true, 2),
  ('services', 'Services and prices', true, 3),
  ('products', 'Print examples', true, 4),
  ('packages', 'Helpful packages', true, 5),
  ('process', 'How it works', true, 6),
  ('faq', 'Quick answers', true, 7)
on conflict (section_key) do nothing;

insert into public.order_steps (title, description, is_visible, display_order)
select * from (values
  ('Choose', 'Select the service and print options you need.', true, 1),
  ('Upload', 'Attach your document, image, or certificate file.', true, 2),
  ('Pay', 'Review the calculated price and attach your GCash screenshot.', true, 3),
  ('Track', 'Keep your order number and check the latest status anytime.', true, 4),
  ('Collect', 'Pick up at the shop or arrange delivery when ready.', true, 5)
) as seed(title, description, is_visible, display_order)
where not exists (select 1 from public.order_steps);

insert into public.order_form_options (field_key, option_value, option_label, is_available, display_order)
values
  ('print_color', 'non_colored', 'Non-colored', true, 1),
  ('print_color', 'colored', 'Colored', true, 2),
  ('paper_size', 'short', 'Short', true, 1),
  ('paper_size', 'a4', 'A4', true, 2),
  ('paper_size', 'legal', 'Long / Legal', true, 3),
  ('paper_size', 'custom', 'Custom / not sure', true, 4),
  ('print_sides', 'single_sided', 'Single-sided', true, 1),
  ('print_sides', 'double_sided', 'Double-sided', true, 2),
  ('certificate_type', 'ready_to_print', 'Ready-to-print file', true, 1),
  ('certificate_type', 'needs_name_edit', 'Needs name editing', true, 2),
  ('certificate_type', 'needs_layout', 'Needs layout help', true, 3),
  ('fulfillment', 'pickup', 'Pickup', true, 1),
  ('fulfillment', 'delivery', 'Delivery', true, 2)
on conflict (field_key, option_value) do nothing;

insert into public.faq_items (question, answer, is_visible, display_order)
select * from (values
  ('Do you accept rush orders?', 'Yes, depending on the queue, file readiness, quantity, and available materials.', true, 1),
  ('Can I send files online?', 'Yes. Upload your files directly in the order form.', true, 2),
  ('Can I visit without ordering online?', 'Yes. Walk-ins are welcome and do not need an account.', true, 3),
  ('How do I know when my order is ready?', 'Use your order number and the last four digits of your contact number on the Track Order page.', true, 4)
) as seed(question, answer, is_visible, display_order)
where not exists (select 1 from public.faq_items);

update public.services set
  slug = 'printing', image_url = '/images/services/printing.png',
  pricing_summary = 'PHP 5 non-colored / PHP 10 colored per page',
  quantity_label = 'Number of copies', requires_page_count = true,
  allows_color = true, requires_paper_size = true, allows_sides = true
where name = 'Printing';
insert into public.services (
  name, slug, description, starting_price, category, image_url, pricing_summary,
  quantity_label, requires_page_count, allows_color, requires_paper_size, allows_sides,
  is_available, display_order
)
select 'Printing', 'printing', 'Document printing in non-colored or colored output.', 5, 'Documents',
  '/images/services/printing.png', 'PHP 5 non-colored / PHP 10 colored per page',
  'Number of copies', true, true, true, true, true, 1
where not exists (select 1 from public.services where name = 'Printing');

update public.services set
  slug = 'photocopy', image_url = '/images/services/photocopy.png',
  pricing_summary = 'PHP 3 non-colored / PHP 5 colored per page',
  quantity_label = 'Number of copies', requires_page_count = true,
  allows_color = true, requires_paper_size = true, allows_sides = true
where name = 'Photocopy';
insert into public.services (
  name, slug, description, starting_price, category, image_url, pricing_summary,
  quantity_label, requires_page_count, allows_color, requires_paper_size, allows_sides,
  is_available, display_order
)
select 'Photocopy', 'photocopy', 'Clear copies for forms, IDs, school papers, and office documents.', 3, 'Documents',
  '/images/services/photocopy.png', 'PHP 3 non-colored / PHP 5 colored per page',
  'Number of copies', true, true, true, true, true, 2
where not exists (select 1 from public.services where name = 'Photocopy');

update public.services set
  slug = 'photo-printing', image_url = '/images/services/photo-printing.png',
  pricing_summary = 'PHP 50-100 per photo', quantity_label = 'Number of photos',
  allows_photo_size = true
where name = 'Photo Printing';
insert into public.services (
  name, slug, description, starting_price, category, image_url, pricing_summary,
  quantity_label, allows_photo_size, is_available, display_order
)
select 'Photo Printing', 'photo-printing', 'Bright photo prints from your uploaded image files.', 50, 'Photo',
  '/images/services/photo-printing.png', 'PHP 50-100 per photo',
  'Number of photos', true, true, 3
where not exists (select 1 from public.services where name = 'Photo Printing');

update public.services set
  slug = 'certificate-printing', image_url = '/images/services/certificate-printing.png',
  pricing_summary = 'PHP 15 per certificate', quantity_label = 'Number of certificates',
  allows_color = true, requires_paper_size = true, allows_certificate_type = true
where name = 'Certificate Printing';
insert into public.services (
  name, slug, description, starting_price, category, image_url, pricing_summary,
  quantity_label, allows_color, requires_paper_size, allows_certificate_type,
  is_available, display_order
)
select 'Certificate Printing', 'certificate-printing', 'Clean certificate printing for school, events, and recognition.', 15, 'Events',
  '/images/services/certificate-printing.png', 'PHP 15 per certificate',
  'Number of certificates', true, true, true, true, 4
where not exists (select 1 from public.services where name = 'Certificate Printing');

insert into public.packages (
  name, description, included_services, starting_price, is_available, display_order
)
select seed.* from (values
  ('Student Document Pack', 'Printing or photocopy for modules, reviewers, forms, and assignments.', array['Printing', 'Photocopy']::text[], 3::numeric, true, 1),
  ('Colored Output Pack', 'Colored printing or colored photocopy for pages that need visual clarity.', array['Printing', 'Photocopy']::text[], 5::numeric, true, 2),
  ('Photo Print Set', 'Photo printing for personal, school, and keepsake images.', array['Photo Printing']::text[], 50::numeric, true, 3),
  ('Certificate Set', 'Certificate printing for classes, events, recognition, and simple awards.', array['Certificate Printing']::text[], 15::numeric, true, 4)
) as seed(name, description, included_services, starting_price, is_available, display_order)
where not exists (select 1 from public.packages p where p.name = seed.name);

insert into public.products (
  name, description, starting_price, category, image_url, is_available, display_order
)
select seed.* from (values
  ('Printed Documents', 'Everyday document prints in black and white or colored output.', 5::numeric, 'Printing', '/images/services/printing.png', true, 1),
  ('Photocopies', 'Readable copies for forms, IDs, school work, and office paperwork.', 3::numeric, 'Photocopy', '/images/services/photocopy.png', true, 2),
  ('Photo Prints', 'Glossy photo prints from uploaded customer images.', 50::numeric, 'Photo', '/images/services/photo-printing.png', true, 3),
  ('Certificates', 'Certificate prints for recognition, school, and event needs.', 15::numeric, 'Certificates', '/images/services/certificate-printing.png', true, 4)
) as seed(name, description, starting_price, category, image_url, is_available, display_order)
where not exists (select 1 from public.products p where p.name = seed.name);

update public.price_items set option_key = 'non_colored', unit_price = 5, max_price = null
where service_name = 'Printing' and lower(unit_label) like 'non-colored%';
update public.price_items set option_key = 'colored', unit_price = 10, max_price = null
where service_name = 'Printing' and lower(unit_label) like 'colored%';
update public.price_items set option_key = 'non_colored', unit_price = 3, max_price = null
where service_name = 'Photocopy' and lower(unit_label) like 'non-colored%';
update public.price_items set option_key = 'colored', unit_price = 5, max_price = null
where service_name = 'Photocopy' and lower(unit_label) like 'colored%';
update public.price_items set option_key = 'default', unit_price = 15, max_price = null
where service_name = 'Certificate Printing';

insert into public.price_items (
  service_name, unit_label, price_label, category, option_key, unit_price, max_price, is_available, display_order
)
select * from (values
  ('Printing','Non-colored per page','PHP 5.00','Documents','non_colored',5::numeric,null::numeric,true,1),
  ('Printing','Colored per page','PHP 10.00','Documents','colored',10::numeric,null::numeric,true,2),
  ('Photocopy','Non-colored per page','PHP 3.00','Documents','non_colored',3::numeric,null::numeric,true,3),
  ('Photocopy','Colored per page','PHP 5.00','Documents','colored',5::numeric,null::numeric,true,4),
  ('Photo Printing','2x2 photo','PHP 50.00','Photo','2x2',50::numeric,null::numeric,true,5),
  ('Photo Printing','4R photo','PHP 75.00','Photo','4r',75::numeric,null::numeric,true,6),
  ('Photo Printing','5R photo','PHP 100.00','Photo','5r',100::numeric,null::numeric,true,7),
  ('Certificate Printing','Per certificate','PHP 15.00','Events','default',15::numeric,null::numeric,true,8)
) as seed(service_name, unit_label, price_label, category, option_key, unit_price, max_price, is_available, display_order)
where not exists (
  select 1 from public.price_items p
  where p.service_name = seed.service_name and p.option_key = seed.option_key
);

commit;
