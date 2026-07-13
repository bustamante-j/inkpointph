import { describe, expect, it } from "vitest";
import { escapeCsvCell } from "./csv";

describe("escapeCsvCell", () => {
  it("quotes commas, line breaks, and double quotes", () => {
    expect(escapeCsvCell('Paper, "A4"')).toBe('"Paper, ""A4"""');
    expect(escapeCsvCell("first\nsecond")).toBe('"first\nsecond"');
  });

  it("neutralizes spreadsheet formulas", () => {
    expect(escapeCsvCell("=HYPERLINK(\"bad\")")).toBe(
      '"\'=HYPERLINK(""bad"")"',
    );
    expect(escapeCsvCell("+1+1")).toBe("'+1+1");
    expect(escapeCsvCell("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");
  });

  it("leaves ordinary values unchanged", () => {
    expect(escapeCsvCell("InkPoint")).toBe("InkPoint");
    expect(escapeCsvCell(15)).toBe("15");
  });
});
