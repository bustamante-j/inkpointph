export const business = {
  name: "InkPoint Prints & Services",
  location: "Crystal Cave, Baguio City",
  motto: "Prints that make a point.",
  description:
    "Reliable printing, document, sticker, and photo print services for students, job seekers, small businesses, and nearby residents.",
  messenger:
    process.env.NEXT_PUBLIC_MESSENGER_LINK || "https://m.me/inkpointprints",
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE ||
    "https://web.facebook.com/people/InkPoint-Prints-Services/61590990023674/",
  facebookName: "InkPoint Prints and Services",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "inkpointph@gmail.com",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "To follow",
  website: process.env.NEXT_PUBLIC_WEBSITE_URL || "To follow",
  addressNote: "Exact shop address to follow.",
  hours: "8:00 AM - 10:00 PM daily",
  hoursNote: "Except when the shopkeeper has classes.",
  paymentNote:
    "Online orders are payment-first. Attach your GCash screenshot if already paid.",
};

export const defaultServices = [
  {
    name: "Printing",
    slug: "printing",
    description: "Upload your document and choose black and white or colored printing.",
    starting_price: 5,
    category: "Documents",
    image_url: "/images/services/printing.png",
    pricing_summary: "PHP 5 non-colored / PHP 10 colored per page",
    quantity_label: "Number of copies",
    requires_page_count: true,
    allows_color: true,
    requires_paper_size: true,
    allows_sides: true,
    allows_photo_size: false,
    allows_certificate_type: false,
  },
  {
    name: "Photocopy",
    slug: "photocopy",
    description: "Clear photocopies for school papers, IDs, forms, and office documents.",
    starting_price: 3,
    category: "Documents",
    image_url: "/images/services/photocopy.png",
    pricing_summary: "PHP 3 non-colored / PHP 5 colored per page",
    quantity_label: "Number of copies",
    requires_page_count: true,
    allows_color: true,
    requires_paper_size: true,
    allows_sides: true,
    allows_photo_size: false,
    allows_certificate_type: false,
  },
  {
    name: "Photo Printing",
    slug: "photo-printing",
    description: "Photo prints from uploaded files, available in common sizes.",
    starting_price: 50,
    category: "Photo",
    image_url: "/images/services/photo-printing.png",
    pricing_summary: "PHP 50-100 per photo",
    quantity_label: "Number of photos",
    requires_page_count: false,
    allows_color: false,
    requires_paper_size: false,
    allows_sides: false,
    allows_photo_size: true,
    allows_certificate_type: false,
  },
  {
    name: "Certificate Printing",
    slug: "certificate-printing",
    description: "Clean certificate printing for school, recognition, events, and office use.",
    starting_price: 15,
    category: "Events",
    image_url: "/images/services/certificate-printing.png",
    pricing_summary: "PHP 15 per certificate",
    quantity_label: "Number of certificates",
    requires_page_count: false,
    allows_color: true,
    requires_paper_size: true,
    allows_sides: false,
    allows_photo_size: false,
    allows_certificate_type: true,
  },
];

export const defaultSiteSettings = {
  id: "main",
  business_name: business.name,
  location: business.location,
  address_note: "",
  motto: business.motto,
  business_description:
    "Friendly and reliable printing for school, work, events, and everyday needs.",
  hero_eyebrow: "Printing made simple",
  hero_title: "Bring your ideas. We will put them on paper.",
  hero_description:
    "Choose a service, upload your file, review the calculated price, and attach your GCash payment screenshot.",
  hero_image_url: "/images/inkpoint-hero-bright.png",
  logo_url: "/brand/logo/inkpoint-logo.png",
  mascot_url: "/brand/mascot/inkpoint-mascot.png",
  messenger_url: business.messenger,
  facebook_url: business.facebook,
  facebook_name: business.facebookName,
  email: business.email,
  phone: business.phone === "To follow" ? "" : business.phone,
  website_url: business.website === "To follow" ? "" : business.website,
  hours: business.hours,
  hours_note: business.hoursNote,
  payment_instructions:
    "Online orders require a GCash payment screenshot before submission.",
  walk_in_note: "Walk-ins are always welcome. No registration or online order is required.",
  announcement: "",
  seo_title: "InkPoint Prints & Services | Printing in Baguio City",
  seo_description:
    "Printing, photocopy, photo printing, and certificate printing in Crystal Cave, Baguio City.",
  primary_color: "#7f1017",
  background_color: "#fff7ed",
};

