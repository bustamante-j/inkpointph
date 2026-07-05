import { ButtonLink } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string; icon?: React.ReactNode };
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-zinc-600">{description}</p> : null}
      </div>
      {action ? (
        <ButtonLink href={action.href} className="shrink-0">
          {action.icon}
          {action.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
