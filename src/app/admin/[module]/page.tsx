import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilterBar } from "@/components/admin/filter-bar";
import { PageHeader } from "@/components/admin/page-header";
import { RecordsTable } from "@/components/admin/records-table";
import { Notice } from "@/components/ui/notice";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchModuleRows, paramsToFilters } from "@/lib/admin/data";
import { getModuleConfig, moduleConfigs } from "@/lib/admin/module-config";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ module: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ModulePage({ params, searchParams }: PageProps) {
  const { module } = await params;
  const query = await searchParams;
  const config = getModuleConfig(module);
  if (!config) notFound();

  if (config.key === "services") {
    return <ServicesAndPackagesPage query={query} />;
  }

  const filters = paramsToFilters(query);
  const data = await fetchModuleRows(config.key, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        action={
          config.creatable
            ? {
                href: `/admin/${config.path}/new`,
                label: `Add ${config.singular}`,
                icon: <Plus className="h-4 w-4" aria-hidden="true" />,
              }
            : undefined
        }
      />
      {!data.configured ? <Notice title="Supabase is not configured" tone="warning">Live {config.title.toLowerCase()} data will load after environment variables and schema are set.</Notice> : null}
      {data.error ? <Notice title={`${config.title} issue`} tone="warning">{data.error}</Notice> : null}
      <FilterBar config={config} filters={filters} />
      <RecordsTable config={config} rows={data.rows} />
    </div>
  );
}

async function ServicesAndPackagesPage({
  query,
}: {
  query: Record<string, string | string[] | undefined>;
}) {
  const filters = paramsToFilters(query);
  const services = await fetchModuleRows("services", filters);
  const packages = await fetchModuleRows("packages", filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services & Packages"
        description="Manage public service offerings, bundled packages, display order, and availability toggles."
        action={{
          href: "/admin/services/new",
          label: "Add Service",
          icon: <Plus className="h-4 w-4" aria-hidden="true" />,
        }}
      />
      {!services.configured ? <Notice title="Supabase is not configured" tone="warning">Public catalog management will activate after the database is connected.</Notice> : null}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-zinc-950">Services</h2>
            <p className="mt-1 text-sm text-zinc-500">{moduleConfigs.services.description}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar config={moduleConfigs.services} filters={filters} />
          <RecordsTable config={moduleConfigs.services} rows={services.rows} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-zinc-950">Packages</h2>
            <p className="mt-1 text-sm text-zinc-500">{moduleConfigs.packages.description}</p>
          </div>
          <Link
            href="/admin/packages/new"
            className="inline-flex h-10 items-center justify-center gap-2 bg-red-900 px-4 text-sm font-semibold text-white hover:bg-red-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Package
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <RecordsTable config={moduleConfigs.packages} rows={packages.rows} />
        </CardContent>
      </Card>
    </div>
  );
}