export const defaultSiteSections = [
  { section_key: "order", title: "Start your order", is_visible: true, display_order: 1 },
  { section_key: "contact", title: "Contact InkPoint", is_visible: true, display_order: 2 },
  { section_key: "services", title: "Services and prices", is_visible: true, display_order: 3 },
  { section_key: "products", title: "Print examples", is_visible: true, display_order: 4 },
  { section_key: "packages", title: "Helpful packages", is_visible: true, display_order: 5 },
  { section_key: "process", title: "How it works", is_visible: true, display_order: 6 },
  { section_key: "faq", title: "Quick answers", is_visible: true, display_order: 7 },
];

export const defaultOrderStepItems = [
  { title: "Choose", description: "Select the service and print options you need.", is_visible: true, display_order: 1 },
  { title: "Upload", description: "Attach your document, image, or certificate file.", is_visible: true, display_order: 2 },
  { title: "Pay", description: "Review the calculated price and attach your GCash screenshot.", is_visible: true, display_order: 3 },
  { title: "Track", description: "Keep your order number and check the latest status anytime.", is_visible: true, display_order: 4 },
  { title: "Collect", description: "Pick up at the shop or arrange delivery when ready.", is_visible: true, display_order: 5 },
];

export const defaultOrderFormOptions = [
  { field_key: "print_color", option_value: "non_colored", option_label: "Non-colored", is_available: true, display_order: 1 },
  { field_key: "print_color", option_value: "colored", option_label: "Colored", is_available: true, display_order: 2 },
  { field_key: "paper_size", option_value: "short", option_label: "Short", is_available: true, display_order: 1 },
  { field_key: "paper_size", option_value: "a4", option_label: "A4", is_available: true, display_order: 2 },
  { field_key: "paper_size", option_value: "legal", option_label: "Long / Legal", is_available: true, display_order: 3 },
  { field_key: "paper_size", option_value: "custom", option_label: "Custom / not sure", is_available: true, display_order: 4 },
  { field_key: "print_sides", option_value: "single_sided", option_label: "Single-sided", is_available: true, display_order: 1 },
  { field_key: "print_sides", option_value: "double_sided", option_label: "Double-sided", is_available: true, display_order: 2 },
  { field_key: "certificate_type", option_value: "ready_to_print", option_label: "Ready-to-print file", is_available: true, display_order: 1 },
  { field_key: "certificate_type", option_value: "needs_name_edit", option_label: "Needs name editing", is_available: true, display_order: 2 },
  { field_key: "certificate_type", option_value: "needs_layout", option_label: "Needs layout help", is_available: true, display_order: 3 },
  { field_key: "fulfillment", option_value: "pickup", option_label: "Pickup", is_available: true, display_order: 1 },
  { field_key: "fulfillment", option_value: "delivery", option_label: "Delivery", is_available: true, display_order: 2 },
];

export const defaultPackages = [
  {
    name: "Student Document Pack",
    description: "Printing or photocopy for modules, reviewers, forms, and assignments.",
    starting_price: "Starts at PHP 3/page",
  },
  {
    name: "Colored Output Pack",
    description: "Colored printing or colored photocopy for pages that need visual clarity.",
    starting_price: "Starts at PHP 5/page",
  },
  {
    name: "Photo Print Set",
    description: "Photo printing for personal, school, and keepsake images.",
    starting_price: "PHP 50-100/photo",
  },
  {
    name: "Certificate Set",
    description: "Certificate printing for classes, events, recognition, and simple awards.",
    starting_price: "PHP 15/certificate",
  },
];

export const defaultProducts = [
  {
    name: "Printed Documents",
    description: "Everyday document prints in black and white or colored output.",
    starting_price: 5,
    category: "Printing",
    image_url: "/images/services/printing.png",
  },
  {
    name: "Photocopies",
    description: "Readable copies for forms, IDs, school work, and office paperwork.",
    starting_price: 3,
    category: "Photocopy",
    image_url: "/images/services/photocopy.png",
  },
  {
    name: "Photo Prints",
    description: "Glossy photo prints from uploaded customer images.",
    starting_price: 50,
    category: "Photo",
    image_url: "/images/services/photo-printing.png",
  },
  {
    name: "Certificates",
    description: "Certificate prints for recognition, school, and event needs.",
    starting_price: 15,
    category: "Certificates",
    image_url: "/images/services/certificate-printing.png",
  },
];

