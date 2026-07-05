import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { RecordForm } from "@/components/admin/record-form";
import { Notice } from "@/components/ui/notice";
import { fetchRelationOptions } from "@/lib/admin/data";
import { getModuleConfig } from "@/lib/admin/module-config";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ module: string }>;
};

export default async function NewRecordPage({ params }: PageProps) {
  const { module } = await params;
  const config = getModuleConfig(module);
  if (!config || !config.creatable) notFound();
  const relationOptions = await fetchRelationOptions(config.formFields);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Add ${config.singular}`}
        description={config.description}
      />
      {!isSupabaseConfigured() ? (
        <Notice title="Supabase is not configured" tone="warning">
          Add environment variables before saving records.
        </Notice>
      ) : null}
      <RecordForm config={config} relationOptions={relationOptions} />
    </div>
  );
}
