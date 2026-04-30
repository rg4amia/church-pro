"use client";

import { Activity, AlertTriangle, CalendarClock, RadioTower, UsersRound } from "lucide-react";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import type { DashboardData } from "@/lib/types";

const iconMap = {
  "Membres actifs": UsersRound,
  "Présence cultes": Activity,
  "Réunions de cellules": CalendarClock,
  "Notifications en attente": RadioTower,
};

export function DashboardModule({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour ${data.viewer.display_name}`}
        description="Vue consolidée de l’église, avec accès piloté par rôle, remontées en temps réel et indicateurs stratégiques prêts pour le terrain."
        badge={data.viewer.is_demo ? "Mode démo interactif" : `Rôle ${data.viewer.role}`}
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {data.metrics.map((metric) => {
          const Icon = iconMap[metric.label as keyof typeof iconMap] ?? Activity;
          return (
            <Card key={metric.label} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                {metric.tone ? <Badge tone={metric.tone}>{metric.tone}</Badge> : null}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[var(--muted)]">{metric.label}</p>
                <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
                <p className="text-sm text-[var(--muted)]">{metric.change}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <DashboardCharts membershipMix={data.membership_mix} attendanceTrend={data.attendance_trend} />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
            <div>
              <h3 className="text-lg font-bold">Alertes prioritaires</h3>
              <p className="text-sm text-[var(--muted)]">Points d’attention pastoraux et opérationnels</p>
            </div>
          </div>
          <div className="grid gap-3">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-[24px] border border-[var(--line)] bg-[var(--card-strong)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold">{alert.title}</h4>
                  <Badge tone={alert.tone}>{alert.tone}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{alert.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-bold">Prochaines actions</h3>
            <p className="text-sm text-[var(--muted)]">Agenda consolidé des équipes et suivis</p>
          </div>
          <div className="grid gap-3">
            {data.upcoming_events.map((event) => (
              <div
                key={event.id}
                className="rounded-[24px] border border-[var(--line)] bg-[var(--card-strong)] p-4"
              >
                <p className="font-semibold">{event.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{event.date}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{event.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
