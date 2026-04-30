"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CrudTable, type CrudField } from "@/components/crud/crud-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { createEntity, deleteEntity, updateEntity } from "@/lib/api-client";
import { useRealtimeRefresh } from "@/lib/realtime";
import { createId, formatDate } from "@/lib/utils";
import { departmentFormSchema } from "@/lib/validation/schemas";
import type { DepartmentsPageData } from "@/lib/services/app-data";
import type { DepartmentRecord } from "@/lib/types";

export function DepartmentsModule({
  data,
  demoMode,
  permissions,
  churchId,
}: {
  data: DepartmentsPageData;
  demoMode: boolean;
  permissions: { create: boolean; update: boolean; delete: boolean };
  churchId: string;
}) {
  useRealtimeRefresh(["departments", "department_activities"], "départements", churchId);

  const fields: CrudField[] = [
    { name: "nom", label: "Nom", type: "text" },
    {
      name: "responsable_id",
      label: "Responsable",
      type: "select",
      options: [{ label: "Aucun", value: "" }, ...data.responsible_options],
    },
    { name: "description", label: "Description", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Départements"
        description="Pilotez les départements, leurs responsables et les activités produites sur la période."
        badge="Module 5"
      />

      <StatGrid stats={data.stats} />

      <CrudTable<DepartmentRecord & { responsable_nom: string | null; activites_total: number }>
        title="Départements"
        description="La structure reste légère pour favoriser le pilotage plutôt que la bureaucratie."
        storageKey="gesteglise-departments"
        demoMode={demoMode}
        records={data.records}
        fields={fields}
        columns={[
          {
            label: "Département",
            render: (record) => (
              <div>
                <p className="font-semibold">{record.nom}</p>
                <p className="text-xs text-[var(--muted)]">{record.description ?? "Sans description"}</p>
              </div>
            ),
          },
          {
            label: "Responsable",
            render: (record) => record.responsable_nom ?? "Non assigné",
          },
          {
            label: "Activités",
            render: (record) => <Badge tone="accent">{record.activites_total}</Badge>,
          },
        ]}
        searchKeys={["nom", "description", "responsable_nom"]}
        emptyValues={{
          nom: "",
          responsable_id: "",
          description: "",
        }}
        canCreate={permissions.create}
        canEdit={permissions.update}
        canDelete={permissions.delete}
        onCreate={async (values) => {
          const parsed = departmentFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              id: createId("department"),
              ...parsed.data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              activites_total: 0,
              responsable_nom:
                data.responsible_options.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
            };
          }

          const raw = await createEntity<DepartmentRecord>("departments", parsed.data);
          return {
            ...raw,
            activites_total: 0,
            responsable_nom:
              data.responsible_options.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
          };
        }}
        onUpdate={async (record, values) => {
          const parsed = departmentFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              ...record,
              ...parsed.data,
              updated_at: new Date().toISOString(),
              responsable_nom:
                data.responsible_options.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
            };
          }

          const raw = await updateEntity<DepartmentRecord>("departments", record.id, parsed.data);
          return {
            ...raw,
            activites_total: record.activites_total,
            responsable_nom:
              data.responsible_options.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
          };
        }}
        onDelete={
          permissions.delete
            ? async (record) => {
                if (!demoMode) {
                  await deleteEntity("departments", record.id);
                }
              }
            : undefined
        }
      />

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Activités récentes</h2>
          <p className="text-sm text-[var(--muted)]">Objectifs et résultats remontés par les départements</p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {data.activities.map((activity) => (
            <div key={activity.id} className="rounded-[24px] border border-[var(--line)] bg-[var(--card-strong)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{activity.departement_nom}</p>
                <Badge tone="accent">{formatDate(activity.date)}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6">{activity.description}</p>
              <p className="mt-3 text-sm text-[var(--muted)]">Objectifs: {activity.objectifs ?? "Non renseignés"}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Résultats: {activity.resultats ?? "En attente"}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
