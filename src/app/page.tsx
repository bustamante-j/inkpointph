import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Search,
} from "lucide-react";
import { OnlineOrderForm } from "@/components/public/order-form";
import { getPublicSiteData } from "@/lib/public/data";
import type { PublicPriceItem, PublicService, SiteListItem, SiteSection } from "@/types/site";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPublicSiteData();
  return {
    title: settings.seo_title || settings.business_name,
    description: settings.seo_description || settings.business_description || undefined,
    openGraph: {
      title: settings.seo_title || settings.business_name,
      description: settings.seo_description || settings.business_description || undefined,
      images: settings.hero_image_url ? [settings.hero_image_url] : undefined,
    },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const data = await getPublicSiteData();
  const { settings } = data;
  const services = data.services as PublicService[];
  const prices = data.prices as PublicPriceItem[];
  const sections = (data.sections as SiteSection[]).filter((section) => section.is_visible);
  const sectionMap = new Map(sections.map((section) => [section.section_key, section]));
  const cssVariables = {
    "--site-primary": settings.primary_color,
    "--site-background": settings.background_color,
  } as CSSProperties;

  const content: Record<string, React.ReactNode> = {
    order: (
      <PublicSection id="online-order" title={sectionMap.get("order")?.title || "Start your order"} tone="white">
        <div className="grid gap-6 xl:grid-cols-[0.68fr_1.32fr]">
          <div className="border-l-4 border-[var(--site-primary)] bg-[#fffaf3] p-5 sm:p-6">
            <p className="text-xs font-black uppercase text-[var(--site-primary)]">Paid online booking</p>
            <h3 className="mt-3 text-2xl font-black leading-tight text-zinc-950">Upload, pay, and keep your order number.</h3>
            <div className="mt-5 space-y-4 text-sm leading-6 text-zinc-600">
              <p>{settings.payment_instructions}</p>
              <p>{settings.walk_in_note}</p>
            </div>
            <Link href="/track-order" className="mt-6 inline-flex h-10 items-center gap-2 border border-red-900/25 bg-white px-4 text-sm font-semibold text-red-950 hover:border-red-900">
              <Search className="h-4 w-4" /> Track an order
            </Link>
          </div>
          <OnlineOrderForm services={services} prices={prices} paymentInstructions={settings.payment_instructions} />
        </div>
      </PublicSection>
    ),
    contact: (
      <PublicSection id="contact" title={sectionMap.get("contact")?.title || "Contact InkPoint"} compact>
        <div className="grid border border-red-900/15 bg-red-900/15 sm:grid-cols-2 xl:grid-cols-4">
          {settings.messenger_url ? <ContactItem icon={<MessageCircle />} label="Messenger" value={settings.facebook_name || "Message InkPoint"} href={settings.messenger_url} /> : null}
          {settings.facebook_url ? <ContactItem icon={<span className="text-sm font-black">f</span>} label="Facebook" value={settings.facebook_name || "InkPoint"} href={settings.facebook_url} /> : null}
          {settings.email ? <ContactItem icon={<Mail />} label="Email" value={settings.email} href={`mailto:${settings.email}`} /> : null}
          {settings.phone ? <ContactItem icon={<Phone />} label="Phone" value={settings.phone} href={`tel:${settings.phone}`} /> : null}
          {settings.hours ? <ContactItem icon={<Clock3 />} label="Hours" value={settings.hours} detail={settings.hours_note} /> : null}
          <ContactItem icon={<MapPin />} label="Location" value={settings.location} detail={settings.address_note} />
        </div>
      </PublicSection>
    ),
    services: (
      <PublicSection id="services" title={sectionMap.get("services")?.title || "Services and prices"} tone="white">
        {services.length ? <div className="grid gap-px border border-red-900/15 bg-red-900/15 md:grid-cols-2">
          {services.map((service) => {
            const servicePrices = prices.filter((price) => price.service_name === service.name);
            return <article key={service.id ?? service.name} className="grid bg-white sm:grid-cols-[11rem_1fr]">
              <div className="relative min-h-48 border-b border-red-900/10 bg-[#fff7ed] sm:border-b-0 sm:border-r">
                <Image src={service.image_url || "/brand/mascot/inkpoint-mascot.png"} alt={service.name} fill sizes="(max-width: 640px) 100vw, 176px" className="object-cover" />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase text-[var(--site-primary)]">{service.category || "Service"}</p>
                <h3 className="mt-2 text-xl font-black text-zinc-950">{service.name}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{service.description}</p>
                <div className="mt-4 divide-y divide-red-900/10 border-y border-red-900/10">
                  {servicePrices.map((price) => <div key={price.id ?? `${price.service_name}-${price.option_key}`} className="flex items-center justify-between gap-4 py-2 text-xs"><span className="text-zinc-600">{price.unit_label}</span><span className="font-black text-red-950">{price.price_label}</span></div>)}
                </div>
              </div>
            </article>;
          })}
        </div> : <EmptyPublic message="Services are being updated. Please message InkPoint for current options." />}
      </PublicSection>
    ),
    products: (
      <PublicSection id="products" title={sectionMap.get("products")?.title || "Print examples"}>
        {data.products.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.products.map((product) => <article key={String(product.id ?? product.name)} className="border border-red-900/15 bg-white">
            <div className="relative aspect-[4/3] border-b border-red-900/10 bg-[#fff7ed]">
              <Image src={String(product.image_url || settings.mascot_url || "/brand/mascot/inkpoint-mascot.png")} alt={String(product.name)} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
            </div>
            <div className="p-4"><h3 className="font-black text-zinc-950">{String(product.name)}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">{String(product.description || "")}</p></div>
          </article>)}
        </div> : <EmptyPublic message="Print examples are being prepared." />}
      </PublicSection>
    ),
    packages: (
      <PublicSection id="packages" title={sectionMap.get("packages")?.title || "Helpful packages"} tone="white">
        {data.packages.length ? <div className="grid gap-px border border-red-900/15 bg-red-900/15 md:grid-cols-2 xl:grid-cols-4">
          {data.packages.map((bundle) => <article key={String(bundle.id ?? bundle.name)} className="bg-white p-5"><PackageCheck className="h-5 w-5 text-[var(--site-primary)]" /><h3 className="mt-4 font-black text-zinc-950">{String(bundle.name)}</h3><p className="mt-2 text-sm leading-6 text-zinc-600">{String(bundle.description || "")}</p><p className="mt-4 border-l-4 border-[var(--site-primary)] pl-3 text-sm font-black text-red-950">Starts at PHP {Number(bundle.starting_price ?? 0).toFixed(2)}</p></article>)}
        </div> : <EmptyPublic message="Packages are being updated." />}
      </PublicSection>
    ),
    process: (
      <PublicSection id="process" title={sectionMap.get("process")?.title || "How it works"}>
        <div className="grid gap-px border border-red-900/15 bg-red-900/15 sm:grid-cols-2 lg:grid-cols-5">
          {(data.steps as SiteListItem[]).map((step, index) => <article key={step.id ?? `${step.title}-${index}`} className="bg-white p-5"><span className="text-3xl font-black text-[var(--site-primary)]">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-5 font-black text-zinc-950">{step.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-600">{step.description}</p></article>)}
        </div>
      </PublicSection>
    ),
    faq: (
      <PublicSection id="faq" title={sectionMap.get("faq")?.title || "Quick answers"} tone="white">
        <div className="grid gap-3 md:grid-cols-2">
          {(data.faqs as SiteListItem[]).map((item, index) => <details key={item.id ?? `${item.question}-${index}`} className="border border-red-900/15 bg-white p-5 open:border-red-900/40"><summary className="cursor-pointer text-sm font-black text-zinc-950">{item.question}</summary><p className="mt-3 text-sm leading-6 text-zinc-600">{item.answer}</p></details>)}
        </div>
      </PublicSection>
    ),
  };

  return (
    <main className="public-site min-h-screen bg-[var(--site-background)] text-zinc-950" style={cssVariables}>
      {settings.announcement ? <div className="bg-[var(--site-primary)] px-4 py-2 text-center text-xs font-semibold text-white">{settings.announcement}</div> : null}
      {query.admin === "unauthorized" ? <div className="border-b border-amber-700/20 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">That account is signed in but does not have owner or admin permission.</div> : null}

      <header className="relative z-20 border-b border-red-900/15 bg-[#fffaf3]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src={settings.logo_url || "/brand/logo/inkpoint-logo.png"} alt={settings.business_name} width={150} height={74} priority className="h-16 w-auto object-contain" />
            <span className="hidden text-sm font-black text-red-950 xl:inline">{settings.business_name}</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-red-950 md:flex">
            <a href="#online-order" className="hover:text-red-700">Order</a>
            <a href="#services" className="hover:text-red-700">Services</a>
            <a href="#contact" className="hover:text-red-700">Contact</a>
            <Link href="/track-order" className="hover:text-red-700">Track</Link>
          </nav>
          {settings.messenger_url ? <a href={settings.messenger_url} className="inline-flex h-10 items-center gap-2 bg-[var(--site-primary)] px-4 text-sm font-semibold text-white hover:brightness-110"><MessageCircle className="h-4 w-4" /><span className="hidden sm:inline">Message us</span></a> : null}
        </div>
      </header>

      <section className="relative flex min-h-[31rem] items-center overflow-hidden border-b border-red-900/15 sm:min-h-[35rem]">
        <Image src={settings.hero_image_url || "/images/inkpoint-hero-bright.png"} alt="InkPoint printing workspace" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,243,0.98)_0%,rgba(255,250,243,0.93)_38%,rgba(255,250,243,0.25)_72%,rgba(255,250,243,0.04)_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase text-[var(--site-primary)]">{settings.hero_eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-red-950 sm:text-6xl">{settings.hero_title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-700">{settings.hero_description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#online-order" className="inline-flex h-12 items-center justify-center gap-2 bg-[var(--site-primary)] px-6 text-sm font-black text-white hover:brightness-110">Book an order <ArrowRight className="h-4 w-4" /></a>
              <Link href="/track-order" className="inline-flex h-12 items-center justify-center gap-2 border border-red-900/30 bg-white/90 px-6 text-sm font-black text-red-950 hover:border-red-900"><Search className="h-4 w-4" /> Track order</Link>
            </div>
            <p className="mt-5 text-sm font-semibold text-zinc-700">{settings.walk_in_note}</p>
          </div>
        </div>
      </section>

      {sections.sort((a, b) => a.display_order - b.display_order).map((section) => <div key={section.section_key}>{content[section.section_key] ?? null}</div>)}

      <footer className="border-t border-red-900/20 bg-red-950 py-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div><p className="font-black">{settings.business_name}</p><p className="mt-2 text-sm text-red-100">{settings.motto}</p></div>
          <div className="text-sm text-red-100"><p>{settings.location}</p>{settings.hours ? <p className="mt-2">{settings.hours}</p> : null}</div>
          <div className="flex flex-col items-start gap-2 text-sm"><Link href="/track-order" className="font-semibold hover:underline">Track an order</Link><Link href="/login" className="text-red-200 hover:text-white">Owner login</Link></div>
        </div>
      </footer>
    </main>
  );
}

