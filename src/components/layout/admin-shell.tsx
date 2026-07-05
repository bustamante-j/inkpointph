import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  FileClock,
  Home,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";
import { logoutAction } from "@/lib/admin/actions";
import { business } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/projects", label: "Projects / Orders", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/expenses", label: "Expenses", icon: ReceiptText },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/services", label: "Services & Packages", icon: PackageOpen },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/logs", label: "Activity Logs", icon: FileClock },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-zinc-200 p-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-900 text-sm font-bold text-white">
              IP
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950">{business.name}</p>
              <p className="text-xs text-zinc-500">{business.location}</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-red-900",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-200 p-3">
          <Link
            href="/"
            className="mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Public website
          </Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-red-900">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </form>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link href="/admin/dashboard" className="flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900 text-xs font-bold text-white">
                IP
              </div>
              <span className="text-sm font-semibold">{business.name}</span>
            </Link>
            <div className="hidden text-sm text-zinc-500 lg:block">{business.motto}</div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm text-zinc-500 sm:inline">
                {userEmail ?? "Admin"}
              </span>
              <Link
                href="/admin/logout"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:border-red-900 hover:text-red-900"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </Link>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-zinc-100 px-4 py-2 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