export const priceRows = [
  ["Printing", "Non-colored per page", "PHP 5.00"],
  ["Printing", "Colored per page", "PHP 10.00"],
  ["Photocopy", "Non-colored per page", "PHP 3.00"],
  ["Photocopy", "Colored per page", "PHP 5.00"],
  ["Photo Printing", "Per photo", "PHP 50.00-100.00"],
  ["Certificate Printing", "Per certificate", "PHP 15.00"],
];

export const defaultPriceItems = [
  { service_name: "Printing", unit_label: "Non-colored per page", price_label: "PHP 5.00", category: "Documents", option_key: "non_colored", unit_price: 5, max_price: null, display_order: 1 },
  { service_name: "Printing", unit_label: "Colored per page", price_label: "PHP 10.00", category: "Documents", option_key: "colored", unit_price: 10, max_price: null, display_order: 2 },
  { service_name: "Photocopy", unit_label: "Non-colored per page", price_label: "PHP 3.00", category: "Documents", option_key: "non_colored", unit_price: 3, max_price: null, display_order: 3 },
  { service_name: "Photocopy", unit_label: "Colored per page", price_label: "PHP 5.00", category: "Documents", option_key: "colored", unit_price: 5, max_price: null, display_order: 4 },
  { service_name: "Photo Printing", unit_label: "2x2 photo", price_label: "PHP 50.00", category: "Photo", option_key: "2x2", unit_price: 50, max_price: null, display_order: 5 },
  { service_name: "Photo Printing", unit_label: "4R photo", price_label: "PHP 75.00", category: "Photo", option_key: "4r", unit_price: 75, max_price: null, display_order: 6 },
  { service_name: "Photo Printing", unit_label: "5R photo", price_label: "PHP 100.00", category: "Photo", option_key: "5r", unit_price: 100, max_price: null, display_order: 7 },
  { service_name: "Certificate Printing", unit_label: "Per certificate", price_label: "PHP 15.00", category: "Events", option_key: "default", unit_price: 15, max_price: null, display_order: 8 },
];

export const orderSteps = [
  "Fill out the order form.",
  "Upload your file if available.",
  "Wait for price confirmation.",
  "Pay through GCash for online orders.",
  "We prepare your prints.",
];

export const faqItems = [
  {
    question: "Do you accept rush orders?",
    answer:
      "Yes, rush orders may be accepted depending on queue, file readiness, quantity, and material availability.",
  },
  {
    question: "Can I send files online?",
    answer:
      "Yes. You can upload files directly in the website order form.",
  },
  {
    question: "Do you print photos?",
    answer:
      "Yes. Photo printing is available from uploaded image files.",
  },
  {
    question: "Do you print certificates?",
    answer:
      "Yes. Certificate printing is available at PHP 15 per certificate.",
  },
  {
    question: "Can I choose colored or non-colored?",
    answer:
      "Yes. The order form asks whether your request is colored or non-colored when that option applies.",
  },
  {
    question: "Do you accept GCash?",
    answer: "Yes. For online orders, attach your GCash payment screenshot in the form.",
  },
  {
    question: "Where are you located?",
    answer: "InkPoint Prints & Services is located at Crystal Cave, Baguio City.",
  },
];

export const defaultFaqs = faqItems.map((item, index) => ({
  ...item,
  is_visible: true,
  display_order: index + 1,
}));

export const serviceTypeOptions = [
  "Printing",
  "Photocopy",
  "Photo Printing",
  "Certificate Printing",
];

export const publicServiceNames = serviceTypeOptions;

export const expenseCategories = [
  "Paper",
  "Ink",
  "Sticker Paper",
  "Photo Paper",
  "Lamination",
  "Equipment",
  "Marketing",
  "Electricity",
  "Maintenance",
  "Transportation",
  "Miscellaneous",
];

export const inventoryCategories = [
  "Bond Paper",
  "Photo Paper",
  "Sticker Paper",
  "Ink",
  "Lamination Pouches",
  "Folders",
  "Packaging",
  "Other Supplies",
];

export const productCategories = [
  "Printing",
  "Photocopy",
  "Photo",
  "Certificates",
];
