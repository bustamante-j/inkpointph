# InkPoint Prints & Services

Public printing website and owner-only business management system for InkPoint Prints & Services in Crystal Cave, Baguio City.

## What It Includes

- Public service catalog, exact price list, product gallery, packages, contact details, FAQs, and editable page sections.
- Payment-first online ordering with service-specific choices, calculated totals, private file uploads, and a GCash screenshot.
- Privacy-safe order tracking using an order number and the last four digits of the customer's contact number.
- Owner dashboard for online requests, managed orders, clients, payments, expenses, stock, catalog content, reports, backups, and activity logs.
- Website Manager for hero media, logo, mascot, colors, contact details, services, prices, products, packages, order choices, steps, and FAQs.
- Data-driven cash-flow, order-status, and service-demand charts.

## Stack

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4
- Supabase Auth, Postgres, Row Level Security, RPC functions, and Storage
- Recharts, Lucide React, Zod, and Vitest

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and provide:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with `NEXT_PUBLIC_`, commit it, or paste it into browser code.

3. Configure the database:

- New Supabase project: run all of `supabase/schema.sql` in SQL Editor.
- Existing InkPoint database: run all of `supabase/business-upgrade.sql` in SQL Editor.
- Optional sample records: run `supabase/seed.sql` only when demo data is wanted.

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Create the Owner Account

1. In Supabase, open **Authentication > Users** and create the owner user.
2. Copy the new user's UUID.
3. Run this in SQL Editor:

```sql
insert into public.profiles (id, full_name, role)
values ('PASTE-AUTH-USER-UUID', 'InkPoint Owner', 'owner')
on conflict (id) do update
set full_name = excluded.full_name, role = 'owner';
```

4. In **Authentication > Providers > Email**, disable public user signups if no additional admins should register.
5. Sign in at `/login`. Customers never need accounts.

Profile roles cannot be assigned by ordinary signed-in users. Owner-level access is required to manage administrator profiles.

## Secure Order Flow

1. The customer selects a published service and its applicable choices.
2. The calculator uses active rows from `price_items`.
3. Order files and payment proof are uploaded by a server action to the private `order-uploads` bucket.
4. The server creates the public request using the server-only service role.
5. The owner verifies payment and updates the public status.
6. The owner converts an accepted request into a client, managed order, and payment record.
7. The customer tracks progress without an account.

The browser cannot list private customer files. Admin file previews use short-lived signed URLs.

## Important Admin Routes

- `/admin/dashboard` overview, alerts, charts, and quick actions
- `/admin/website` public website content and media
- `/admin/order-options` public order-form choices
- `/admin/online-orders` incoming paid requests
- `/admin/projects` managed production orders
- `/admin/clients`, `/admin/payments`, and `/admin/expenses`
- `/admin/inventory` stock levels and stock-movement history
- `/admin/products`, `/admin/services`, and `/admin/prices`
- `/admin/reports` CSV exports and full JSON backup
- `/admin/logs` audit trail
- `/admin/settings` security and environment checks

## Vercel Deployment

1. Import the GitHub repository into Vercel.
2. Add these Production, Preview, and Development variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
```

3. Add optional business fallback variables from `.env.example` when needed.
4. In Supabase **Authentication > URL Configuration**, set the production site URL and add:

```text
http://localhost:3000/**
https://YOUR_DOMAIN/**
```

5. Run `supabase/business-upgrade.sql` in the production Supabase project if it has the older schema.
6. Redeploy from Vercel after environment variables or schema changes.
7. Verify `/`, `/track-order`, `/login`, `/admin/dashboard`, and one private file preview.

## Quality Checks

```bash
npm run lint
npm test
npm run build
npm audit
```

The app renders a complete local fallback catalog when public content tables are not available, but live online orders and admin editing require the database migration and service-role environment variable.
