import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getCurrentAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getCurrentAdmin();

  if (isSupabaseConfigured() && !user) {
    redirect("/login");
  }

  if (user && !isAdmin) {
    redirect("/?admin=unauthorized");
  }

  return <AdminShell userEmail={user?.email}>{children}</AdminShell>;
}
