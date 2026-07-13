import Link from "next/link";
import Image from "next/image";
import { Home, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/admin/actions";
import { business } from "@/lib/constants";
import { AdminDesktopNav, AdminMobileNav } from "@/components/layout/admin-nav";

export function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  return (
    <div className="min-h-screen bg-[#fff7ed] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-red-950 bg-red-950 text-white lg:flex lg:flex-col">
        <div className="border-b border-red-900/60 p-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center bg-white/95 p-1">
              <Image
                src="/brand/logo/inkpoint-logo.png"
                alt=""
                width={72}
                height={72}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">{business.name}</p>
              <p className="text-xs text-red-100">{business.location}</p>
            </div>
          </Link>
        </div>
        <AdminDesktopNav />
        <div className="border-t border-red-900/60 p-3">
          <Link
            href="/"
            className="mb-2 flex items-center gap-3 border border-transparent px-3 py-2 text-sm font-medium text-red-100 hover:border-red-200 hover:text-white"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Public website
          </Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-3 border border-transparent px-3 py-2 text-sm font-medium text-red-100 hover:border-red-200 hover:text-white">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </form>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-red-900/15 bg-[#fff7ed]/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link href="/admin/dashboard" className="flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center bg-white p-1">
                <Image
                  src="/brand/logo/inkpoint-logo.png"
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm font-semibold">{business.name}</span>
            </Link>
            <div className="hidden text-sm text-red-900 lg:block">{business.motto}</div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm text-zinc-500 sm:inline">
                {userEmail ?? "Admin"}
              </span>
              <Link
                href="/admin/logout"
                className="inline-flex h-9 items-center gap-2 border border-red-900/20 px-3 text-sm font-medium text-red-950 hover:border-red-900 hover:text-red-900"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </Link>
              <AdminMobileNav />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
