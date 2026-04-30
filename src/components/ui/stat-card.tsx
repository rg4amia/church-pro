import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PageStat } from "@/lib/types";

export function StatCard({ stat }: { stat: PageStat }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--muted)]">{stat.label}</p>
        {stat.tone ? <Badge tone={stat.tone}>{stat.tone}</Badge> : null}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
        <p className="text-sm text-[var(--muted)]">{stat.helper}</p>
      </div>
    </Card>
  );
}
