"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const orderSchema = z.object({
  customer_name: z.string().trim().min(2, "Name is required."),
  contact_number: z.string().trim().min(3, "Contact number is required."),
  messenger_name: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  service_type: z.string().trim().min(1, "Choose a service."),
  order_details: z.string().trim().min(10, "Please add order details."),
  quantity: z.coerce.number().min(1).default(1),
  needed_by: z.string().trim().optional(),
  pickup_or_delivery: z.enum(["pickup", "delivery"]),
  payment_method: z.enum(["gcash", "cash", "other"]),
  payment_reference: z.string().trim().min(1, "Payment reference is required."),
  payment_note: z.string().trim().optional(),
});

export async function submitOnlineOrderAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Online orders are not available yet. Supabase is not configured.");
  }

  const payload = orderSchema.parse({
    customer_name: formData.get("customer_name"),
    contact_number: formData.get("contact_number"),
    messenger_name: formData.get("messenger_name"),
    email: formData.get("email"),
    service_type: formData.get("service_type"),
    order_details: formData.get("order_details"),
    quantity: formData.get("quantity"),
    needed_by: formData.get("needed_by"),
    pickup_or_delivery: formData.get("pickup_or_delivery"),
    payment_method: formData.get("payment_method"),
    payment_reference: formData.get("payment_reference"),
    payment_note: formData.get("payment_note"),
  });

  const { error } = await supabase.from("online_orders").insert({
    ...payload,
    contact_number: payload.contact_number || null,
    messenger_name: payload.messenger_name || null,
    email: payload.email || null,
    needed_by: payload.needed_by || null,
    payment_note: payload.payment_note || null,
  });

  if (error) throw new Error(error.message);

  redirect("/?order=received#online-order");
}
