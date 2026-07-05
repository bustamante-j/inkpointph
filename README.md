# InkPoint Prints & Services

Professional MVP website and admin management system for **InkPoint Prints & Services** in Crystal Cave, Baguio City.

The app has:

- Public business website for services, packages, pricing, ordering steps, FAQ, and Messenger inquiries.
- Admin-only dashboard for clients, projects/orders, payments, expenses, inventory, services/packages, reports, activity logs, and settings.
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
- `projects_orders`
- `payments`
- `expenses`
- `inventory_items`
- `inventory_transactions`
- `services`
- `packages`
- `activity_logs`
- `order_timeline_entries`

Private admin tables have RLS enabled. Public reads are allowed only for available `services` and `packages`.

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
- `/admin/clients`
- `/admin/projects`
- `/admin/payments`
- `/admin/expenses`
- `/admin/inventory`
- `/admin/services`
- `/admin/reports`
- `/admin/logs`
- `/admin/settings`
- `/admin/logout`

## Business Rules Implemented

- Customers do not create accounts.
- Customers do not upload files through the website.
- Ordering and file sending happen through Facebook Messenger.
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

## Notes

The UI shows a Supabase setup notice when env variables are missing. The public site still renders with local default services and packages, while admin data becomes live after Supabase is configured.
