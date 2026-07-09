insert into public.services (name, description, starting_price, category, is_available, display_order)
values
  ('Printing', 'Upload your document and choose black and white or colored printing.', 5, 'Documents', true, 1),
  ('Photocopy', 'Clear photocopies for school papers, IDs, forms, and office documents.', 3, 'Documents', true, 2),
  ('Photo Printing', 'Photo prints from uploaded files, available in common sizes.', 50, 'Photo', true, 3),
  ('Certificate Printing', 'Clean certificate printing for school, recognition, events, and office use.', 15, 'Events', true, 4)
on conflict do nothing;

insert into public.packages (name, description, included_services, starting_price, is_available, display_order)
values
  ('Student Document Pack', 'Printing or photocopy for modules, reviewers, forms, and assignments.', array['Printing', 'Photocopy'], 3, true, 1),
  ('Colored Output Pack', 'Colored printing or colored photocopy for pages that need visual clarity.', array['Printing', 'Photocopy'], 5, true, 2),
  ('Photo Print Set', 'Photo printing for personal, school, and keepsake images.', array['Photo Printing'], 50, true, 3),
  ('Certificate Set', 'Certificate printing for classes, events, recognition, and simple awards.', array['Certificate Printing'], 15, true, 4)
on conflict do nothing;

insert into public.products (name, description, starting_price, category, image_url, is_available, display_order)
values
  ('Printed Documents', 'Everyday document prints in black and white or colored output.', 5, 'Printing', '/images/services/printing.png', true, 1),
  ('Photocopies', 'Readable copies for forms, IDs, school work, and office paperwork.', 3, 'Photocopy', '/images/services/photocopy.png', true, 2),
  ('Photo Prints', 'Glossy photo prints from uploaded customer images.', 50, 'Photo', '/images/services/photo-printing.png', true, 3),
  ('Certificates', 'Certificate prints for recognition, school, and event needs.', 15, 'Certificates', '/images/services/certificate-printing.png', true, 4)
on conflict do nothing;

insert into public.price_items (service_name, unit_label, price_label, category, is_available, display_order)
values
  ('Printing', 'Non-colored per page', 'PHP 5.00', 'Documents', true, 1),
  ('Printing', 'Colored per page', 'PHP 10.00', 'Documents', true, 2),
  ('Photocopy', 'Non-colored per page', 'PHP 3.00', 'Documents', true, 3),
  ('Photocopy', 'Colored per page', 'PHP 5.00', 'Documents', true, 4),
  ('Photo Printing', 'Per photo', 'PHP 50.00-100.00', 'Photo', true, 5),
  ('Certificate Printing', 'Per certificate', 'PHP 15.00', 'Events', true, 6)
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
  select id, 'Printing', 'Resume print set', 'Two resume copies and certificate photocopies.', 1, 8, 'a4',
         'black_and_white', 'bond paper', true, true, now() + interval '1 day', now() + interval '1 day',
         'ready_for_pickup', 90, 50, 'gcash', 'Customer will pick up after class.'
  from inserted_clients where full_name = 'Mika Santos'
  union all
  select id, 'Printing', 'Research paper print', 'Colored cover page plus black and white inside pages.', 2, 42, 'a4',
         'mixed', 'bond paper', false, true, now() + interval '2 days', null,
         'in_progress', 180, 0, null, 'Check page order before printing.'
  from inserted_clients where full_name = 'Jared Dela Cruz'
  union all
  select id, 'Photo Printing', 'Photo print set', 'Photo prints for pickup.', 4, 0, 'custom',
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
