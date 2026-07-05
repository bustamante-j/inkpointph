import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { business } from "@/lib/constants";
import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-zinc-100 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md border border-zinc-300 bg-white p-6 shadow-xl shadow-zinc-950/10">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center border border-zinc-200 bg-white p-1.5">
              <Image
                src="/brand/logo/inkpoint-logo.png"
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
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
          <Suspense fallback={<div className="mt-6 h-44 bg-zinc-100" />}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
      <section className="hidden border-l border-zinc-800 bg-zinc-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">
            Admin management
          </p>
          <h2 className="mt-4 max-w-xl text-5xl font-black uppercase leading-none tracking-tight">
            Control the shop from one workspace.
          </h2>
        </div>
        <div className="grid gap-px border border-white/10 bg-white/10 text-sm text-zinc-300">
          {["Orders", "Payments", "Inventory", "Products"].map((item) => (
            <p key={item} className="bg-zinc-950 p-4 font-semibold text-white">
              {item}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
