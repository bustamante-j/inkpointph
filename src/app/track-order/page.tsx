import { TrackingForm } from "@/app/track-order/tracking-form";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrackOrderPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const order = Array.isArray(query.order) ? query.order[0] : query.order;
  return <main className="min-h-screen bg-[#fff7ed] px-4 py-10 text-zinc-950 sm:px-6"><TrackingForm initialOrderNumber={order ?? ""} /></main>;
}
