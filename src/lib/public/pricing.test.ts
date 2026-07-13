import { describe, expect, it } from "vitest";
import { defaultPriceItems } from "../constants";
import { calculateOrderEstimate } from "./pricing";
import type { PublicPriceItem } from "../../types/site";

const prices = defaultPriceItems as PublicPriceItem[];

describe("calculateOrderEstimate", () => {
  it("calculates non-colored printing by copies and pages", () => {
    expect(
      calculateOrderEstimate(
        {
          serviceType: "Printing",
          quantity: 2,
          pageCount: 8,
          printColor: "non_colored",
        },
        prices,
      ),
    ).toMatchObject({ optionKey: "non_colored", unitPrice: 5, total: 80 });
  });

  it("calculates colored photocopies by copies and pages", () => {
    expect(
      calculateOrderEstimate(
        {
          serviceType: "Photocopy",
          quantity: 3,
          pageCount: 4,
          printColor: "colored",
        },
        prices,
      )?.total,
    ).toBe(60);
  });

  it("uses the selected photo size price", () => {
    expect(
      calculateOrderEstimate(
        { serviceType: "Photo Printing", quantity: 3, photoSize: "5r" },
        prices,
      )?.total,
    ).toBe(300);
  });

  it("uses the certificate default price", () => {
    expect(
      calculateOrderEstimate(
        { serviceType: "Certificate Printing", quantity: 12 },
        prices,
      )?.total,
    ).toBe(180);
  });

  it("returns null when no calculator price is published", () => {
    expect(
      calculateOrderEstimate(
        { serviceType: "Printing", quantity: 1, printColor: "special" },
        prices,
      ),
    ).toBeNull();
  });
});
