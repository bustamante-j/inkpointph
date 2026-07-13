"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/website", label: "Website Manager" },
    ],
  },
  {
    label: "Orders",
    items: [
      { href: "/admin/online-orders", label: "Online Orders" },
      { href: "/admin/projects", label: "Projects / Orders" },
      { href: "/admin/clients", label: "Clients" },
      { href: "/admin/payments", label: "Payments" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/inventory", label: "Inventory" },
      { href: "/admin/expenses", label: "Expenses" },
      { href: "/admin/reports", label: "Reports" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/services", label: "Services & Packages" },
      { href: "/admin/prices", label: "Prices" },
      { href: "/admin/products", label: "Product Photos" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/logs", label: "Activity Logs" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

export function AdminDesktopNav() {
  const pathname = usePathname();
  return <nav className="flex-1 overflow-y-auto px-3 py-4">{groups.map((group) => <div key={group.label} className="mb-5"><p className="mb-1 px-3 text-[10px] font-black uppercase text-red-300">{group.label}</p><div className="space-y-1">{group.items.map((item) => <NavLink key={item.href} {...item} active={isActive(pathname, item.href)} />)}</div></div>)}</nav>;
}

export function AdminMobileNav() {
  const pathname = usePathname();
  return <details className="relative lg:hidden"><summary className="flex h-10 cursor-pointer list-none items-center gap-2 border border-red-900/20 bg-white px-3 text-sm font-semibold text-red-950"><Menu className="h-4 w-4" /> Menu <ChevronDown className="h-4 w-4" /></summary><div className="absolute right-0 top-12 z-50 max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto border border-red-900/20 bg-white p-3 shadow-xl">{groups.map((group) => <div key={group.label} className="mb-4 last:mb-0"><p className="mb-1 px-2 text-[10px] font-black uppercase text-zinc-400">{group.label}</p>{group.items.map((item) => <Link key={item.href} href={item.href} className={cn("block border-l-4 px-3 py-2 text-sm font-semibold", isActive(pathname, item.href) ? "border-red-900 bg-red-50 text-red-950" : "border-transparent text-zinc-700 hover:bg-zinc-50")}>{item.label}</Link>)}</div>)}</div></details>;
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} className={cn("flex items-center border-l-4 px-3 py-2 text-sm font-medium transition", active ? "border-white bg-red-900 text-white" : "border-transparent text-red-50 hover:border-red-300 hover:bg-red-900")}>{label}</Link>;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
