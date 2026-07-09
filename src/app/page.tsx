import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OnlineOrderForm } from "@/components/public/order-form";
import { getPublicCatalog } from "@/lib/admin/data";
import {
  business,
  defaultPackages,
  defaultProducts,
  defaultServices,
  faqItems,
  orderSteps,
  priceRows,
  publicServiceNames,
} from "@/lib/constants";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const orderReceived = query.order === "received";
  const catalog = await getPublicCatalog();
  const catalogServices =
    catalog.services?.filter((service) => publicServiceNames.includes(service.name)) ?? [];
  const catalogProducts =
    catalog.products?.filter((product) =>
      defaultProducts.some((fallback) => fallback.name === product.name),
    ) ?? [];
  const catalogPackages =
    catalog.packages?.filter((bundle) =>
      defaultPackages.some((fallback) => fallback.name === bundle.name),
    ) ?? [];
  const catalogPrices =
    catalog.prices?.filter((row) => publicServiceNames.includes(row.service_name)) ?? [];

  const services =
    catalogServices.length >= defaultServices.length ? catalogServices : defaultServices;
  const packages =
    catalogPackages.length >= defaultPackages.length ? catalogPackages : defaultPackages;
  const products =
    catalogProducts.length >= defaultProducts.length ? catalogProducts : defaultProducts;
  const prices = catalogPrices.length >= priceRows.length
    ? catalogPrices
    : priceRows.map(([serviceName, unitLabel, priceLabel], index) => ({
        service_name: serviceName,
        unit_label: unitLabel,
        price_label: priceLabel,
        display_order: index + 1,
      }));

  return (
    <main className="bg-[#fff7ed] text-zinc-950">
      <section className="border-b border-red-900/15 bg-[#fff7ed]">
        <header className="border-b border-red-900/15 bg-[#fff7ed]/95">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/brand/logo/inkpoint-logo.png"
                alt="InkPoint Prints and Services"
                width={132}
                height={82}
                priority
                className="h-20 w-auto object-contain"
              />
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-semibold text-red-950 md:flex">
              <a href="#online-order" className="hover:text-red-800">
                Order
              </a>
              <a href="#contact-strip" className="hover:text-red-800">
                Contact
              </a>
              <a href="#products" className="hover:text-red-800">
                Products
              </a>
              <a href="#pricing" className="hover:text-red-800">
                Prices
              </a>
            </nav>
            <ButtonLink
              href={business.messenger}
              className="hidden bg-red-900 hover:bg-red-800 sm:inline-flex"
            >
              Message us
            </ButtonLink>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:py-14">
          <div>
            <p className="text-sm font-semibold text-red-900">{business.location}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-red-950 sm:text-6xl">
              Printing help for school, work, and small business needs.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-700">
              Upload your file, choose the right print options, attach your GCash screenshot,
              then pick up or arrange delivery when it is ready.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#online-order" className="h-12 bg-red-900 px-6 hover:bg-red-800">
                Book an order
              </ButtonLink>
              <ButtonLink
                href={business.messenger}
                variant="secondary"
                className="h-12 border-red-900/25 bg-white px-6 text-red-950 hover:border-red-900"
              >
                Ask on Messenger
              </ButtonLink>
            </div>
          </div>

          <div className="relative min-h-[21rem] overflow-hidden border border-red-900/20 bg-white shadow-xl shadow-red-950/10 sm:min-h-[28rem]">
            <Image
              src="/images/inkpoint-hero-generated.png"
              alt="Print shop materials on a counter"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,247,237,0.18),rgba(127,16,23,0.08))]" />
          </div>
        </div>
      </section>

      <section id="online-order" className="border-b border-red-900/15 bg-white py-10 sm:py-12">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div className="border border-red-900/15 bg-[#fff7ed] p-5 sm:p-6">
            <p className="text-sm font-semibold text-red-900">Online booking</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-red-950">
              Book your order here.
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-6 text-zinc-700">
              <p>Online orders are payment-first.</p>
              <p>You can upload your files directly here.</p>
              <p>Walk-ins are still welcome. No registration or online order is needed.</p>
            </div>
            <div className="mt-6 border-l-4 border-red-900 bg-white p-4 text-sm leading-6 text-zinc-700">
              Attach your GCash screenshot if you already paid. If you need confirmation
              first, message us before submitting.
            </div>
          </div>

          <OnlineOrderForm orderReceived={orderReceived} />
        </div>
      </section>

      <section id="contact-strip" className="border-b border-red-900/20 bg-white">
        <div className="mx-auto grid max-w-7xl gap-px border-x border-red-900/15 bg-red-900/15 md:grid-cols-2 xl:grid-cols-5">
          <InfoBox title="Messenger">
            <a href={business.messenger} className="inline-flex items-center gap-2 font-semibold text-red-950 hover:text-red-800">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {business.facebookName}
            </a>
          </InfoBox>
          <InfoBox title="Facebook">
            <a href={business.facebook} className="inline-flex items-center gap-2 font-semibold text-red-950 hover:text-red-800">
              <span className="flex h-4 w-4 items-center justify-center bg-red-900 text-[11px] font-black text-white">f</span>
              {business.facebookName}
            </a>
          </InfoBox>
          <InfoBox title="Hours">
            <p className="font-semibold text-zinc-950">{business.hours}</p>
            <p className="mt-1 text-xs text-zinc-500">{business.hoursNote}</p>
          </InfoBox>
          <InfoBox title="Location">
            <p className="font-semibold text-zinc-950">{business.location}</p>
            <p className="mt-1 text-xs text-zinc-500">{business.addressNote}</p>
          </InfoBox>
          <InfoBox title="Email">
            <a href={`mailto:${business.email}`} className="font-semibold text-red-950 hover:text-red-800">
              {business.email}
            </a>
          </InfoBox>
        </div>
      </section>

      <Section id="order" title="How orders move">
        <div className="grid gap-px border border-red-900/15 bg-red-900/15 md:grid-cols-5">
          {orderSteps.map((step, index) => (
            <div key={step} className="bg-white p-5">
              <span className="text-3xl font-black text-red-900">{index + 1}</span>
              <p className="mt-4 text-sm font-semibold leading-6 text-zinc-800">{step}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="prepare" title="Before you submit">
        <div className="grid gap-px border border-red-900/15 bg-red-900/15 md:grid-cols-4">
          {[
            ["Upload", "Attach your document, image, PDF, or certificate file if ready."],
            ["Choose", "Select pages, copies, paper size, and color when the service needs it."],
            ["Pay", "Online orders are payment-first. Add your GCash screenshot when paid."],
            ["Receive", "Pick up at the shop or arrange delivery after the order is ready."],
          ].map(([title, copy]) => (
            <div key={title} className="bg-white p-5">
              <p className="text-sm font-black text-red-950">{title}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="services" title="Services">
        <div className="grid gap-px border border-red-900/15 bg-red-900/15 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 8).map((service) => (
            <div key={service.name} className="bg-white p-5">
              <p className="text-xs font-semibold text-red-900">{service.category ?? "Service"}</p>
              <h3 className="mt-3 font-semibold text-zinc-950">{service.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                {service.description}
              </p>
              <p className="mt-4 border-l-4 border-red-900 pl-3 text-sm font-semibold text-red-950">
                {formatCatalogPrice(service.name, service.starting_price)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="products" title="Products">
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => {
            const imageUrl =
              typeof product.image_url === "string" && product.image_url
                ? product.image_url
                : "";

            return (
              <Card key={product.name} className="overflow-hidden border-red-900/15 bg-white">
                <div className="aspect-[4/3] border-b border-red-900/15 bg-[#fff7ed]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#fff7ed]">
                      <Image
                        src="/brand/mascot/inkpoint-mascot.png"
                        alt=""
                        width={220}
                        height={220}
                        className="h-40 w-40 object-contain"
                      />
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-red-900">
                    <span>{product.category ?? "Product"}</span>
                    <span>{formatCatalogPrice(product.name, product.starting_price)}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-zinc-950">{product.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section id="packages" title="Packages">
        <div className="grid gap-px border border-red-900/15 bg-red-900/15 md:grid-cols-2 xl:grid-cols-4">
          {packages.slice(0, 8).map((bundle) => (
            <div key={bundle.name} className="bg-white p-5">
              <h3 className="font-semibold text-zinc-950">{bundle.name}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-600">{bundle.description}</p>
              <p className="mt-4 border-l-4 border-red-900 pl-3 text-sm font-semibold text-zinc-800">
                {formatCatalogPrice(bundle.name, bundle.starting_price)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="pricing" title="Prices">
        <div className="overflow-hidden border border-red-900/20 bg-white">
          <table className="min-w-full divide-y divide-red-900/10 text-sm">
            <thead className="bg-red-950 text-left text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Unit</th>
                <th className="px-4 py-3 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/10">
              {prices.map((row) => (
                <tr key={`${row.service_name}-${row.unit_label}`}>
                  <td className="px-4 py-3 font-semibold text-zinc-950">{row.service_name}</td>
                  <td className="px-4 py-3 text-zinc-600">{row.unit_label}</td>
                  <td className="px-4 py-3 text-red-900">{row.price_label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="faq" title="Quick answers">
        <div className="grid gap-3 md:grid-cols-2">
          {faqItems.slice(0, 6).map((item) => (
            <details key={item.question} className="border border-red-900/15 bg-white p-5">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-950">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <footer className="border-t border-red-900/20 bg-red-950 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm sm:px-6 lg:px-8">
          <p className="font-semibold">{business.name}</p>
          <p className="text-red-100">{business.location}</p>
          <p className="text-red-100">{business.hours}</p>
          <Link href="/login" className="font-semibold text-white underline underline-offset-4">
            Admin Login
          </Link>
        </div>
      </footer>
    </main>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-5">
      <p className="mb-3 text-xs font-semibold text-red-900">{title}</p>
      <div className="text-sm leading-6 text-zinc-700">{children}</div>
    </div>
  );
}

function formatCatalogPrice(name: string, value: unknown) {
  const knownPrices: Record<string, string> = {
    "Certificate Printing": "PHP 15/certificate",
    Certificates: "PHP 15/certificate",
    "Certificate Set": "PHP 15/certificate",
    "Colored Output Pack": "Starts at PHP 5/page",
    Photocopies: "Starts at PHP 3/page",
    Photocopy: "Starts at PHP 3/page",
    "Photo Print Set": "PHP 50-100/photo",
    "Photo Printing": "PHP 50-100/photo",
    "Photo Prints": "PHP 50-100/photo",
    "Printed Documents": "Starts at PHP 5/page",
    Printing: "Starts at PHP 5/page",
    "Student Document Pack": "Starts at PHP 3/page",
  };

  if (knownPrices[name]) return knownPrices[name];
  if (typeof value === "number") return `Starts at PHP ${value}`;
  return value === null || value === undefined || value === "" ? "Price to follow" : String(value);
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-b border-red-900/15 py-11 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-l-4 border-red-900 pl-4">
          <h2 className="text-3xl font-black tracking-tight text-red-950">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
