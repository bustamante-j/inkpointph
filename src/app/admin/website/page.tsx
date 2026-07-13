import Link from "next/link";
import { ExternalLink, ImageIcon, LayoutTemplate, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import {
  deleteSiteListItemAction,
  saveSiteListItemAction,
  saveSiteSectionAction,
  updateSiteSettingsAction,
} from "@/lib/admin/website-actions";
import { getWebsiteManagerData } from "@/lib/public/data";
import type { SiteListItem } from "@/types/site";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputClass =
  "mt-1.5 h-10 w-full border border-red-900/20 bg-white px-3 text-sm outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/10";

export default async function WebsiteManagerPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const data = await getWebsiteManagerData();
  const settings = data.settings;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Website Manager"
        description="Edit the public website without touching code. Changes appear after saving."
        action={{ href: "/", label: "View Website", icon: <ExternalLink className="h-4 w-4" /> }}
      />

      {query.saved ? <Notice title="Website changes saved" tone="success">The public page now uses the latest saved content.</Notice> : null}
      {query.deleted ? <Notice title="Content removed" tone="success">The item is no longer shown on the public website.</Notice> : null}
      {!data.configured ? <Notice title="Supabase setup required" tone="warning">Run `supabase/business-upgrade.sql` before saving website content.</Notice> : null}
      {data.error ? <Notice title="Website content issue" tone="warning">{data.error}</Notice> : null}

      <nav className="grid border border-red-900/15 bg-white sm:grid-cols-4">
        {[
          ["#business-content", "Brand & contact"],
          ["#page-sections", "Page sections"],
          ["#order_steps", "Order flow"],
          ["#faq_items", "FAQs"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="border-b border-red-900/10 px-4 py-3 text-center text-sm font-semibold text-red-950 hover:bg-red-50 sm:border-b-0 sm:border-r last:border-r-0">
            {label}
          </a>
        ))}
      </nav>

      <section className="grid gap-3 md:grid-cols-3">
        <ManagerLink href="/admin/services" title="Services & Packages" copy="Offerings, descriptions, availability, and order options." />
        <ManagerLink href="/admin/prices" title="Price Calculator" copy="Price rows used by the public estimate and price table." />
        <ManagerLink href="/admin/products" title="Product Photos" copy="Public gallery items, images, prices, and availability." />
      </section>

      <form id="business-content" action={updateSiteSettingsAction} encType="multipart/form-data" className="border border-red-900/20 bg-white">
        <EditorHeader title="Brand, hero, and contact" copy="Core business information and the first content customers see." />
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <Field label="Business name" name="business_name" value={settings.business_name} required />
          <Field label="Motto" name="motto" value={settings.motto} required />
          <Field label="Location" name="location" value={settings.location} required />
          <Field label="Exact address / landmark" name="address_note" value={settings.address_note} />
          <TextArea label="Business description" name="business_description" value={settings.business_description} />
          <TextArea label="Announcement" name="announcement" value={settings.announcement} />

          <div className="border-t border-red-900/10 pt-5 lg:col-span-2">
            <h3 className="text-sm font-black uppercase text-red-950">Hero</h3>
          </div>
          <Field label="Hero label" name="hero_eyebrow" value={settings.hero_eyebrow} />
          <Field label="Hero headline" name="hero_title" value={settings.hero_title} required />
          <TextArea label="Hero description" name="hero_description" value={settings.hero_description} />
          <AssetField label="Hero image" name="hero_image" currentName="current_hero_image" url={settings.hero_image_url} />
          <AssetField label="Logo" name="logo_image" currentName="current_logo_image" url={settings.logo_url} />
          <AssetField label="Mascot" name="mascot_image" currentName="current_mascot_image" url={settings.mascot_url} />

          <div className="border-t border-red-900/10 pt-5 lg:col-span-2">
            <h3 className="text-sm font-black uppercase text-red-950">Contact and shop details</h3>
          </div>
          <Field label="Facebook page name" name="facebook_name" value={settings.facebook_name} />
          <Field label="Facebook URL" name="facebook_url" value={settings.facebook_url} type="url" />
          <Field label="Messenger URL" name="messenger_url" value={settings.messenger_url} type="url" />
          <Field label="Email" name="email" value={settings.email} type="email" />
          <Field label="Phone" name="phone" value={settings.phone} type="tel" />
          <Field label="Website URL" name="website_url" value={settings.website_url} type="url" />
          <Field label="Business hours" name="hours" value={settings.hours} />
          <Field label="Hours note" name="hours_note" value={settings.hours_note} />
          <TextArea label="Payment instructions" name="payment_instructions" value={settings.payment_instructions} />
          <TextArea label="Walk-in note" name="walk_in_note" value={settings.walk_in_note} />

          <div className="border-t border-red-900/10 pt-5 lg:col-span-2">
            <h3 className="text-sm font-black uppercase text-red-950">Appearance and search</h3>
          </div>
          <ColorField label="Primary color" name="primary_color" value={settings.primary_color} />
          <ColorField label="Background color" name="background_color" value={settings.background_color} />
          <Field label="Search title" name="seo_title" value={settings.seo_title} />
          <TextArea label="Search description" name="seo_description" value={settings.seo_description} />
        </div>
        <div className="flex justify-end border-t border-red-900/10 bg-[#fff7ed] p-4">
          <Button type="submit"><Save className="h-4 w-4" /> Save Website Details</Button>
        </div>
      </form>

      <section id="page-sections" className="border border-red-900/20 bg-white">
        <EditorHeader title="Page sections" copy="Rename, arrange, or hide complete public sections." />
        <div className="divide-y divide-red-900/10">
          {data.sections.map((section) => (
            <form key={section.section_key} action={saveSiteSectionAction.bind(null, section.section_key)} className="grid gap-3 p-4 sm:grid-cols-[1fr_8rem_8rem_auto] sm:items-end">
              <Field label={section.section_key.replaceAll("_", " ")} name="title" value={section.title} required compact />
              <Field label="Order" name="display_order" value={section.display_order} type="number" compact />
              <Toggle label="Visible" name="is_visible" checked={section.is_visible} />
              <Button type="submit" variant="secondary" className="px-3"><Save className="h-4 w-4" /> Save</Button>
            </form>
          ))}
        </div>
      </section>

      <ListEditor title="Order flow" copy="Steps customers see after the service catalog." id="order_steps" items={data.steps} collection="order_steps" />
      <ListEditor title="Frequently asked questions" copy="Short answers customers can expand when needed." id="faq_items" items={data.faqs} collection="faq_items" />
    </div>
  );
}

