import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: {
  title: string;
  description: string;
  badge?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="space-y-3">
        {badge ? <Badge tone="accent">{badge}</Badge> : null}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
