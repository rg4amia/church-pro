"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

export function ReportsCharts({
  attendanceTrend,
  cellPerformance,
  sermonPerformance,
}: {
  attendanceTrend: Array<{ period: string; cultes: number; cellules: number }>;
  cellPerformance: Array<{ cellule: string; participants: number; visiteurs: number }>;
  sermonPerformance: Array<{ titre: string; predicateur: string; diffusion: number }>;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="h-[360px]">
          <div className="mb-4">
            <h3 className="text-lg font-bold">Participation cultes / cellules</h3>
            <p className="text-sm text-[var(--muted)]">Vision consolidée des 4 derniers relevés</p>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceTrend}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="period" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="cultes" fill="#0f766e" radius={[10, 10, 0, 0]} />
              <Bar dataKey="cellules" fill="#f97316" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="h-[360px]">
          <div className="mb-4">
            <h3 className="text-lg font-bold">Performance des cellules</h3>
            <p className="text-sm text-[var(--muted)]">Participants et visiteurs par cellule</p>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cellPerformance}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="cellule" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="participants" fill="#2563eb" radius={[10, 10, 0, 0]} />
              <Bar dataKey="visiteurs" fill="#0f766e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="h-[360px]">
        <div className="mb-4">
          <h3 className="text-lg font-bold">Diffusion des prédications</h3>
            <p className="text-sm text-[var(--muted)]">Mesure illustrative de la diffusion vidéo</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sermonPerformance}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="titre" stroke="var(--muted)" fontSize={12} />
            <YAxis stroke="var(--muted)" fontSize={12} />
            <Tooltip />
            <Bar dataKey="diffusion" fill="#0f766e" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
