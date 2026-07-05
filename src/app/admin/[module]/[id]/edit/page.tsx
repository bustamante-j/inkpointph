import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { RecordForm } from "@/components/admin/record-form";
import { Notice } from "@/components/ui/notice";
import { fetchRecord, fetchRelationOptions } from "@/lib/admin/data";
import { getModuleConfig } from "@/lib/admin/module-config";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ module: string; id: string }>;
};

export default async function EditRecordPage({ params }: PageProps) {
  const { module, id } = await params;
  const config = getModuleConfig(module);
  if (!config || !config.editable) notFound();

  const [recordResult, relationOptions] = await Promise.all([
    fetchRecord(config.key, id),
    fetchRelationOptions(config.formFields),
  ]);

  if (recordResult.configured && !recordResult.record) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${config.singular}`}
        description={config.description}
      />
      {!recordResult.configured ? <Notice title="Supabase is not configured" tone="warning">Add environment variables before editing records.</Notice> : null}
      {recordResult.error ? <Notice title="Record issue" tone="warning">{recordResult.error}</Notice> : null}
      <RecordForm config={config} record={recordResult.record} relationOptions={relationOptions} />
    </div>
  );
}
