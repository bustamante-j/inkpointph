insert into public.services (name, description, starting_price, category, is_available, display_order)
values
  ('General Printing', 'Everyday document printing for school, work, and business.', 2, 'Documents', true, 1),
  ('Photocopying', 'Clear copies for IDs, forms, reviewers, and office papers.', 2, 'Documents', true, 2),
  ('Scanning', 'Document scans for online submission and archiving.', 5, 'Digital', true, 3),
  ('Sticker Printing', 'Sticker sheets for labels, packaging, and personal use.', 60, 'Stickers', true, 4),
  ('Photo Printing', 'Photo prints from customer-provided files.', 20, 'Photo', true, 5),
  ('ID Photo Layout & Printing', 'Layout and print ID photos using a clear photo you provide.', 60, 'Photo', true, 6),
  ('Lamination', 'Protect important documents, cards, and certificates.', 20, 'Finishing', true, 7),
  ('GCash QR Printing', 'Clean QR prints for counters, shops, and payment displays.', 30, 'Business', true, 8)
on conflict do nothing;

insert into public.packages (name, description, included_services, starting_price, is_available, display_order)
values
  ('Job Seeker Basic Package', 'Resume print, photocopy, and basic document preparation.', array['Resume / CV Printing', 'Photocopying'], 50, true, 1),
  ('Job Seeker Complete Package', 'Resume, certificates, IDs, and application papers prepared together.', array['Resume / CV Printing', 'Photocopying', 'ID Photo Layout & Printing'], 120, true, 2),
  ('Student Rush Package', 'Quick school document printing for urgent submissions.', array['General Printing', 'PDF Conversion / Merge / Scan'], 40, true, 3),
  ('ID Photo Print Package', 'ID photo layout and printing from a customer-provided photo.', array['ID Photo Layout & Printing', 'Photo Printing'], 60, true, 4),
  ('Sticker Starter Package', 'Starter sticker sheet for labels, gifts, or personal projects.', array['Sticker Printing'], 100, true, 5),
  ('Small Business Starter Package', 'Labels, QR prints, and basic print materials for small sellers.', array['Business Labels & Stickers', 'GCash QR Printing'], 150, true, 6)
on conflict do nothing;

insert into public.products (name, description, starting_price, category, is_available, display_order)
values
  ('Sticker Sheets', 'Custom sticker sheets for labels, packaging, gifts, and small business branding.', 60, 'Stickers', true, 1),
  ('Photo Prints', 'Clean photo prints from customer-provided files, ready for pickup.', 20, 'Photo', true, 2),
  ('Laminated Documents', 'Protected cards, certificates, IDs, and important everyday documents.', 20, 'Finishing', true, 3)
on conflict do nothing;

insert into public.price_items (service_name, unit_label, price_label, category, is_available, display_order)
values
  ('Black and white document', 'Short / A4', 'PHP 2.00+', 'Documents', true, 1),
  ('Colored document', 'Short / A4', 'PHP 10.00+', 'Documents', true, 2),
  ('Photo print', 'Per piece', 'PHP 20.00+', 'Photo', true, 3),
  ('Sticker print', 'Per sheet', 'PHP 60.00+', 'Stickers', true, 4),
  ('Lamination', 'Per piece', 'PHP 20.00+', 'Finishing', true, 5),
  ('Scanning', 'Per page', 'PHP 5.00+', 'Digital', true, 6),
  ('PDF merge / conversion', 'Per request', 'PHP 20.00+', 'Digital', true, 7),
  ('Document formatting', 'Per document', 'PHP 50.00+', 'Editing', true, 8)
on conflict do nothing;

