import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicCatalog } from "@/lib/admin/data";
import {
  business,
  defaultPackages,
  defaultProducts,
  defaultServices,
  faqItems,
  orderSteps,
  priceRows,
  serviceTypeOptions,
} from "@/lib/constants";
import { submitOnlineOrderAction } from "@/lib/public/actions";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const orderReceived = query.order === "received";
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
              Send your details online, pay first for online orders, then pick up or arrange
              delivery when it is ready.
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
              <p>Send files through Messenger after submitting this form.</p>
              <p>Walk-ins are still welcome. No registration or online order is needed.</p>
            </div>
            <div className="mt-6 border-l-4 border-red-900 bg-white p-4 text-sm leading-6 text-zinc-700">
              GCash details are to follow. If you need confirmation before paying, message us first.
            </div>
          </div>

          <form
            action={submitOnlineOrderAction}
            className="border border-red-900/20 bg-[#fffdf8] p-5 shadow-sm shadow-red-950/5 sm:p-6"
          >
            {orderReceived ? (
              <div className="mb-5 border border-emerald-700/25 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                Order received. We will check the payment/reference and message you for updates.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" name="customer_name" required />
              <Field label="Contact number" name="contact_number" type="tel" required />
              <Field label="Messenger name" name="messenger_name" />
              <Field label="Email" name="email" type="email" />

              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">Service needed *</span>
                <select name="service_type" required className={inputClass}>
                  <option value="">Choose a service</option>
                  {serviceTypeOptions.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>

              <Field label="Quantity" name="quantity" type="number" min="1" defaultValue="1" required />
              <Field label="Needed by" name="needed_by" type="date" />

              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">Pickup or delivery *</span>
                <select name="pickup_or_delivery" required className={inputClass}>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">Payment method *</span>
                <select name="payment_method" required className={inputClass}>
                  <option value="gcash">GCash</option>
                  <option value="other">Other confirmed payment</option>
                </select>
              </label>

              <Field
                label="Payment reference"
                name="payment_reference"
                placeholder="GCash reference number or confirmation note"
                required
              />

              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-zinc-800">Order details *</span>
                <textarea
                  name="order_details"
                  required
                  rows={5}
                  placeholder="Size, color, number of pages, paper type, sticker details, deadline, or other instructions."
                  className={`${inputClass} min-h-32 py-3`}
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-zinc-800">Payment note</span>
                <textarea
                  name="payment_note"
                  rows={3}
                  placeholder="Optional notes about payment or pickup/delivery."
                  className={`${inputClass} min-h-24 py-3`}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-red-900/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-zinc-600">
                Status can be updated by InkPoint as pending, working on it, or ready for pickup.
              </p>
              <SubmitButton pendingText="Sending order..." className="h-11 shrink-0 px-6">
                Submit order
              </SubmitButton>
            </div>
          </form>
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

      <Section id="services" title="Services">
        <div className="grid gap-px border border-red-900/15 bg-red-900/15 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 8).map((service) => (
            <div key={service.name} className="bg-white p-5">
              <p className="text-xs font-semibold text-red-900">{service.category ?? "Service"}</p>
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
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-red-900">
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

const inputClass =
  "mt-1.5 h-11 w-full border border-red-900/20 bg-white px-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-red-900 focus:ring-2 focus:ring-red-900/10";

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  min,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-800">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        min={min}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </label>
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
