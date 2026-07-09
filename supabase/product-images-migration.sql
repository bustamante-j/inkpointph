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

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "products_public_available_read" on public.products;
create policy "products_public_available_read" on public.products
for select to anon, authenticated
using (is_available = true or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_products_display_order on public.products(display_order);

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

drop trigger if exists set_price_items_updated_at on public.price_items;
create trigger set_price_items_updated_at
before update on public.price_items
for each row execute function public.set_updated_at();

alter table public.price_items enable row level security;

drop policy if exists "price_items_public_available_read" on public.price_items;
create policy "price_items_public_available_read" on public.price_items
for select to anon, authenticated
using (is_available = true or public.is_admin());

drop policy if exists "price_items_admin_write" on public.price_items;
create policy "price_items_admin_write" on public.price_items
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_price_items_display_order on public.price_items(display_order);

update public.services
set is_available = false
where name not in ('Printing', 'Photocopy', 'Photo Printing', 'Certificate Printing');

update public.services
set description = 'Upload your document and choose black and white or colored printing.',
    starting_price = 5,
    category = 'Documents',
    is_available = true,
    display_order = 1
where name = 'Printing';

insert into public.services (name, description, starting_price, category, is_available, display_order)
select 'Printing', 'Upload your document and choose black and white or colored printing.', 5, 'Documents', true, 1
where not exists (select 1 from public.services where name = 'Printing');

update public.services
set description = 'Clear photocopies for school papers, IDs, forms, and office documents.',
    starting_price = 3,
    category = 'Documents',
    is_available = true,
    display_order = 2
where name = 'Photocopy';

insert into public.services (name, description, starting_price, category, is_available, display_order)
select 'Photocopy', 'Clear photocopies for school papers, IDs, forms, and office documents.', 3, 'Documents', true, 2
where not exists (select 1 from public.services where name = 'Photocopy');

update public.services
set description = 'Photo prints from uploaded files, available in common sizes.',
    starting_price = 50,
    category = 'Photo',
    is_available = true,
    display_order = 3
where name = 'Photo Printing';

insert into public.services (name, description, starting_price, category, is_available, display_order)
select 'Photo Printing', 'Photo prints from uploaded files, available in common sizes.', 50, 'Photo', true, 3
where not exists (select 1 from public.services where name = 'Photo Printing');

update public.services
set description = 'Clean certificate printing for school, recognition, events, and office use.',
    starting_price = 15,
    category = 'Events',
    is_available = true,
    display_order = 4
where name = 'Certificate Printing';

insert into public.services (name, description, starting_price, category, is_available, display_order)
select 'Certificate Printing', 'Clean certificate printing for school, recognition, events, and office use.', 15, 'Events', true, 4
where not exists (select 1 from public.services where name = 'Certificate Printing');

update public.products
set is_available = false
where name not in ('Printed Documents', 'Photocopies', 'Photo Prints', 'Certificates');

update public.products
set description = 'Everyday document prints in black and white or colored output.',
    starting_price = 5,
    category = 'Printing',
    image_url = '/images/services/printing.png',
    is_available = true,
    display_order = 1
where name = 'Printed Documents';

insert into public.products (name, description, starting_price, category, image_url, is_available, display_order)
select 'Printed Documents', 'Everyday document prints in black and white or colored output.', 5, 'Printing', '/images/services/printing.png', true, 1
where not exists (select 1 from public.products where name = 'Printed Documents');

update public.products
set description = 'Readable copies for forms, IDs, school work, and office paperwork.',
    starting_price = 3,
    category = 'Photocopy',
    image_url = '/images/services/photocopy.png',
    is_available = true,
    display_order = 2
where name = 'Photocopies';

insert into public.products (name, description, starting_price, category, image_url, is_available, display_order)
select 'Photocopies', 'Readable copies for forms, IDs, school work, and office paperwork.', 3, 'Photocopy', '/images/services/photocopy.png', true, 2
where not exists (select 1 from public.products where name = 'Photocopies');

update public.products
set description = 'Glossy photo prints from uploaded customer images.',
    starting_price = 50,
    category = 'Photo',
    image_url = '/images/services/photo-printing.png',
    is_available = true,
    display_order = 3
where name = 'Photo Prints';

insert into public.products (name, description, starting_price, category, image_url, is_available, display_order)
select 'Photo Prints', 'Glossy photo prints from uploaded customer images.', 50, 'Photo', '/images/services/photo-printing.png', true, 3
where not exists (select 1 from public.products where name = 'Photo Prints');

update public.products
set description = 'Certificate prints for recognition, school, and event needs.',
    starting_price = 15,
    category = 'Certificates',
    image_url = '/images/services/certificate-printing.png',
    is_available = true,
    display_order = 4
where name = 'Certificates';

insert into public.products (name, description, starting_price, category, image_url, is_available, display_order)
select 'Certificates', 'Certificate prints for recognition, school, and event needs.', 15, 'Certificates', '/images/services/certificate-printing.png', true, 4
where not exists (select 1 from public.products where name = 'Certificates');

update public.packages
set is_available = false
where name not in ('Student Document Pack', 'Colored Output Pack', 'Photo Print Set', 'Certificate Set');

update public.packages
set description = 'Printing or photocopy for modules, reviewers, forms, and assignments.',
    included_services = array['Printing', 'Photocopy'],
    starting_price = 3,
    is_available = true,
    display_order = 1
where name = 'Student Document Pack';

insert into public.packages (name, description, included_services, starting_price, is_available, display_order)
select 'Student Document Pack', 'Printing or photocopy for modules, reviewers, forms, and assignments.', array['Printing', 'Photocopy'], 3, true, 1
where not exists (select 1 from public.packages where name = 'Student Document Pack');

update public.packages
set description = 'Colored printing or colored photocopy for pages that need visual clarity.',
    included_services = array['Printing', 'Photocopy'],
    starting_price = 5,
    is_available = true,
    display_order = 2
where name = 'Colored Output Pack';

insert into public.packages (name, description, included_services, starting_price, is_available, display_order)
select 'Colored Output Pack', 'Colored printing or colored photocopy for pages that need visual clarity.', array['Printing', 'Photocopy'], 5, true, 2
where not exists (select 1 from public.packages where name = 'Colored Output Pack');

update public.packages
set description = 'Photo printing for personal, school, and keepsake images.',
    included_services = array['Photo Printing'],
    starting_price = 50,
    is_available = true,
    display_order = 3
where name = 'Photo Print Set';

insert into public.packages (name, description, included_services, starting_price, is_available, display_order)
select 'Photo Print Set', 'Photo printing for personal, school, and keepsake images.', array['Photo Printing'], 50, true, 3
where not exists (select 1 from public.packages where name = 'Photo Print Set');

update public.packages
set description = 'Certificate printing for classes, events, recognition, and simple awards.',
    included_services = array['Certificate Printing'],
    starting_price = 15,
    is_available = true,
    display_order = 4
where name = 'Certificate Set';

insert into public.packages (name, description, included_services, starting_price, is_available, display_order)
select 'Certificate Set', 'Certificate printing for classes, events, recognition, and simple awards.', array['Certificate Printing'], 15, true, 4
where not exists (select 1 from public.packages where name = 'Certificate Set');

update public.price_items
set is_available = false
where not (
  (service_name = 'Printing' and unit_label in ('Non-colored per page', 'Colored per page')) or
  (service_name = 'Photocopy' and unit_label in ('Non-colored per page', 'Colored per page')) or
  (service_name = 'Photo Printing' and unit_label = 'Per photo') or
  (service_name = 'Certificate Printing' and unit_label = 'Per certificate')
);

delete from public.price_items
where service_name in ('Printing', 'Photocopy', 'Photo Printing', 'Certificate Printing')
  and not (
    (service_name = 'Printing' and unit_label in ('Non-colored per page', 'Colored per page')) or
    (service_name = 'Photocopy' and unit_label in ('Non-colored per page', 'Colored per page')) or
    (service_name = 'Photo Printing' and unit_label = 'Per photo') or
    (service_name = 'Certificate Printing' and unit_label = 'Per certificate')
  );

update public.price_items
set price_label = 'PHP 5.00', category = 'Documents', is_available = true, display_order = 1
where service_name = 'Printing' and unit_label = 'Non-colored per page';
insert into public.price_items (service_name, unit_label, price_label, category, is_available, display_order)
select 'Printing', 'Non-colored per page', 'PHP 5.00', 'Documents', true, 1
where not exists (select 1 from public.price_items where service_name = 'Printing' and unit_label = 'Non-colored per page');

update public.price_items
set price_label = 'PHP 10.00', category = 'Documents', is_available = true, display_order = 2
where service_name = 'Printing' and unit_label = 'Colored per page';
insert into public.price_items (service_name, unit_label, price_label, category, is_available, display_order)
select 'Printing', 'Colored per page', 'PHP 10.00', 'Documents', true, 2
where not exists (select 1 from public.price_items where service_name = 'Printing' and unit_label = 'Colored per page');

update public.price_items
set price_label = 'PHP 3.00', category = 'Documents', is_available = true, display_order = 3
where service_name = 'Photocopy' and unit_label = 'Non-colored per page';
insert into public.price_items (service_name, unit_label, price_label, category, is_available, display_order)
select 'Photocopy', 'Non-colored per page', 'PHP 3.00', 'Documents', true, 3
where not exists (select 1 from public.price_items where service_name = 'Photocopy' and unit_label = 'Non-colored per page');

update public.price_items
set price_label = 'PHP 5.00', category = 'Documents', is_available = true, display_order = 4
where service_name = 'Photocopy' and unit_label = 'Colored per page';
insert into public.price_items (service_name, unit_label, price_label, category, is_available, display_order)
select 'Photocopy', 'Colored per page', 'PHP 5.00', 'Documents', true, 4
where not exists (select 1 from public.price_items where service_name = 'Photocopy' and unit_label = 'Colored per page');

update public.price_items
set price_label = 'PHP 50.00-100.00', category = 'Photo', is_available = true, display_order = 5
where service_name = 'Photo Printing' and unit_label = 'Per photo';
insert into public.price_items (service_name, unit_label, price_label, category, is_available, display_order)
select 'Photo Printing', 'Per photo', 'PHP 50.00-100.00', 'Photo', true, 5
where not exists (select 1 from public.price_items where service_name = 'Photo Printing' and unit_label = 'Per photo');

update public.price_items
set price_label = 'PHP 15.00', category = 'Events', is_available = true, display_order = 6
where service_name = 'Certificate Printing' and unit_label = 'Per certificate';
insert into public.price_items (service_name, unit_label, price_label, category, is_available, display_order)
select 'Certificate Printing', 'Per certificate', 'PHP 15.00', 'Events', true, 6
where not exists (select 1 from public.price_items where service_name = 'Certificate Printing' and unit_label = 'Per certificate');

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
  order_file_urls text[] not null default '{}',
  order_file_names text[] not null default '{}',
  payment_screenshot_url text,
  payment_method text default 'gcash' check (payment_method in ('gcash', 'cash', 'other')),
  payment_reference text,
  payment_note text,
  additional_instructions text,
  order_status text not null default 'pending' check (order_status in ('pending', 'working_on_it', 'ready_for_pickup', 'completed', 'cancelled')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
alter table public.online_orders alter column payment_reference drop not null;
alter table public.online_orders alter column payment_method drop not null;
alter table public.online_orders alter column payment_method set default 'gcash';

drop trigger if exists set_online_orders_updated_at on public.online_orders;
create trigger set_online_orders_updated_at
before update on public.online_orders
for each row execute function public.set_updated_at();

alter table public.online_orders enable row level security;

drop policy if exists "online_orders_public_insert" on public.online_orders;
create policy "online_orders_public_insert" on public.online_orders
for insert to anon, authenticated
with check (order_status = 'pending');

drop policy if exists "online_orders_admin_all" on public.online_orders;
create policy "online_orders_admin_all" on public.online_orders
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_online_orders_created_at on public.online_orders(created_at desc);
create index if not exists idx_online_orders_order_status on public.online_orders(order_status);

alter table public.activity_logs
drop constraint if exists activity_logs_module_check;

alter table public.activity_logs
add constraint activity_logs_module_check
check (module in (
  'clients', 'projects', 'projects_orders', 'payments', 'expenses',
  'inventory', 'inventory_items', 'online_orders', 'products', 'services', 'packages', 'prices', 'price_items', 'reports',
  'settings', 'authentication'
));

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
  true,
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
create policy "order_uploads_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'order-uploads');

drop policy if exists "order_uploads_public_insert" on storage.objects;
create policy "order_uploads_public_insert" on storage.objects
for insert to anon, authenticated
with check (bucket_id = 'order-uploads');

drop policy if exists "order_uploads_admin_delete" on storage.objects;
create policy "order_uploads_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'order-uploads' and public.is_admin());