with inserted_clients as (
  insert into public.clients (full_name, phone_number, messenger_name, email, address_or_landmark, notes, status)
  values
    ('Mika Santos', '0917 111 2222', 'Mika S.', 'mika@example.com', 'Near Crystal Cave barangay hall', 'Prefers Messenger updates.', 'active'),
    ('Jared Dela Cruz', '0928 333 4444', 'Jared DC', null, 'Crystal Cave Road', 'Repeat student printing customer.', 'active'),
    ('Luna Bakes', '0919 555 6666', 'Luna Bakes PH', 'hello@lunabakes.test', 'Small bakery near Baguio', 'Needs sticker labels monthly.', 'active')
  returning id, full_name
),
orders as (
  insert into public.projects_orders (
    client_id, service_type, title, description, quantity, page_count, paper_size,
    color_type, material_type, editing_required, file_received_via_messenger,
    deadline, pickup_date, order_status, total_price, amount_paid, payment_method, notes
  )
  select id, 'Resume / CV Printing', 'Resume print set', 'Two resume copies and certificate photocopies.', 1, 8, 'a4',
         'black_and_white', 'bond paper', true, true, now() + interval '1 day', now() + interval '1 day',
         'ready_for_pickup', 90, 50, 'gcash', 'Customer will pick up after class.'
  from inserted_clients where full_name = 'Mika Santos'
  union all
  select id, 'School & Project Printing', 'Research paper print', 'Colored cover page plus black and white inside pages.', 2, 42, 'a4',
         'mixed', 'bond paper', false, true, now() + interval '2 days', null,
         'in_progress', 180, 0, null, 'Check page order before printing.'
  from inserted_clients where full_name = 'Jared Dela Cruz'
  union all
  select id, 'Business Labels & Stickers', 'Cookie label stickers', 'Round product label stickers for packaging.', 4, 0, 'custom',
         'colored', 'sticker paper', false, true, now() + interval '3 days', null,
         'confirmed', 420, 420, 'cash', 'Use matte sticker paper.'
  from inserted_clients where full_name = 'Luna Bakes'
  returning id, order_number, total_price, amount_paid
)
insert into public.payments (order_id, amount, payment_method, payment_date, reference_number, notes)
select id, amount_paid, coalesce(nullif('gcash', ''), 'cash'), current_date, 'SEED-PAYMENT', 'Seed payment'
from orders
where amount_paid > 0;

insert into public.expenses (expense_name, category, amount, expense_date, supplier, notes)
values
  ('A4 bond paper restock', 'Paper', 650, current_date - interval '2 days', 'Local supplier', 'Two reams for daily printing.'),
  ('Sticker paper pack', 'Sticker Paper', 480, current_date - interval '1 day', 'Baguio print supplies', 'Matte sticker sheets.'),
  ('Black ink bottle', 'Ink', 350, current_date, 'Printer supplies shop', 'For document printing.')
on conflict do nothing;

insert into public.inventory_items (item_name, category, quantity, unit, minimum_stock_level, supplier, notes, status)
values
  ('A4 Bond Paper', 'Bond Paper', 6, 'reams', 2, 'Local supplier', 'Main document stock.', 'in_stock'),
  ('Matte Sticker Paper', 'Sticker Paper', 12, 'sheets', 20, 'Baguio print supplies', 'Low stock for label orders.', 'low_stock'),
  ('Black Ink', 'Ink', 1, 'bottle', 1, 'Printer supplies shop', 'Restock soon.', 'low_stock'),
  ('Lamination Pouches', 'Lamination Pouches', 0, 'packs', 1, 'Local supplier', 'Out of stock.', 'out_of_stock')
on conflict do nothing;

insert into public.activity_logs (user_id, action_type, module, record_id, record_label, description, metadata)
values
  (null, 'create', 'clients', null, 'Seed clients', 'Seed client records were added.', '{}'),
  (null, 'create', 'projects_orders', null, 'Seed orders', 'Seed project/order records were added.', '{}'),
  (null, 'payment_added', 'payments', null, 'Seed payments', 'Seed payment records were added.', '{}'),
  (null, 'inventory_updated', 'inventory_items', null, 'Seed inventory', 'Seed inventory records were added.', '{}')
on conflict do nothing;
