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

  return (
    <main className="bg-white text-zinc-950">
      <section className="relative min-h-[84vh] overflow-hidden bg-zinc-950 text-white">
        <Image
          src="/images/inkpoint-hero-generated.png"
          alt="Print shop counter with documents, stickers, photo prints, and printer materials"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,12,0.96),rgba(10,10,12,0.72)_42%,rgba(127,16,23,0.2)_100%)]" />

        <header className="relative z-10 border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center border border-white/15 bg-white p-1.5">
                <Image
                  src="/brand/logo/inkpoint-logo.png"
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-lg font-bold tracking-wide">INKPOINT</span>
            </Link>
            <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 md:flex">
              <a href="#services" className="hover:text-white">Services</a>
              <a href="#products" className="hover:text-white">Products</a>
              <a href="#pricing" className="hover:text-white">Prices</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </nav>
            <ButtonLink href={business.messenger} className="hidden bg-red-900 hover:bg-red-800 sm:inline-flex">
              Messenger
            </ButtonLink>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1fr_21rem] lg:px-8 lg:pb-20 lg:pt-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-200">
              Crystal Cave, Baguio City
            </p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl lg:text-8xl">
              InkPoint Prints & Services
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
              Prints, stickers, photos, and document work handled through one clear Messenger thread.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={business.messenger} className="h-12 bg-red-900 px-6 hover:bg-red-800">
                Message Us
              </ButtonLink>
              <ButtonLink href="#products" variant="secondary" className="h-12 border-white/20 bg-white/5 px-6 text-white hover:border-white hover:text-white">
                View Products
              </ButtonLink>
            </div>
          </div>

          <div className="hidden border-l border-white/10 pl-6 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Fast order flow
            </p>
            <div className="mt-6 grid gap-4">
              {["Send files", "Confirm price", "Pick up"].map((item, index) => (
                <div key={item} className="grid grid-cols-[2rem_1fr] items-center border-b border-white/10 pb-4">
                  <span className="font-black text-red-400">{index + 1}</span>
                  <span className="text-sm font-semibold text-zinc-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section id="services" title="Services">
        <div className="grid gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
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
              <Card key={product.name} className="overflow-hidden border-zinc-300">
                <div className="aspect-[4/3] border-b border-zinc-200 bg-zinc-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-zinc-950">
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
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <span>{product.category ?? "Product"}</span>
                    <span className="text-red-900">
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
        <div className="grid gap-px border border-zinc-200 bg-zinc-200 md:grid-cols-2 xl:grid-cols-4">
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
        <div className="overflow-hidden border border-zinc-300 bg-white">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-950 text-left text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Unit</th>
                <th className="px-4 py-3 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {priceRows.map(([service, unit, price]) => (
                <tr key={service}>
                  <td className="px-4 py-3 font-semibold text-zinc-950">{service}</td>
                  <td className="px-4 py-3 text-zinc-600">{unit}</td>
                  <td className="px-4 py-3 text-red-900">{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="order" title="Order">
        <div className="grid gap-px border border-zinc-200 bg-zinc-200 md:grid-cols-5">
          {orderSteps.map((step, index) => (
            <div key={step} className="bg-white p-5">
              <span className="text-3xl font-black text-red-900">{index + 1}</span>
              <p className="mt-4 text-sm font-semibold leading-6 text-zinc-800">{step}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="faq" title="FAQ">
        <div className="grid gap-3 md:grid-cols-2">
          {faqItems.slice(0, 6).map((item) => (
            <details key={item.question} className="border border-zinc-200 bg-white p-5">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-950">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <section id="contact" className="bg-zinc-950 py-14 text-white sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_18rem] lg:px-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">Ready to print?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
              Send the file, quantity, size, deadline, and pickup details.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={business.messenger} className="bg-red-900 hover:bg-red-800">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Messenger
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" className="border-white/20 bg-transparent text-white hover:border-white hover:text-white">
                Admin
              </ButtonLink>
            </div>
            <dl className="mt-8 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
              <ContactItem label="Location" value={business.location} />
              <ContactItem label="Email" value={business.email} />
              <ContactItem label="Phone" value={business.phone} />
            </dl>
          </div>
          <div className="hidden items-end justify-center border border-white/10 bg-white/5 p-4 lg:flex">
            <Image
              src="/brand/mascot/inkpoint-mascot.png"
              alt="InkPoint printer mascot"
              width={260}
              height={260}
              className="h-56 w-56 object-contain"
            />
          </div>
        </div>
      </section>
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
    <section id={id} className="border-b border-zinc-200 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-5 border-l-4 border-red-900 pl-4">
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-950">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function ContactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-950 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}
