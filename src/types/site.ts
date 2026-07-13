export type SiteSettings = {
  id: string;
  business_name: string;
  location: string;
  address_note: string | null;
  motto: string;
  business_description: string | null;
  hero_eyebrow: string | null;
  hero_title: string;
  hero_description: string | null;
  hero_image_url: string | null;
  logo_url: string | null;
  mascot_url: string | null;
  messenger_url: string | null;
  facebook_url: string | null;
  facebook_name: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  hours: string | null;
  hours_note: string | null;
  payment_instructions: string | null;
  walk_in_note: string | null;
  announcement: string | null;
  seo_title: string | null;
  seo_description: string | null;
  primary_color: string;
  background_color: string;
};

export type PublicService = {
  id?: string;
  name: string;
  slug: string | null;
  description: string | null;
  starting_price: number;
  category: string | null;
  image_url: string | null;
  pricing_summary: string | null;
  quantity_label: string;
  requires_page_count: boolean;
  allows_color: boolean;
  requires_paper_size: boolean;
  allows_sides: boolean;
  allows_photo_size: boolean;
  allows_certificate_type: boolean;
  display_order?: number;
};

export type PublicPriceItem = {
  id?: string;
  service_name: string;
  unit_label: string;
  price_label: string;
  category: string | null;
  option_key: string | null;
  unit_price: number | null;
  max_price: number | null;
  display_order: number;
};

export type SiteSection = {
  id?: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  display_order: number;
};

export type SiteListItem = {
  id?: string;
  title?: string;
  description?: string | null;
  question?: string;
  answer?: string;
  is_visible: boolean;
  display_order: number;
};
