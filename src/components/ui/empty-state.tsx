import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-start gap-3 border-dashed">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      {action}
    </Card>
  );
}
