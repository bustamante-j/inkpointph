"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl border border-rose-700/25 bg-white p-6">
      <AlertTriangle className="h-7 w-7 text-rose-700" />
      <h1 className="mt-4 text-xl font-black text-zinc-950">This action could not be completed.</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{error.message || "Check the saved details and try again."}</p>
      <div className="mt-5 flex gap-3">
        <Button onClick={reset}><RotateCcw className="h-4 w-4" /> Try again</Button>
        <Link href="/admin/dashboard" className="inline-flex h-10 items-center border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800">Dashboard</Link>
      </div>
    </div>
  );
}
