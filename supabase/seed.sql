insert into public.site_settings (
  id, business_name, location, address_note, motto, business_description,
  hero_eyebrow, hero_title, hero_description, hero_image_url, logo_url, mascot_url,
  messenger_url, facebook_url, facebook_name, email, hours, hours_note,
  payment_instructions, walk_in_note, seo_title, seo_description
)
values (
  'main', 'InkPoint Prints & Services', 'Crystal Cave, Baguio City', null,
  'Prints that make a point.', 'Friendly and reliable printing for school, work, events, and everyday needs.',
  'Printing made simple', 'Bring your ideas. We will put them on paper.',
  'Choose a service, upload your file, review the calculated price, and attach your GCash payment screenshot.',
  '/images/inkpoint-hero-bright.png', '/brand/logo/inkpoint-logo.png', '/brand/mascot/inkpoint-mascot.png',
  'https://m.me/inkpointprints', 'https://web.facebook.com/people/InkPoint-Prints-Services/61590990023674/',
  'InkPoint Prints and Services', 'inkpointph@gmail.com', '8:00 AM - 10:00 PM daily',
  'Except when the shopkeeper has classes.', 'Online orders require a GCash payment screenshot before submission.',
  'Walk-ins are always welcome. No registration or online order is required.',
  'InkPoint Prints & Services | Printing in Baguio City',
  'Printing, photocopy, photo printing, and certificate printing in Crystal Cave, Baguio City.'
)
on conflict (id) do update set
  business_name = excluded.business_name,
  email = excluded.email;

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
values
  ('Choose', 'Select the service and print options you need.', true, 1),
  ('Upload', 'Attach your document, image, or certificate file.', true, 2),
  ('Pay', 'Review the calculated price and attach your GCash screenshot.', true, 3),
  ('Track', 'Keep your order number and check the latest status anytime.', true, 4),
  ('Collect', 'Pick up at the shop or arrange delivery when ready.', true, 5);

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
values
  ('Do you accept rush orders?', 'Yes, depending on the queue, file readiness, quantity, and available materials.', true, 1),
  ('Can I send files online?', 'Yes. Upload your files directly in the order form.', true, 2),
  ('Can I visit without ordering online?', 'Yes. Walk-ins are welcome and do not need an account.', true, 3),
  ('How do I know when my order is ready?', 'Use your order number and the last four digits of your contact number on the Track Order page.', true, 4);

insert into public.services (
  name, slug, description, starting_price, category, image_url, pricing_summary,
  quantity_label, requires_page_count, allows_color, requires_paper_size,
  allows_sides, allows_photo_size, allows_certificate_type, is_available, display_order
)
values
  ('Printing', 'printing', 'Upload your document and choose non-colored or colored printing.', 5, 'Documents', '/images/services/printing.png', 'PHP 5 non-colored / PHP 10 colored per page', 'Number of copies', true, true, true, true, false, false, true, 1),
  ('Photocopy', 'photocopy', 'Clear photocopies for school papers, IDs, forms, and office documents.', 3, 'Documents', '/images/services/photocopy.png', 'PHP 3 non-colored / PHP 5 colored per page', 'Number of copies', true, true, true, true, false, false, true, 2),
  ('Photo Printing', 'photo-printing', 'Photo prints from uploaded files, available in common sizes.', 50, 'Photo', '/images/services/photo-printing.png', 'PHP 50-100 per photo', 'Number of photos', false, false, false, false, true, false, true, 3),
  ('Certificate Printing', 'certificate-printing', 'Clean certificate printing for school, recognition, events, and office use.', 15, 'Events', '/images/services/certificate-printing.png', 'PHP 15 per certificate', 'Number of certificates', false, true, true, false, false, true, true, 4)
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

insert into public.price_items (service_name, unit_label, price_label, category, option_key, unit_price, max_price, is_available, display_order)
values
  ('Printing', 'Non-colored per page', 'PHP 5.00', 'Documents', 'non_colored', 5, null, true, 1),
  ('Printing', 'Colored per page', 'PHP 10.00', 'Documents', 'colored', 10, null, true, 2),
  ('Photocopy', 'Non-colored per page', 'PHP 3.00', 'Documents', 'non_colored', 3, null, true, 3),
  ('Photocopy', 'Colored per page', 'PHP 5.00', 'Documents', 'colored', 5, null, true, 4),
  ('Photo Printing', '2x2 photo', 'PHP 50.00', 'Photo', '2x2', 50, null, true, 5),
  ('Photo Printing', '4R photo', 'PHP 75.00', 'Photo', '4r', 75, null, true, 6),
  ('Photo Printing', '5R photo', 'PHP 100.00', 'Photo', '5r', 100, null, true, 7),
  ('Certificate Printing', 'Per certificate', 'PHP 15.00', 'Events', 'default', 15, null, true, 8)
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
