# InkPoint Prints & Services

Professional MVP website and admin management system for **InkPoint Prints & Services** in Crystal Cave, Baguio City.

The app has:

- Public business website for services, packages, pricing, contact details, online order booking, FAQ, and Messenger inquiries.
- Admin-only dashboard for online orders, clients, projects/orders, payments, expenses, inventory, products with images, services/packages, public prices, reports, activity logs, and settings.
- Supabase Auth, Supabase database schema, Row Level Security policy suggestions, and seed data.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth and Postgres
- Lucide React icons

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

3. Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MESSENGER_LINK=
NEXT_PUBLIC_FACEBOOK_PAGE=
NEXT_PUBLIC_BUSINESS_EMAIL=
NEXT_PUBLIC_BUSINESS_PHONE=
NEXT_PUBLIC_WEBSITE_URL=
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. This MVP does not require it for normal app use.

4. In Supabase SQL Editor, run:

```sql
-- supabase/schema.sql
```

5. Optional seed data:

```sql
-- supabase/seed.sql
```

6. Start locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Required Supabase Tables

The schema creates:

- `profiles`
- `clients`
- `online_orders`
- `projects_orders`
- `payments`
- `expenses`
- `inventory_items`
- `inventory_transactions`
- `products`
- `price_items`
- `services`
- `packages`
- `activity_logs`
- `order_timeline_entries`

The schema also creates a public Supabase Storage bucket named `product-images` with policies that let admins upload product photos and let visitors view those public product images.

Private admin tables have RLS enabled. Public reads are allowed only for available catalog records. Visitors can insert new `online_orders`, while only admins can view and update them.

## Create the Admin Account

1. In Supabase Dashboard, go to Authentication.
2. Create a user for the owner/admin email.
3. Copy that user's UUID.
4. Insert the matching profile row:

```sql
insert into public.profiles (id, full_name, role)
values ('PASTE-AUTH-USER-UUID-HERE', 'InkPoint Owner', 'owner');
```

5. Sign in at `/login`.

Only authenticated users with `profiles.role` of `owner` or `admin` can access private business records under the included RLS policies.

## App Routes

Public:

- `/`

Admin:

- `/login`
- `/admin/dashboard`
- `/admin/online-orders`
- `/admin/clients`
- `/admin/projects`
- `/admin/payments`
- `/admin/expenses`
- `/admin/inventory`
- `/admin/products`
- `/admin/services`
- `/admin/prices`
- `/admin/reports`
- `/admin/logs`
- `/admin/settings`
- `/admin/logout`

## Business Rules Implemented

- Customers do not create accounts.
- Customers do not upload files through the website.
- Customers can submit a payment-first online order from the public website.
- Online order statuses are updated by the admin as `pending`, `working_on_it`, `ready_for_pickup`, `completed`, or `cancelled`.
- File sending still happens through Facebook Messenger.
- Walk-ins are welcome; customers do not need to register or order online before visiting.
- Only the owner/admin signs in to the dashboard.
- Product photos are uploaded by the admin in `/admin/products` and displayed on the public website.
- Products, packages, services, and prices can be changed in the admin dashboard and will reflect on the public website.
- Payments are manually recorded by the admin.
- Projects/orders store timeline notes and relevant activity logs.
- Payment totals update order `amount_paid`, `balance_due`, and `payment_status`.
- Inventory status is derived from quantity and minimum stock level.
- Activity logs are created for important create/update/archive/delete/payment/note/logout actions.

## Deployment Later

1. Push the project to GitHub.
2. Import it into Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Make sure Supabase Auth redirect URLs include:

```text
http://localhost:3000/**
https://your-production-domain.com/**
```

5. Run the Supabase schema in the production Supabase project.
6. Create the production owner account and profile row.

## Updating an Existing Supabase Database

If you already ran the original schema before product photo support was added, run:

```sql
-- supabase/product-images-migration.sql
```

This adds the `products` table, `price_items` table, `online_orders` table, product image storage bucket, and required policies without requiring seed data.

## Notes

The UI shows a Supabase setup notice when env variables are missing. The public site still renders with local default services and packages, while admin data becomes live after Supabase is configured.
