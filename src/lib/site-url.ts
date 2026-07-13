export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL;
  if (configured && /^https?:\/\//i.test(configured)) return configured.replace(/\/$/, "");
  return "http://localhost:3000";
}
