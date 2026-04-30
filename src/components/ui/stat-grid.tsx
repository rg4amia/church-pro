import { StatCard } from "@/components/ui/stat-card";
import type { PageStat } from "@/lib/types";

export function StatGrid({ stats }: { stats: PageStat[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
