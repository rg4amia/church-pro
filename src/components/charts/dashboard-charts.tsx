"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

const COLORS = ["#0f766e", "#2563eb", "#f97316"];

export function DashboardCharts({
  membershipMix,
  attendanceTrend,
}: {
  membershipMix: Array<{ name: string; value: number }>;
  attendanceTrend: Array<{ period: string; cultes: number; cellules: number }>;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_1.35fr]">
      <Card className="h-[360px]">
        <div className="mb-4">
          <h3 className="text-lg font-bold">Répartition des profils</h3>
          <p className="text-sm text-[var(--muted)]">Membres, visiteurs et nouveaux convertis</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={membershipMix} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
              {membershipMix.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]!} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="h-[360px]">
        <div className="mb-4">
          <h3 className="text-lg font-bold">Tendance de présence</h3>
          <p className="text-sm text-[var(--muted)]">Comparatif cultes / cellules</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={attendanceTrend}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="period" stroke="var(--muted)" fontSize={12} />
            <YAxis stroke="var(--muted)" fontSize={12} />
            <Tooltip />
            <Bar dataKey="cultes" fill="#0f766e" radius={[10, 10, 0, 0]} />
            <Bar dataKey="cellules" fill="#2563eb" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
