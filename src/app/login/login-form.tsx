"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const redirectTo = searchParams.get("redirectTo") || "/admin/dashboard";
  const supabase = createSupabaseBrowserClient();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase environment variables are not configured yet.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    startTransition(() => {
      router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-zinc-800">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-900/10"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-800">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-900/10"
        />
      </label>
      {error ? (
        <div className="flex gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
