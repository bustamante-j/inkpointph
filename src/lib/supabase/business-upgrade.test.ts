import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sqlFiles = ["schema.sql", "business-upgrade.sql"].map((file) => ({
  file,
  sql: readFileSync(resolve(process.cwd(), "supabase", file), "utf8"),
}));

describe("business upgrade security contract", () => {
  it("keeps customer order uploads private", () => {
    sqlFiles.forEach(({ sql }) => {
      expect(sql).toMatch(
        /values\s*\(\s*'order-uploads',\s*'order-uploads',\s*false/,
      );
      expect(sql).not.toMatch(
        /create policy "order_uploads_public_(?:read|insert)"/,
      );
    });
  });

  it("prevents users from assigning their own profile role", () => {
    sqlFiles.forEach(({ file, sql }) => {
      if (file === "business-upgrade.sql") {
        expect(sql).toContain(
          "alter table public.profiles alter column role drop default",
        );
      }
      expect(sql).not.toMatch(
        /create policy "profiles_(?:update_own|insert_self)"/,
      );
      expect(sql).toContain('create policy "profiles_owner_all"');
    });
  });

  it("requires admin access for public order management", () => {
    sqlFiles.forEach(({ sql }) => {
      expect(sql).toContain('create policy "online_orders_admin_all"');
      expect(sql).toMatch(
        /online_orders_admin_all[\s\S]*?using \(public\.is_admin\(\)\)/,
      );
    });
  });

  it("publishes only available order form choices", () => {
    sqlFiles.forEach(({ sql }) => {
      expect(sql).toMatch(
        /order_form_options_public_read[\s\S]*?is_available = true or public\.is_admin\(\)/,
      );
    });
  });
});