function ManagerLink({ href, title, copy }: { href: string; title: string; copy: string }) {
  return (
    <Link href={href} className="border border-red-900/15 bg-white p-4 hover:border-red-900">
      <LayoutTemplate className="h-5 w-5 text-red-900" />
      <p className="mt-3 text-sm font-black text-zinc-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{copy}</p>
    </Link>
  );
}

function ListEditor({ title, copy, id, items, collection }: { title: string; copy: string; id: string; items: SiteListItem[]; collection: "faq_items" | "order_steps" }) {
  return (
    <section id={id} className="border border-red-900/20 bg-white">
      <EditorHeader title={title} copy={copy} />
      <div className="divide-y divide-red-900/10">
        {items.map((item, index) => (
          <form key={item.id ?? `${collection}-${index}`} action={saveSiteListItemAction.bind(null, collection, item.id ?? null)} className="grid gap-3 p-4 lg:grid-cols-[1fr_1.4fr_6rem_7rem_auto] lg:items-end">
            <Field label={collection === "faq_items" ? "Question" : "Step title"} name={collection === "faq_items" ? "question" : "title"} value={collection === "faq_items" ? item.question : item.title} required compact />
            <TextArea label={collection === "faq_items" ? "Answer" : "Description"} name={collection === "faq_items" ? "answer" : "description"} value={collection === "faq_items" ? item.answer : item.description} compact />
            <Field label="Order" name="display_order" value={item.display_order} type="number" compact />
            <Toggle label="Visible" name="is_visible" checked={item.is_visible} />
            <div className="flex gap-1">
              <Button type="submit" variant="secondary" className="w-10 px-0" title="Save"><Save className="h-4 w-4" /></Button>
              {item.id ? <Button formAction={deleteSiteListItemAction.bind(null, collection, item.id)} variant="ghost" className="w-10 px-0 text-rose-700" title="Delete"><Trash2 className="h-4 w-4" /></Button> : null}
            </div>
          </form>
        ))}
        <form action={saveSiteListItemAction.bind(null, collection, null)} className="grid gap-3 bg-[#fff7ed] p-4 lg:grid-cols-[1fr_1.4fr_6rem_7rem_auto] lg:items-end">
          <Field label={collection === "faq_items" ? "New question" : "New step"} name={collection === "faq_items" ? "question" : "title"} value="" required compact />
          <TextArea label={collection === "faq_items" ? "Answer" : "Description"} name={collection === "faq_items" ? "answer" : "description"} value="" compact />
          <Field label="Order" name="display_order" value={items.length + 1} type="number" compact />
          <Toggle label="Visible" name="is_visible" checked />
          <Button type="submit"><Plus className="h-4 w-4" /> Add</Button>
        </form>
      </div>
    </section>
  );
}

