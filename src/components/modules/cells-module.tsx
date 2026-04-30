"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CrudTable, type CrudField } from "@/components/crud/crud-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { createEntity, deleteEntity, updateEntity } from "@/lib/api-client";
import { useRealtimeRefresh } from "@/lib/realtime";
import { createId, formatDate } from "@/lib/utils";
import { cellFormSchema } from "@/lib/validation/schemas";
import type { CellsPageData } from "@/lib/services/app-data";
import type { PrayerCellRecord } from "@/lib/types";

const fields: CrudField[] = [
  { name: "nom", label: "Nom de la cellule", type: "text", required: true },
  { name: "localisation", label: "Localisation", type: "text", required: true },
  { name: "responsable_id", label: "Responsable", type: "select" },
  {
    name: "jour",
    label: "Jour",
    type: "select",
    options: [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ].map((day) => ({ label: day, value: day })),
  },
  { name: "heure", label: "Heure", type: "time" },
];

export function CellsModule({
  data,
  demoMode,
  permissions,
  churchId,
}: {
  data: CellsPageData;
  demoMode: boolean;
  permissions: { create: boolean; update: boolean; delete: boolean };
  churchId: string;
}) {
  useRealtimeRefresh(["prayer_cells", "cell_meetings"], "cellules", churchId);

  const responsibleOptions = data.records
    .filter((cell) => cell.responsable_id && cell.responsable_nom)
    .map((cell) => ({
      label: cell.responsable_nom ?? "Responsable",
      value: cell.responsable_id ?? "",
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cellules de prière"
        description="Organisation territoriale des cellules, responsables assignés et remontée des réunions avec statistiques de fréquentation."
        badge="Module 2"
      />

      <StatGrid stats={data.stats} />

      <CrudTable<PrayerCellRecord & { responsable_nom: string | null; reunions_total: number }>
        title="Cellules"
        description="Créez et ajustez les cellules, leurs responsables et leurs horaires."
        storageKey="gesteglise-cells"
        demoMode={demoMode}
        records={data.records}
        fields={fields.map((field) =>
          field.name === "responsable_id"
            ? { ...field, options: [{ label: "Aucun", value: "" }, ...responsibleOptions] }
            : field,
        )}
        columns={[
          {
            label: "Cellule",
            render: (record) => (
              <div>
                <p className="font-semibold">{record.nom}</p>
                <p className="text-xs text-[var(--muted)]">{record.localisation}</p>
              </div>
            ),
          },
          {
            label: "Horaire",
            render: (record) => `${record.jour} • ${record.heure}`,
          },
          {
            label: "Responsable",
            render: (record) => record.responsable_nom ?? "Non assigné",
          },
          {
            label: "Réunions",
            render: (record) => (
              <Badge tone="accent">{record.reunions_total} réunion(s)</Badge>
            ),
          },
        ]}
        searchKeys={["nom", "localisation", "jour"]}
        filters={[
          {
            name: "jour",
            label: "Filtrer par jour",
            options: [
              "Lundi",
              "Mardi",
              "Mercredi",
              "Jeudi",
              "Vendredi",
              "Samedi",
              "Dimanche",
            ].map((day) => ({ label: day, value: day })),
          },
        ]}
        emptyValues={{
          nom: "",
          localisation: "",
          responsable_id: "",
          jour: "Mardi",
          heure: "18:30",
        }}
        canCreate={permissions.create}
        canEdit={permissions.update}
        canDelete={permissions.delete}
        note="Les réunions hebdomadaires sont affichées ci-dessous pour garder la saisie cellule et la saisie réunion distinctes."
        onCreate={async (values) => {
          const parsed = cellFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              id: createId("cell"),
              ...parsed.data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              reunions_total: 0,
              responsable_nom:
                responsibleOptions.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
            };
          }

          const raw = await createEntity<PrayerCellRecord>("cells", parsed.data);
          return {
            ...raw,
            reunions_total: 0,
            responsable_nom:
              responsibleOptions.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
          };
        }}
        onUpdate={async (record, values) => {
          const parsed = cellFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              ...record,
              ...parsed.data,
              updated_at: new Date().toISOString(),
              responsable_nom:
                responsibleOptions.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
            };
          }

          const raw = await updateEntity<PrayerCellRecord>("cells", record.id, parsed.data);
          return {
            ...raw,
            reunions_total: record.reunions_total,
            responsable_nom:
              responsibleOptions.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
          };
        }}
        onDelete={
          permissions.delete
            ? async (record) => {
                if (!demoMode) {
                  await deleteEntity("cells", record.id);
                }
              }
            : undefined
        }
      />

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Réunions enregistrées</h2>
          <p className="text-sm text-[var(--muted)]">Derniers comptes-rendus saisis par les responsables</p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {data.meetings.map((meeting) => (
            <div key={meeting.id} className="rounded-[24px] border border-[var(--line)] bg-[var(--card-strong)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{meeting.cellule_nom}</p>
                <Badge tone="accent">{formatDate(meeting.date)}</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{meeting.theme}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[var(--muted)]">
                <p>Hommes: {meeting.nb_hommes}</p>
                <p>Femmes: {meeting.nb_femmes}</p>
                <p>Enfants: {meeting.nb_enfants}</p>
                <p>Visiteurs: {meeting.nb_visiteurs}</p>
              </div>
              {meeting.notes ? <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{meeting.notes}</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
