"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const ADMIN_PIN = "5696";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createSupabaseBrowserClient();

  function onPinSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const pin = String(formData.get("pin") ?? "");

    if (pin !== ADMIN_PIN) {
      setError("Incorrect PIN.");
      return;
    }

    setPinUnlocked(true);
  }

  async function onLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!supabase) {
      setError("Supabase is not configured yet.");
      setIsSubmitting(false);
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
      setIsSubmitting(false);
      return;
    }

    const redirectTo = searchParams.get("redirectTo");
    const destination = redirectTo?.startsWith("/admin")
      ? redirectTo
      : "/admin/dashboard";

    window.location.assign(destination);
  }

  if (!pinUnlocked) {
    return (
      <form onSubmit={onPinSubmit} className="mt-6 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-zinc-800">Admin PIN</span>
          <input
            name="pin"
            type="password"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            className="mt-1 h-10 w-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-red-900"
          />
        </label>
        {error ? <p className="text-sm text-red-800">{error}</p> : null}
        <button className="h-10 w-full border border-red-900 bg-red-900 px-4 text-sm font-semibold text-white">
          Continue
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onLoginSubmit} className="mt-6 space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-zinc-800">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 h-10 w-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-red-900"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-800">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 h-10 w-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-red-900"
        />
      </label>
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      <button
        className="h-10 w-full border border-red-900 bg-red-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
