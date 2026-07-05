import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import {
  business,
  defaultPackages,
  defaultProducts,
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
  const products = catalog.products?.length ? catalog.products : defaultProducts;
  const prices = catalog.prices?.length
    ? catalog.prices
    : priceRows.map(([serviceName, unitLabel, priceLabel], index) => ({
        service_name: serviceName,
        unit_label: unitLabel,
        price_label: priceLabel,
        display_order: index + 1,
      }));

  return (
    <main className="bg-[#fff7ed] text-zinc-950">
      <section className="border-b border-red-900/20 bg-[#fff7ed]">
        <header className="border-b border-red-900/15 bg-[#fff7ed]/95">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/brand/logo/inkpoint-logo.png"
                alt="InkPoint Prints and Services"
                width={112}
                height={72}
                priority
                className="h-16 w-auto object-contain"
              />
            </Link>
            <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.18em] text-red-950 md:flex">
              <a href="#contact-strip" className="hover:text-red-800">Contact</a>
              <a href="#order" className="hover:text-red-800">Order</a>
              <a href="#products" className="hover:text-red-800">Products</a>
              <a href="#pricing" className="hover:text-red-800">Prices</a>
            </nav>
            <ButtonLink href={business.messenger} className="hidden bg-red-900 hover:bg-red-800 sm:inline-flex">
              Messenger
            </ButtonLink>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-900">
              {business.location}
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black uppercase leading-none tracking-tight text-red-950 sm:text-7xl">
              Prints that make a point.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-700">
              Printing, stickers, photos, IDs, documents, and small business materials.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={business.messenger} className="h-12 bg-red-900 px-6 hover:bg-red-800">
                Message Us
              </ButtonLink>
              <ButtonLink href="#order" variant="secondary" className="h-12 border-red-900/30 bg-[#fff7ed] px-6 text-red-950 hover:border-red-900 hover:text-red-900">
                How to Order
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
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,247,237,0.15),rgba(127,16,23,0.1))]" />
          </div>
        </div>
      </section>

      <section id="contact-strip" className="border-b border-red-900/20 bg-white">
        <div className="mx-auto grid max-w-7xl gap-px border-x border-red-900/15 bg-red-900/15 sm:grid-cols-[1fr_1fr] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-900">
              Contact us through
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-red-950">
              <a href={business.messenger} className="inline-flex items-center gap-2 border border-red-900/20 px-3 py-2 hover:border-red-900">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                InkPoint, prints and services
              </a>
              <a href={business.messenger} className="inline-flex items-center gap-2 border border-red-900/20 px-3 py-2 hover:border-red-900">
                <span className="flex h-4 w-4 items-center justify-center bg-red-900 text-[11px] font-black text-white">f</span>
                InkPoint, prints and services
              </a>
            </div>
          </div>
          <div className="bg-red-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100">
              Walk-ins welcome
            </p>
            <p className="mt-3 text-sm leading-6 text-red-50">
              You can directly come to our place. No registration or online order is required.
            </p>
          </div>
        </div>
      </section>

      <Section id="order" title="Order Flow">
        <div className="grid gap-px border border-red-900/15 bg-red-900/15 md:grid-cols-5">
          {orderSteps.map((step, index) => (
            <div key={step} className="bg-white p-5">
              <span className="text-3xl font-black text-red-900">{index + 1}</span>
              <p className="mt-4 text-sm font-semibold leading-6 text-zinc-800">{step}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="services" title="Services">
        <div className="grid gap-px border border-red-900/15 bg-red-900/15 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 8).map((service) => (
            <div key={service.name} className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-900">
                {service.category ?? "Service"}
              </p>
              <h3 className="mt-3 font-semibold text-zinc-950">{service.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                {service.description}
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
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-red-900">
                    <span>{product.category ?? "Product"}</span>
                    <span>
                      {typeof product.starting_price === "number"
                        ? `PHP ${product.starting_price}+`
                        : product.starting_price}
                    </span>
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
                {typeof bundle.starting_price === "number"
                  ? `Starts at PHP ${bundle.starting_price}`
                  : bundle.starting_price}
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

      <Section id="faq" title="FAQ">
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
          <Link href="/login" className="font-semibold text-white underline underline-offset-4">
            Admin Login
          </Link>
        </div>
      </footer>
    </main>
  );
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
    <section id={id} className="border-b border-red-900/15 py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 border-l-4 border-red-900 pl-4">
          <h2 className="text-3xl font-black uppercase tracking-tight text-red-950">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
