"use client";

import { Badge } from "@/components/ui/badge";
import { CrudTable, type CrudField } from "@/components/crud/crud-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { createEntity, deleteEntity, updateEntity } from "@/lib/api-client";
import { useRealtimeRefresh } from "@/lib/realtime";
import { createId, formatDateTime } from "@/lib/utils";
import { newcomerFormSchema } from "@/lib/validation/schemas";
import type { NewcomersPageData } from "@/lib/services/app-data";
import type { NewcomerFollowupRecord } from "@/lib/types";

export function NewcomersModule({
  data,
  demoMode,
  permissions,
  churchId,
}: {
  data: NewcomersPageData;
  demoMode: boolean;
  permissions: { create: boolean; update: boolean; delete: boolean };
  churchId: string;
}) {
  useRealtimeRefresh(["newcomer_followups"], "suivis", churchId);

  const fields: CrudField[] = [
    {
      name: "member_id",
      label: "Membre / visiteur",
      type: "select",
      options: data.member_options,
    },
    { name: "date_conversion", label: "Date de conversion", type: "date" },
    { name: "bapteme", label: "Baptême", type: "checkbox", placeholder: "Baptême déjà effectué" },
    { name: "cellule_id", label: "Cellule", type: "select", options: [{ label: "Aucune", value: "" }, ...data.cell_options] },
    {
      name: "responsable_id",
      label: "Responsable",
      type: "select",
      options: [{ label: "Aucun", value: "" }, ...data.responsible_options],
    },
    { name: "prochain_suivi", label: "Prochain suivi", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveaux convertis et visiteurs"
        description="Suivez l’intégration, le rattachement à une cellule, le baptême et les prochaines relances pastorales."
        badge="Module 4"
      />

      <StatGrid stats={data.stats} />

      <CrudTable<
        NewcomerFollowupRecord & {
          membre_nom: string;
          cellule_nom: string | null;
          responsable_nom: string | null;
        }
      >
        title="Suivis d'intégration"
        description="Chaque fiche aide à éviter les pertes entre décision, cellule et suivi pastoral."
        storageKey="gesteglise-newcomers"
        demoMode={demoMode}
        records={data.records}
        fields={fields}
        columns={[
          {
            label: "Personne",
            render: (record) => (
              <div>
                <p className="font-semibold">{record.membre_nom}</p>
                <p className="text-xs text-[var(--muted)]">{record.cellule_nom ?? "Sans cellule"}</p>
              </div>
            ),
          },
          {
            label: "Baptême",
            render: (record) => (
              <Badge tone={record.bapteme ? "success" : "warning"}>
                {record.bapteme ? "Effectué" : "En attente"}
              </Badge>
            ),
          },
          {
            label: "Responsable",
            render: (record) => record.responsable_nom ?? "Non assigné",
          },
          {
            label: "Suivi",
            render: (record) => formatDateTime(record.prochain_suivi),
          },
        ]}
        searchKeys={["membre_nom", "cellule_nom", "responsable_nom", "notes"]}
        filters={[
          {
            name: "bapteme",
            label: "Filtrer par baptême",
            options: [
              { label: "Oui", value: "true" },
              { label: "Non", value: "false" },
            ],
          },
        ]}
        emptyValues={{
          member_id: "",
          date_conversion: "",
          bapteme: false,
          cellule_id: "",
          responsable_id: "",
          prochain_suivi: "",
          notes: "",
        }}
        canCreate={permissions.create}
        canEdit={permissions.update}
        canDelete={permissions.delete}
        onCreate={async (values) => {
          const parsed = newcomerFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              id: createId("followup"),
              ...parsed.data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              membre_nom: data.member_options.find((option) => option.value === parsed.data.member_id)?.label ?? "Nouveau suivi",
              cellule_nom: data.cell_options.find((option) => option.value === parsed.data.cellule_id)?.label ?? null,
              responsable_nom:
                data.responsible_options.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
            };
          }

          const raw = await createEntity<NewcomerFollowupRecord>("newcomers", parsed.data);
          return {
            ...raw,
            membre_nom:
              data.member_options.find((option) => option.value === parsed.data.member_id)?.label ?? "Nouveau suivi",
            cellule_nom: data.cell_options.find((option) => option.value === parsed.data.cellule_id)?.label ?? null,
            responsable_nom:
              data.responsible_options.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
          };
        }}
        onUpdate={async (record, values) => {
          const parsed = newcomerFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              ...record,
              ...parsed.data,
              updated_at: new Date().toISOString(),
              membre_nom: data.member_options.find((option) => option.value === parsed.data.member_id)?.label ?? record.membre_nom,
              cellule_nom: data.cell_options.find((option) => option.value === parsed.data.cellule_id)?.label ?? null,
              responsable_nom:
                data.responsible_options.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
            };
          }

          const raw = await updateEntity<NewcomerFollowupRecord>("newcomers", record.id, parsed.data);
          return {
            ...raw,
            membre_nom:
              data.member_options.find((option) => option.value === parsed.data.member_id)?.label ?? record.membre_nom,
            cellule_nom: data.cell_options.find((option) => option.value === parsed.data.cellule_id)?.label ?? null,
            responsable_nom:
              data.responsible_options.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
          };
        }}
        onDelete={
          permissions.delete
            ? async (record) => {
                if (!demoMode) {
                  await deleteEntity("newcomers", record.id);
                }
              }
            : undefined
        }
      />
    </div>
  );
}
