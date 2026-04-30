"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CrudTable, type CrudField } from "@/components/crud/crud-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { createEntity, deleteEntity, updateEntity } from "@/lib/api-client";
import { useRealtimeRefresh } from "@/lib/realtime";
import { createId, formatDate, formatNumber } from "@/lib/utils";
import { serviceFormSchema } from "@/lib/validation/schemas";
import type { ServicesPageData } from "@/lib/services/app-data";
import type { WorshipServiceRecord } from "@/lib/types";

const fields: CrudField[] = [
  { name: "date", label: "Date", type: "date" },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "Semaine", value: "semaine" },
      { label: "Dimanche", value: "dimanche" },
      { label: "École du dimanche", value: "ecole_du_dimanche" },
    ],
  },
  { name: "predicateur", label: "Prédicateur", type: "text" },
  { name: "theme", label: "Thème", type: "text" },
  { name: "nb_hommes", label: "Hommes", type: "number", min: 0 },
  { name: "nb_femmes", label: "Femmes", type: "number", min: 0 },
  { name: "nb_enfants", label: "Enfants", type: "number", min: 0 },
  { name: "nb_visiteurs", label: "Visiteurs", type: "number", min: 0 },
  { name: "audio_url", label: "URL audio", type: "url" },
];

export function ServicesModule({
  data,
  demoMode,
  permissions,
  churchId,
}: {
  data: ServicesPageData;
  demoMode: boolean;
  permissions: { create: boolean; update: boolean; delete: boolean };
  churchId: string;
}) {
  useRealtimeRefresh(["worship_services"], "cultes", churchId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cultes"
        description="Suivi des cultes de semaine, du dimanche et de l’école du dimanche, avec fréquentation, thèmes et ressources audio."
        badge="Module 3"
      />

      <StatGrid stats={data.stats} />

      <CrudTable<WorshipServiceRecord>
        title="Registre des cultes"
        description="Les volumes de participation alimentent automatiquement les rapports."
        storageKey="gesteglise-services"
        demoMode={demoMode}
        records={data.records}
        fields={fields}
        columns={[
          {
            label: "Date / type",
            render: (record) => (
              <div>
                <p className="font-semibold">{formatDate(record.date)}</p>
                <p className="text-xs text-[var(--muted)]">{record.type}</p>
              </div>
            ),
          },
          {
            label: "Prédication",
            render: (record) => (
              <div>
                <p className="font-semibold">{record.theme}</p>
                <p className="text-xs text-[var(--muted)]">{record.predicateur}</p>
              </div>
            ),
          },
          {
            label: "Visiteurs",
            render: (record) => <Badge tone="warning">{record.nb_visiteurs}</Badge>,
          },
          {
            label: "Total",
            render: (record) =>
              formatNumber(record.nb_hommes + record.nb_femmes + record.nb_enfants + record.nb_visiteurs),
          },
        ]}
        searchKeys={["type", "predicateur", "theme", "date"]}
        filters={[
          {
            name: "type",
            label: "Filtrer par type",
            options: [
              { label: "Semaine", value: "semaine" },
              { label: "Dimanche", value: "dimanche" },
              { label: "École du dimanche", value: "ecole_du_dimanche" },
            ],
          },
        ]}
        emptyValues={{
          date: "",
          type: "dimanche",
          predicateur: "",
          theme: "",
          nb_hommes: 0,
          nb_femmes: 0,
          nb_enfants: 0,
          nb_visiteurs: 0,
          audio_url: "",
        }}
        canCreate={permissions.create}
        canEdit={permissions.update}
        canDelete={permissions.delete}
        onCreate={async (values) => {
          const parsed = serviceFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              id: createId("service"),
              ...parsed.data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }

          return createEntity<WorshipServiceRecord>("services", parsed.data);
        }}
        onUpdate={async (record, values) => {
          const parsed = serviceFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              ...record,
              ...parsed.data,
              updated_at: new Date().toISOString(),
            };
          }

          return updateEntity<WorshipServiceRecord>("services", record.id, parsed.data);
        }}
        onDelete={
          permissions.delete
            ? async (record) => {
                if (!demoMode) {
                  await deleteEntity("services", record.id);
                }
              }
            : undefined
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {data.total_attendance.map((item) => (
          <Card key={item.label} className="space-y-2">
            <p className="text-sm text-[var(--muted)]">{item.label}</p>
            <p className="text-3xl font-bold">{formatNumber(item.value)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
