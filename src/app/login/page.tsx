import Link from "next/link";
import { Suspense } from "react";
import { Printer } from "lucide-react";
import { business } from "@/lib/constants";
import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-zinc-100 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-950/10">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-red-900 text-white">
              <Printer className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold text-zinc-950">{business.name}</span>
              <span className="block text-sm text-zinc-500">{business.location}</span>
            </span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Admin login</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Sign in with the owner account created in Supabase Auth.
          </p>
          <Suspense fallback={<div className="mt-6 h-44 rounded-md bg-zinc-100" />}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
      <section className="hidden border-l border-zinc-200 bg-zinc-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">
            Admin management
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight">
            Orders, payments, supplies, and logs in one focused workspace.
          </h2>
        </div>
        <div className="grid gap-3 text-sm text-zinc-300">
          <p>Customers use Messenger. The owner uses this dashboard.</p>
          <p>No public customer accounts. No public file uploads.</p>
          <p>Private business records stay behind Supabase Auth and RLS.</p>
        </div>
      </section>
    </main>
  );
}
