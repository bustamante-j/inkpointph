import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#fff7ed] px-4 py-10 text-zinc-950">
      <div className="mx-auto w-full max-w-sm border border-red-900/20 bg-white p-5">
        <Link href="/" className="text-sm font-semibold text-red-900">
          Back to website
        </Link>
        <h1 className="mt-8 text-2xl font-semibold">Admin Login</h1>
        <Suspense fallback={<div className="mt-6 h-40 bg-zinc-100" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
