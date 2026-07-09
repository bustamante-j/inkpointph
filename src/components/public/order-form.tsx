"use client";

import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { serviceTypeOptions } from "@/lib/constants";
import { submitOnlineOrderAction } from "@/lib/public/actions";

type OrderFormProps = {
  orderReceived: boolean;
};

const inputClass =
  "mt-1.5 h-11 w-full border border-red-900/20 bg-white px-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-red-900 focus:ring-2 focus:ring-red-900/10";

const fileClass =
  "mt-1.5 w-full border border-red-900/20 bg-white px-3 py-2 text-sm outline-none transition file:mr-3 file:border-0 file:bg-red-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-red-900 focus:border-red-900 focus:ring-2 focus:ring-red-900/10";

export function OnlineOrderForm({ orderReceived }: OrderFormProps) {
  const [serviceType, setServiceType] = useState(serviceTypeOptions[0]);

  const serviceMeta = useMemo(() => getServiceMeta(serviceType), [serviceType]);

  return (
    <form
      action={submitOnlineOrderAction}
      encType="multipart/form-data"
      className="border border-red-900/20 bg-[#fffdf8] p-5 shadow-sm shadow-red-950/5 sm:p-6"
    >
      {orderReceived ? (
        <div className="mb-5 border border-emerald-700/25 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Order received. We will check your details, file, and payment screenshot.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="customer_name" required />
        <Field label="Contact number" name="contact_number" type="tel" required />
        <Field label="Messenger name" name="messenger_name" />
        <Field label="Email" name="email" type="email" />

        <label className="block">
          <span className="text-sm font-semibold text-zinc-800">Service needed *</span>
          <select
            name="service_type"
            required
            value={serviceType}
            onChange={(event) => setServiceType(event.target.value)}
            className={inputClass}
          >
            {serviceTypeOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </label>

        <Field
          label={serviceMeta.quantityLabel}
          name="quantity"
          type="number"
          min="1"
          defaultValue="1"
          required
        />

        {serviceMeta.needsPageCount ? (
          <Field
            label="Number of pages"
            name="page_count"
            type="number"
            min="1"
            defaultValue="1"
            required
          />
        ) : null}

        {serviceMeta.needsColor ? (
          <SelectField
            label="Color option"
            name="print_color"
            required
            options={[
              { value: "non_colored", label: "Non-colored" },
              { value: "colored", label: "Colored" },
            ]}
          />
        ) : null}

        {serviceMeta.needsPaperSize ? (
          <SelectField
            label="Paper size"
            name="paper_size"
            required
            options={[
              { value: "short", label: "Short" },
              { value: "a4", label: "A4" },
              { value: "legal", label: "Legal" },
              { value: "custom", label: "Custom / not sure" },
            ]}
          />
        ) : null}

        {serviceMeta.needsSides ? (
          <SelectField
            label="Print side"
            name="print_sides"
            options={[
              { value: "single_sided", label: "Single-sided" },
              { value: "double_sided", label: "Double-sided" },
            ]}
          />
        ) : null}

        {serviceType === "Photo Printing" ? (
          <SelectField
            label="Photo size"
            name="photo_size"
            required
            options={[
              { value: "2x2", label: "2x2" },
              { value: "3r", label: "3R" },
              { value: "4r", label: "4R" },
              { value: "a4", label: "A4" },
              { value: "custom", label: "Custom / not sure" },
            ]}
          />
        ) : null}

        {serviceType === "Certificate Printing" ? (
          <SelectField
            label="Certificate type"
            name="certificate_type"
            options={[
              { value: "school", label: "School" },
              { value: "event", label: "Event" },
              { value: "recognition", label: "Recognition" },
              { value: "custom", label: "Custom / not sure" },
            ]}
          />
        ) : null}

        <Field label="Needed by" name="needed_by" type="date" />

        <SelectField
          label="Pickup or delivery"
          name="pickup_or_delivery"
          required
          options={[
            { value: "pickup", label: "Pickup" },
            { value: "delivery", label: "Delivery" },
          ]}
        />

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-zinc-800">Upload file(s)</span>
          <input
            name="order_files"
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            className={fileClass}
          />
          <span className="mt-1 block text-xs text-zinc-500">
            Images, PDF, DOC, DOCX, or TXT files are accepted.
          </span>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-zinc-800">
            GCash payment screenshot
          </span>
          <input
            name="payment_screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className={fileClass}
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-zinc-800">Additional details</span>
          <textarea
            name="additional_instructions"
            rows={4}
            placeholder="Add special instructions, preferred paper, layout notes, or delivery details."
            className={`${inputClass} min-h-28 py-3`}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-red-900/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-zinc-600">
          After submitting, InkPoint can mark your order as pending, working on it, or
          ready for pickup.
        </p>
        <SubmitButton pendingText="Sending order..." className="h-11 shrink-0 px-6">
          Submit order
        </SubmitButton>
      </div>
    </form>
  );
}

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

function SelectField({
  label,
  name,
  required,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-800">
        {label}
        {required ? " *" : ""}
      </span>
      <select name={name} required={required} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function getServiceMeta(serviceType: string) {
  if (serviceType === "Photo Printing") {
    return {
      quantityLabel: "Number of photos",
      needsColor: false,
      needsPageCount: false,
      needsPaperSize: false,
      needsSides: false,
    };
  }

  if (serviceType === "Certificate Printing") {
    return {
      quantityLabel: "Number of certificates",
      needsColor: true,
      needsPageCount: false,
      needsPaperSize: true,
      needsSides: false,
    };
  }

  return {
    quantityLabel: serviceType === "Photocopy" ? "Number of copies" : "Number of copies",
    needsColor: true,
    needsPageCount: true,
    needsPaperSize: true,
    needsSides: true,
  };
}