function EditorHeader({ title, copy }: { title: string; copy: string }) {
  return <div className="border-b border-red-900/10 bg-red-950 px-5 py-4 text-white"><h2 className="font-black">{title}</h2><p className="mt-1 text-xs text-red-100">{copy}</p></div>;
}

function Field({ label, name, value, type = "text", required, compact }: { label: string; name: string; value: unknown; type?: string; required?: boolean; compact?: boolean }) {
  return <label className="block"><span className="text-xs font-semibold capitalize text-zinc-700">{label}{required ? " *" : ""}</span><input name={name} type={type} defaultValue={String(value ?? "")} required={required} className={`${inputClass} ${compact ? "h-9" : ""}`} /></label>;
}

function TextArea({ label, name, value, compact }: { label: string; name: string; value: unknown; compact?: boolean }) {
  return <label className="block"><span className="text-xs font-semibold text-zinc-700">{label}</span><textarea name={name} defaultValue={String(value ?? "")} rows={compact ? 2 : 4} className={`${inputClass} h-auto min-h-20 py-2`} /></label>;
}

function Toggle({ label, name, checked }: { label: string; name: string; checked: boolean }) {
  return <label className="flex h-9 items-center gap-2 border border-red-900/15 bg-white px-3 text-xs font-semibold text-zinc-700"><input name={name} type="checkbox" defaultChecked={checked} className="h-4 w-4 accent-red-900" />{label}</label>;
}

function ColorField({ label, name, value }: { label: string; name: string; value: string }) {
  return <label className="block"><span className="text-xs font-semibold text-zinc-700">{label}</span><div className="mt-1.5 flex h-10 border border-red-900/20 bg-white"><input name={name} type="color" defaultValue={value} className="h-full w-14 border-r border-red-900/10 bg-transparent p-1" /><span className="flex items-center px-3 text-xs font-semibold text-zinc-600">{value}</span></div></label>;
}

function AssetField({ label, name, currentName, url }: { label: string; name: string; currentName: string; url: string | null }) {
  return <label className="block"><span className="text-xs font-semibold text-zinc-700">{label}</span><input type="hidden" name={currentName} value={url ?? ""} /><div className="mt-1.5 grid min-h-28 grid-cols-[7rem_1fr] border border-red-900/15 bg-[#fff7ed]"><div className="bg-cover bg-center" style={url ? { backgroundImage: `url(${url})` } : undefined}>{!url ? <span className="flex h-full items-center justify-center"><ImageIcon className="h-5 w-5 text-zinc-400" /></span> : null}</div><input name={name} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="m-3 self-center text-xs file:mr-3 file:border-0 file:bg-red-950 file:px-3 file:py-2 file:font-semibold file:text-white" /></div></label>;
}
