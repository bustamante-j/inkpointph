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

alter table public.activity_logs
drop constraint if exists activity_logs_module_check;

alter table public.activity_logs
add constraint activity_logs_module_check
check (module in (
  'clients', 'projects', 'projects_orders', 'payments', 'expenses',
  'inventory', 'inventory_items', 'products', 'services', 'packages', 'reports',
  'settings', 'authentication'
));

create index if not exists idx_products_display_order on public.products(display_order);

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
