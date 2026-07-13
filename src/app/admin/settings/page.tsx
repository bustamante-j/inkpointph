import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ButtonLink } from "@/components/ui/button";
import { isServiceRoleConfigured, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Security, database, deployment, and backup status for the owner."
      />
      {!isSupabaseConfigured() ? (
        <Notice title="Supabase is not configured" tone="warning">
          Create `.env.local` from `.env.example`, then add your project URL and anon key.
        </Notice>
      ) : (
        <Notice title="Supabase environment detected" tone="success">
          Admin routes can use Supabase Auth, RLS policies, and live tables.
        </Notice>
      )}
      {!isServiceRoleConfigured() ? (
        <Notice title="Secure order key is missing" tone="warning">
          Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel and your local environment. Keep it server-only.
        </Notice>
      ) : (
        <Notice title="Secure public order service detected" tone="success">
          Public order inserts and private uploads can use the server-only credential.
        </Notice>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-950">Website content</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-zinc-600">Business information, hero media, contact links, sections, order steps, and FAQs now live in the Website Manager.</p>
            <ButtonLink href="/admin/website">Open Website Manager</ButtonLink>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-950">Admin security checklist</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-700">
            {[
              "Use Supabase Auth for the owner account.",
              "Keep public email sign-up disabled.",
              "Create profile roles only through the Supabase SQL editor.",
              "Keep the service role key off the browser.",
              "Run business-upgrade.sql before accepting orders.",
              "Download a JSON backup regularly from Reports.",
              "Review Activity Logs after sensitive changes.",
            ].map((item) => (
              <div key={item} className="flex gap-3 border border-zinc-100 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-red-900" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
