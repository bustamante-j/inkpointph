import type { PublicPriceItem } from "@/types/site";

export type PricingInput = {
  serviceType: string;
  quantity: number;
  pageCount?: number;
  printColor?: string;
  photoSize?: string;
};

export function calculateOrderEstimate(
  input: PricingInput,
  prices: PublicPriceItem[],
) {
  const optionKey = getOptionKey(input);
  const price = prices.find(
    (item) =>
      item.service_name === input.serviceType &&
      (item.option_key === optionKey || (!item.option_key && optionKey === "default")),
  );

  if (!price || price.unit_price === null) return null;

  const quantity = Math.max(1, Number(input.quantity) || 1);
  const pages = ["Printing", "Photocopy"].includes(input.serviceType)
    ? Math.max(1, Number(input.pageCount) || 1)
    : 1;
  const total = roundCurrency(price.unit_price * quantity * pages);

  return {
    optionKey,
    unitPrice: price.unit_price,
    unitLabel: price.unit_label,
    total,
  };
}

function getOptionKey(input: PricingInput) {
  if (["Printing", "Photocopy"].includes(input.serviceType)) {
    return input.printColor || "non_colored";
  }
  if (input.serviceType === "Photo Printing") return input.photoSize || "2x2";
  return "default";
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
