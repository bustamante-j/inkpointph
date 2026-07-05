import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "warning";
  title: string;
  children?: React.ReactNode;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex gap-3 border p-4 text-sm",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
        tone === "info" && "border-zinc-200 bg-zinc-50 text-zinc-700",
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title}</p>
        {children ? <div className="mt-1 text-sm opacity-85">{children}</div> : null}
      </div>
    </div>
  );
}
