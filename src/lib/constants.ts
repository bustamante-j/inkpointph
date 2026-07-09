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
    description: "Upload your document and choose black and white or colored printing.",
    starting_price: 5,
    category: "Documents",
  },
  {
    name: "Photocopy",
    description: "Clear photocopies for school papers, IDs, forms, and office documents.",
    starting_price: 3,
    category: "Documents",
  },
  {
    name: "Photo Printing",
    description: "Photo prints from uploaded files, available in common sizes.",
    starting_price: 50,
    category: "Photo",
  },
  {
    name: "Certificate Printing",
    description: "Clean certificate printing for school, recognition, events, and office use.",
    starting_price: 15,
    category: "Events",
  },
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
