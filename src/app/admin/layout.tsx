import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getCurrentUser, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (isSupabaseConfigured() && !user) {
    redirect("/login");
  }

  return <AdminShell userEmail={user?.email}>{children}</AdminShell>;
}
