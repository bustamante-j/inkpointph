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
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "inkpointprints@gmail.com",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "To follow",
  website: process.env.NEXT_PUBLIC_WEBSITE_URL || "To follow",
  addressNote: "Exact shop address to follow.",
  hours: "8:00 AM - 10:00 PM daily",
  hoursNote: "Except when the shopkeeper has classes.",
  paymentNote: "Online orders are payment-first. GCash details to follow.",
};

export const defaultServices = [
  {
    name: "General Printing",
    description: "Everyday document printing for school, work, and business.",
    starting_price: "Starting price",
    category: "Documents",
  },
  {
    name: "Photocopying",
    description: "Clear copies for IDs, forms, reviewers, and office papers.",
    starting_price: "Starting price",
    category: "Documents",
  },
  {
    name: "Scanning",
    description: "Document scans for online submission and archiving.",
    starting_price: "Starting price",
    category: "Digital",
  },
  {
    name: "Sticker Printing",
    description: "Sticker sheets for labels, packaging, and personal use.",
    starting_price: "Starting price",
    category: "Stickers",
  },
  {
    name: "Photo Printing",
    description: "Photo prints from customer-provided files.",
    starting_price: "Starting price",
    category: "Photo",
  },
  {
    name: "Resume / CV Printing",
    description: "Clean, presentable prints for job applications.",
    starting_price: "Starting price",
    category: "Career",
  },
  {
    name: "ID Photo Layout & Printing",
    description: "Layout and print ID photos using a clear photo you provide.",
    starting_price: "Starting price",
    category: "Photo",
  },
  {
    name: "Lamination",
    description: "Protect important documents, cards, and certificates.",
    starting_price: "Starting price",
    category: "Finishing",
  },
  {
    name: "Document Formatting",
    description: "Light formatting for resumes, school work, and forms.",
    starting_price: "Starting price",
    category: "Editing",
  },
  {
    name: "PDF Conversion / Merge / Scan",
    description: "Prepare PDFs for school, office, and online submissions.",
    starting_price: "Starting price",
    category: "Digital",
  },
  {
    name: "School & Project Printing",
    description: "Outputs for modules, reports, reviewers, and projects.",
    starting_price: "Starting price",
    category: "School",
  },
  {
    name: "Business Labels & Stickers",
    description: "Labels for food packs, bottles, boxes, and small products.",
    starting_price: "Starting price",
    category: "Business",
  },
  {
    name: "Invitations / Certificates",
    description: "Simple print-ready invitations, certificates, and layouts.",
    starting_price: "Starting price",
    category: "Events",
  },
  {
    name: "GCash QR Printing",
    description: "Clean QR prints for counters, shops, and payment displays.",
    starting_price: "Starting price",
    category: "Business",
  },
];

export const defaultPackages = [
  {
    name: "Job Seeker Basic Package",
    description: "Resume print, photocopy, and basic document preparation.",
    starting_price: "Starting price",
  },
  {
    name: "Job Seeker Complete Package",
    description: "Resume, certificates, IDs, and application papers prepared together.",
    starting_price: "Starting price",
  },
  {
    name: "Student Rush Package",
    description: "Quick school document printing for urgent submissions.",
    starting_price: "Starting price",
  },
  {
    name: "ID Photo Print Package",
    description: "ID photo layout and printing from a customer-provided photo.",
    starting_price: "Starting price",
  },
  {
    name: "Sticker Starter Package",
    description: "Starter sticker sheet for labels, gifts, or personal projects.",
    starting_price: "Starting price",
  },
  {
    name: "Small Business Starter Package",
    description: "Labels, QR prints, and basic print materials for small sellers.",
    starting_price: "Starting price",
  },
  {
    name: "Document Online Submission Package",
    description: "Scan, merge, convert, and prepare files for online upload.",
    starting_price: "Starting price",
  },
  {
    name: "Print-Ready Fix Package",
    description: "Light document cleanup before printing or submission.",
    starting_price: "Starting price",
  },
];

export const defaultProducts = [
  {
    name: "Sticker Sheets",
    description: "Custom sticker sheets for labels, packaging, gifts, and small business branding.",
    starting_price: "Starting price",
    category: "Stickers",
    image_url: null,
  },
  {
    name: "Photo Prints",
    description: "Clean photo prints from customer-provided files, ready for pickup.",
    starting_price: "Starting price",
    category: "Photo",
    image_url: null,
  },
  {
    name: "Laminated Documents",
    description: "Protected cards, certificates, IDs, and important everyday documents.",
    starting_price: "Starting price",
    category: "Finishing",
    image_url: null,
  },
];

export const priceRows = [
  ["Black and white document", "Short / A4", "PHP 2.00+"],
  ["Colored document", "Short / A4", "PHP 10.00+"],
  ["Photo print", "Per piece", "PHP 20.00+"],
  ["Sticker print", "Per sheet", "PHP 60.00+"],
  ["Lamination", "Per piece", "PHP 20.00+"],
  ["Scanning", "Per page", "PHP 5.00+"],
  ["PDF merge / conversion", "Per request", "PHP 20.00+"],
  ["Document formatting", "Per document", "PHP 50.00+"],
];

export const orderSteps = [
  "Send your order details.",
  "Wait for price confirmation.",
  "Pay first for online orders.",
  "We prepare your prints.",
  "Pick up or arrange delivery.",
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
      "Yes. Files are accepted through Messenger only. This website does not accept direct file uploads.",
  },
  {
    question: "Do you print ID photos?",
    answer:
      "Yes. We can layout and print ID photos using a clear customer-provided photo.",
  },
  {
    question: "Do you take photos?",
    answer:
      "We do not take photos. We can only layout and print ID photos using a clear customer-provided photo.",
  },
  {
    question: "Can you edit my document?",
    answer:
      "Light formatting and print-ready fixes are available. We will confirm scope and price through Messenger.",
  },
  {
    question: "Do you accept GCash?",
    answer: "Yes. Cash and GCash payments are accepted.",
  },
  {
    question: "Where are you located?",
    answer: "InkPoint Prints & Services is located at Crystal Cave, Baguio City.",
  },
];

export const serviceTypeOptions = [
  "General Printing",
  "Photocopying",
  "Scanning",
  "Sticker Printing",
  "Photo Printing",
  "Resume / CV Printing",
  "ID Photo Layout & Printing",
  "Lamination",
  "Document Formatting",
  "PDF Conversion / Merge / Scan",
  "School & Project Printing",
  "Business Labels & Stickers",
  "Invitations / Certificates",
  "GCash QR Printing",
];

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
  "Documents",
  "Stickers",
  "Photo",
  "Finishing",
  "School",
  "Business",
  "Events",
  "Custom",
];
