import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { business } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const settings = [
  ["Business name", business.name],
  ["Location", business.location],
  ["Motto", business.motto],
  ["Website", business.website],
  ["Email", business.email],
  ["Phone", business.phone],
  ["Messenger", business.messenger],
  ["Payments", "Cash and GCash accepted"],
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Business profile, environment status, and deployment notes for the admin owner."
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
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-950">Business profile</h2>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              {settings.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                  <dt className="text-sm font-medium text-zinc-500">{label}</dt>
                  <dd className="text-right text-sm font-semibold text-zinc-950">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-950">Admin security checklist</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-700">
            {[
              "Use Supabase Auth for the owner account.",
              "Create a matching profile row with role owner or admin.",
              "Keep the service role key off the browser.",
              "Run the schema policies before adding private business data.",
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
