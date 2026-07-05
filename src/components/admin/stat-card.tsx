import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: React.ReactNode;
  tone?: "default" | "red" | "dark";
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
          {detail ? <p className="mt-1 text-xs text-zinc-500">{detail}</p> : null}
        </div>
        {icon ? (
          <div
            className={cn(
              "rounded-md p-2",
              tone === "red" && "bg-red-50 text-red-900",
              tone === "dark" && "bg-zinc-950 text-white",
              tone === "default" && "bg-zinc-100 text-zinc-700",
            )}
          >
            {icon}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