function PublicSection({ id, title, children, tone, compact = false }: { id: string; title: string; children: React.ReactNode; tone?: "white"; compact?: boolean }) {
  return <section id={id} className={`border-b border-red-900/15 ${tone === "white" ? "bg-white" : "bg-[var(--site-background)]"} ${compact ? "py-9" : "py-12 sm:py-16"}`}><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-6 flex items-center gap-4"><span className="h-8 w-1 bg-[var(--site-primary)]" /><h2 className="text-2xl font-black text-red-950 sm:text-3xl">{title}</h2></div>{children}</div></section>;
}

function ContactItem({ icon, label, value, detail, href }: { icon: React.ReactNode; label: string; value: string; detail?: string | null; href?: string }) {
  const body = <><span className="flex h-9 w-9 shrink-0 items-center justify-center bg-red-950 text-white [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span><span className="block text-xs font-semibold uppercase text-red-800">{label}</span><span className="mt-1 block text-sm font-black text-zinc-950">{value}</span>{detail ? <span className="mt-1 block text-xs leading-5 text-zinc-500">{detail}</span> : null}</span></>;
  return href ? <a href={href} className="flex gap-3 border-b border-r border-red-900/10 bg-white p-4 hover:bg-red-50">{body}</a> : <div className="flex gap-3 border-b border-r border-red-900/10 bg-white p-4">{body}</div>;
}

function EmptyPublic({ message }: { message: string }) {
  return <div className="border border-dashed border-red-900/25 bg-[#fffaf3] p-6 text-sm font-semibold text-zinc-600">{message}</div>;
}
