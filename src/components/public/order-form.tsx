"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileUp, ShieldCheck } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  submitOnlineOrderAction,
  type OnlineOrderState,
} from "@/lib/public/actions";
import { calculateOrderEstimate } from "@/lib/public/pricing";
import type { PublicPriceItem, PublicService } from "@/types/site";

const initialState: OnlineOrderState = { status: "idle", message: "" };
const inputClass =
  "mt-1.5 h-11 w-full border border-red-900/20 bg-white px-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-red-900 focus:ring-2 focus:ring-red-900/10";
const fileClass =
  "mt-1.5 w-full border border-red-900/20 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:border-0 file:bg-red-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-red-900";

export function OnlineOrderForm({
  services,
  prices,
  paymentInstructions,
}: {
  services: PublicService[];
  prices: PublicPriceItem[];
  paymentInstructions?: string | null;
}) {
  const [state, action] = useActionState(submitOnlineOrderAction, initialState);
  const [serviceType, setServiceType] = useState(services[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [printColor, setPrintColor] = useState("non_colored");
  const [photoSize, setPhotoSize] = useState("2x2");
  const [delivery, setDelivery] = useState("pickup");

  const service = useMemo(
    () => services.find((item) => item.name === serviceType) ?? services[0],
    [serviceType, services],
  );
  const photoSizes = useMemo(
    () => prices.filter((price) => price.service_name === serviceType && price.option_key),
    [prices, serviceType],
  );
  const estimate = useMemo(
    () => calculateOrderEstimate(
      { serviceType, quantity, pageCount, printColor, photoSize },
      prices,
    ),
    [serviceType, quantity, pageCount, printColor, photoSize, prices],
  );

  if (!service) {
    return <div className="border border-amber-700/25 bg-amber-50 p-5 text-sm text-amber-900">Online ordering will open after at least one service and price are published.</div>;
  }

  if (state.status === "success") {
    return (
      <div className="border border-emerald-700/25 bg-emerald-50 p-6" aria-live="polite">
        <CheckCircle2 className="h-8 w-8 text-emerald-700" />
        <h3 className="mt-4 text-2xl font-black text-emerald-950">Your order is in.</h3>
        <p className="mt-2 text-sm leading-6 text-emerald-900">{state.message}</p>
        <div className="mt-5 border border-emerald-800/20 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-emerald-700">Order number</p>
          <p className="mt-1 text-2xl font-black text-zinc-950">{state.orderNumber}</p>
        </div>
        <Link href={`/track-order?order=${encodeURIComponent(state.orderNumber ?? "")}`} className="mt-5 inline-flex h-11 items-center bg-red-950 px-5 text-sm font-semibold text-white hover:bg-red-900">
          Track this order
        </Link>
      </div>
    );
  }

  return (
    <form action={action} encType="multipart/form-data" className="border border-red-900/20 bg-[#fffdf8] p-5 shadow-sm shadow-red-950/5 sm:p-6">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {state.status === "error" ? <div className="mb-5 border border-rose-700/25 bg-rose-50 p-4 text-sm font-semibold text-rose-800" aria-live="polite">{state.message}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="customer_name" required />
        <Field label="Contact number" name="contact_number" type="tel" required />
        <Field label="Messenger name" name="messenger_name" />
        <Field label="Email" name="email" type="email" />

        <SelectField label="Service needed" name="service_type" required value={serviceType} onChange={setServiceType} options={services.map((item) => ({ value: item.name, label: item.name }))} />
        <Field label={service.quantity_label || "Quantity"} name="quantity" type="number" min="1" defaultValue="1" required onNumberChange={setQuantity} />

        {service.requires_page_count ? <Field label="Number of pages" name="page_count" type="number" min="1" defaultValue="1" required onNumberChange={setPageCount} /> : null}
        {service.allows_color ? <SelectField label="Color option" name="print_color" required value={printColor} onChange={setPrintColor} options={[{ value: "non_colored", label: "Non-colored" }, { value: "colored", label: "Colored" }]} /> : null}
        {service.requires_paper_size ? <SelectField label="Paper size" name="paper_size" required options={[{ value: "short", label: "Short" }, { value: "a4", label: "A4" }, { value: "legal", label: "Long / Legal" }, { value: "custom", label: "Custom / not sure" }]} /> : null}
        {service.allows_sides ? <SelectField label="Print sides" name="print_sides" required options={[{ value: "single_sided", label: "Single-sided" }, { value: "double_sided", label: "Double-sided" }]} /> : null}
        {service.allows_photo_size ? <SelectField label="Photo size" name="photo_size" required value={photoSize} onChange={setPhotoSize} options={photoSizes.length ? photoSizes.map((item) => ({ value: item.option_key ?? "default", label: `${item.unit_label} - ${item.price_label}` })) : [{ value: "2x2", label: "2x2" }, { value: "4r", label: "4R" }, { value: "5r", label: "5R" }]} /> : null}
        {service.allows_certificate_type ? <SelectField label="Certificate type" name="certificate_type" required options={[{ value: "ready_to_print", label: "Ready-to-print file" }, { value: "needs_name_edit", label: "Needs name editing" }, { value: "needs_layout", label: "Needs layout help" }]} /> : null}

        <Field label="Needed by" name="needed_by" type="date" min={new Date().toISOString().slice(0, 10)} />
        <SelectField label="Pickup or delivery" name="pickup_or_delivery" required value={delivery} onChange={setDelivery} options={[{ value: "pickup", label: "Pickup" }, { value: "delivery", label: "Delivery" }]} />
        {delivery === "delivery" ? <Field label="Delivery address / landmark" name="delivery_address" required /> : null}

        <label className="flex min-h-11 items-center gap-3 border border-red-900/15 bg-white px-3 text-sm font-semibold text-zinc-800">
          <input name="is_rush" type="checkbox" className="h-4 w-4 accent-red-900" /> Rush order
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-zinc-800">Upload order file(s) *</span>
          <input name="order_files" type="file" multiple required accept="image/*,.pdf,.doc,.docx,.txt" className={fileClass} />
          <span className="mt-1 block text-xs leading-5 text-zinc-500">Up to 5 files. Each file can be up to 15 MB. Images, PDF, DOC, DOCX, and TXT are accepted.</span>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-zinc-800">GCash payment screenshot *</span>
          <input name="payment_screenshot" type="file" required accept="image/png,image/jpeg,image/webp,image/gif" className={fileClass} />
          <span className="mt-1 block text-xs leading-5 text-zinc-500">{paymentInstructions || "Attach the screenshot that matches the calculated total."}</span>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-zinc-800">Additional details</span>
          <textarea name="additional_instructions" rows={4} placeholder="Layout notes, preferred paper, delivery details, or other instructions." className={`${inputClass} min-h-28 py-3`} />
        </label>
      </div>

      <div className="mt-5 grid gap-4 border-y border-red-900/10 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-red-800">Calculated total</p>
          <p className="mt-1 text-3xl font-black text-red-950">{estimate ? `PHP ${estimate.total.toFixed(2)}` : "Price unavailable"}</p>
          {estimate ? <p className="mt-1 text-xs text-zinc-500">{estimate.unitLabel} at PHP {estimate.unitPrice.toFixed(2)}</p> : null}
        </div>
        <FileUp className="hidden h-8 w-8 text-red-900 sm:block" />
      </div>

      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-zinc-600">
        <input name="privacy_consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-red-900" />
        <span>I confirm that I may share these files with InkPoint for this order. Files and payment proof are stored privately and used only to complete the order.</span>
      </label>

      <div className="mt-5 flex flex-col gap-3 border-t border-red-900/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600"><ShieldCheck className="h-4 w-4 text-emerald-700" /> Private file storage</p>
        <SubmitButton pendingText="Uploading and sending..." disabled={!estimate} className="h-11 shrink-0 px-6">Submit paid order</SubmitButton>
      </div>
    </form>
  );
}

function Field({ label, name, type = "text", required, min, defaultValue, onNumberChange }: { label: string; name: string; type?: string; required?: boolean; min?: string; defaultValue?: string; onNumberChange?: (value: number) => void }) {
  return <label className="block"><span className="text-sm font-semibold text-zinc-800">{label}{required ? " *" : ""}</span><input name={name} type={type} min={min} required={required} defaultValue={defaultValue} onChange={onNumberChange ? (event) => onNumberChange(Number(event.target.value)) : undefined} className={inputClass} /></label>;
}

function SelectField({ label, name, required, options, value, onChange }: { label: string; name: string; required?: boolean; options: { value: string; label: string }[]; value?: string; onChange?: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-semibold text-zinc-800">{label}{required ? " *" : ""}</span><select name={name} required={required} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} defaultValue={value === undefined ? options[0]?.value : undefined} className={inputClass}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
