import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  business,
  defaultPackages,
  defaultServices,
  faqItems,
  orderSteps,
  priceRows,
} from "@/lib/constants";
import { getPublicCatalog } from "@/lib/admin/data";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const catalog = await getPublicCatalog();
  const services = catalog.services?.length ? catalog.services : defaultServices;
  const packages = catalog.packages?.length ? catalog.packages : defaultPackages;

  return (
    <main className="bg-white text-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-900 text-sm font-bold text-white">
              IP
            </span>
            <span>
              <span className="block text-sm font-semibold">{business.name}</span>
              <span className="block text-xs text-zinc-500">{business.location}</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
            <a href="#services" className="hover:text-red-900">
              Services
            </a>
            <a href="#packages" className="hover:text-red-900">
              Packages
            </a>
            <a href="#pricing" className="hover:text-red-900">
              Prices
            </a>
            <a href="#contact" className="hover:text-red-900">
              Contact
            </a>
          </nav>
          <ButtonLink href={business.messenger} variant="primary" className="hidden sm:inline-flex">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Messenger
          </ButtonLink>
        </div>
      </header>

      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-900">
              {business.location}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              {business.name}
            </h1>
            <p className="mt-4 text-xl font-medium text-red-900">{business.motto}</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
              {business.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={business.messenger} className="h-11">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Message Us on Messenger
              </ButtonLink>
              <ButtonLink href="#services" variant="secondary" className="h-11">
                View Services
              </ButtonLink>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-zinc-600 sm:grid-cols-3">
              {["Messenger orders", "Cash or GCash", "Local pickup"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-900" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl shadow-zinc-950/10">
            <Image
              src="/images/inkpoint-hero.png"
              alt="Printed documents, sticker sheets, paper samples, and a desktop printer on a clean print shop counter"
              width={1792}
              height={1024}
              priority
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <Section id="services" title="Services" intro="Practical print, document, sticker, and photo services for everyday needs.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.name}>
              <CardContent>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-900">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-zinc-950">{service.name}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="packages" title="Packages" intro="Sample bundles for common student, job seeker, and small business requests.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {packages.map((bundle) => (
            <Card key={bundle.name}>
              <CardContent>
                <Sparkles className="mb-4 h-5 w-5 text-red-900" aria-hidden="true" />
                <h3 className="font-semibold text-zinc-950">{bundle.name}</h3>
                <p className="mt-2 min-h-16 text-sm leading-6 text-zinc-600">
                  {bundle.description}
                </p>
                <p className="mt-4 rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-800">
                  {typeof bundle.starting_price === "number"
                    ? `Starts at PHP ${bundle.starting_price}`
                    : bundle.starting_price}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="pricing" title="Price List" intro="Placeholder prices for planning. Final totals are confirmed through Messenger.">
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm shadow-zinc-950/5">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-950 text-left text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Unit</th>
                <th className="px-4 py-3 font-semibold">Placeholder price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {priceRows.map(([service, unit, price]) => (
                <tr key={service}>
                  <td className="px-4 py-3 font-medium text-zinc-950">{service}</td>
                  <td className="px-4 py-3 text-zinc-600">{unit}</td>
                  <td className="px-4 py-3 text-zinc-600">{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
          Final prices may vary depending on file type, quantity, paper type,
          material, and editing needs.
        </p>
      </Section>

      <Section id="how-to-order" title="How to Order" intro="Orders stay simple and personal through Messenger.">
        <div className="grid gap-4 md:grid-cols-5">
          {orderSteps.map((step, index) => (
            <Card key={step}>
              <CardContent>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-medium leading-6 text-zinc-800">{step}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-950">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>No direct file upload on this website. Files are accepted through Messenger only.</p>
        </div>
      </Section>

      <Section id="faq" title="FAQ" intro="Quick answers before you send your order details.">
        <div className="grid gap-3 md:grid-cols-2">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5"
            >
              <summary className="cursor-pointer text-sm font-semibold text-zinc-950">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section id="contact" title="Contact" intro="Send order details through Messenger, then wait for confirmation before pickup.">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <ContactItem icon={<MapPin />} label="Location" value={business.location} />
              <ContactItem icon={<MessageCircle />} label="Messenger" value="m.me/yourpage" />
              <ContactItem icon={<Mail />} label="Email" value={business.email} />
              <ContactItem icon={<Phone />} label="Phone" value={business.phone} />
              <ContactItem icon={<CreditCard />} label="Payment" value="Cash and GCash accepted" />
              <ContactItem icon={<FileText />} label="Website" value="yourwebsite.com" />
            </CardContent>
          </Card>
          <div className="rounded-lg bg-zinc-950 p-6 text-white">
            <h3 className="text-xl font-semibold">{business.motto}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              For faster pricing, send your file, quantity, paper or material preference,
              deadline, and pickup details in one Messenger thread.
            </p>
            <ButtonLink href={business.messenger} className="mt-6 bg-white text-zinc-950 hover:bg-zinc-100">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Message Us on Messenger
            </ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  );
}

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-b border-zinc-200 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-900 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        <span className="mt-1 block text-sm font-medium text-zinc-900">{value}</span>
      </span>
    </div>
  );
}
