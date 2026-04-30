"use client";

import { toast } from "sonner";
import { ReportsCharts } from "@/components/charts/reports-charts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import type { ReportsPageData } from "@/lib/services/app-data";

async function downloadReport(type: "members" | "services" | "cells" | "inventory" | "sermons", format: "xlsx" | "pdf") {
  const response = await fetch(`/api/reports/export?type=${type}&format=${format}`);
  if (!response.ok) {
    throw new Error("Export impossible");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rapport-${type}.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsModule({ data }: { data: ReportsPageData }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports & statistiques"
        description="Analysez l’évolution des membres, la participation aux cultes, l’activité des cellules et l’impact des prédications."
        badge="Module 7"
        actions={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() =>
                downloadReport("members", "xlsx").catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Export échoué"),
                )
              }
            >
              Export membres Excel
            </Button>
            <Button
              type="button"
              onClick={() =>
                downloadReport("services", "pdf").catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Export échoué"),
                )
              }
            >
              Export cultes PDF
            </Button>
          </>
        }
      />

      <StatGrid stats={data.stats} />

      <ReportsCharts
        attendanceTrend={data.attendanceTrend}
        cellPerformance={data.cellPerformance}
        sermonPerformance={data.sermonPerformance}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {data.memberBreakdown.map((segment) => (
          <Card key={segment.name} className="space-y-2">
            <p className="text-sm text-[var(--muted)]">{segment.name}</p>
            <p className="text-3xl font-bold">{segment.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
