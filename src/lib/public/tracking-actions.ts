"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AnyRecord } from "@/types/database";

export type TrackingState = {
  status: "idle" | "error" | "success";
  message: string;
  order?: AnyRecord;
};

export async function lookupOrderAction(
  _previousState: TrackingState,
  formData: FormData,
): Promise<TrackingState> {
  const parsed = z.object({
    order_number: z.string().trim().min(8, "Enter your complete order number."),
    contact_last_four: z.string().regex(/^\d{4}$/, "Enter the last 4 digits of your contact number."),
  }).safeParse({
    order_number: formData.get("order_number"),
    contact_last_four: formData.get("contact_last_four"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the details." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Order tracking is not configured yet." };

  const { data, error } = await supabase.rpc("lookup_online_order", {
    requested_order_number: parsed.data.order_number,
    contact_last_four: parsed.data.contact_last_four,
  });
  const order = Array.isArray(data) ? data[0] : null;

  if (error || !order) {
    return {
      status: "error",
      message: "No matching order was found. Check the order number and contact digits.",
    };
  }

  return { status: "success", message: "Order found.", order };
}
