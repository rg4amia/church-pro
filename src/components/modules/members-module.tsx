"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CrudTable, type CrudField } from "@/components/crud/crud-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { createEntity, deleteEntity, updateEntity } from "@/lib/api-client";
import { useRealtimeRefresh } from "@/lib/realtime";
import { createId } from "@/lib/utils";
import { memberFormSchema } from "@/lib/validation/schemas";
import type { MemberRecord } from "@/lib/types";
import type { MembersPageData } from "@/lib/services/app-data";

const fields: CrudField[] = [
  { name: "nom", label: "Nom", type: "text", required: true },
  { name: "prenom", label: "Prénom", type: "text", required: true },
  { name: "telephone", label: "Téléphone", type: "tel", required: true },
  { name: "email", label: "Email", type: "email" },
  { name: "adresse", label: "Adresse", type: "text" },
  { name: "date_naissance", label: "Date de naissance", type: "date" },
  {
    name: "statut",
    label: "Statut",
    type: "select",
    options: [
      { label: "Membre", value: "membre" },
      { label: "Visiteur", value: "visiteur" },
      { label: "Nouveau converti", value: "nouveau_converti" },
    ],
  },
  { name: "quartier", label: "Quartier", type: "text" },
  { name: "responsable_id", label: "Responsable", type: "select" },
  { name: "joined_at", label: "Date d'adhésion", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export function MembersModule({
  data,
  demoMode,
  permissions,
  churchId,
}: {
  data: MembersPageData;
  demoMode: boolean;
  permissions: { create: boolean; update: boolean; delete: boolean };
  churchId: string;
}) {
  useRealtimeRefresh(["members", "member_participations"], "membres", churchId);

  const responsibleOptions = data.records.map((member) => ({
    label: `${member.prenom} ${member.nom}`,
    value: member.id,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membres"
        description="Gestion complète des profils membres, visiteurs et nouveaux convertis avec historique de participation et rattachement aux responsables."
        badge="Module 1"
      />

      <StatGrid stats={data.stats} />

      <CrudTable<MemberRecord & { responsable_nom: string | null; participation_total: number }>
        title="Annuaire pastoral"
        description="Chaque fiche centralise identité, rattachement et suivi."
        storageKey="gesteglise-members"
        demoMode={demoMode}
        records={data.records}
        fields={fields.map((field) =>
          field.name === "responsable_id"
            ? { ...field, options: [{ label: "Aucun", value: "" }, ...responsibleOptions] }
            : field,
        )}
        columns={[
          {
            label: "Membre",
            render: (record) => (
              <div>
                <p className="font-semibold">{record.prenom} {record.nom}</p>
                <p className="text-xs text-[var(--muted)]">{record.quartier ?? "Quartier non renseigné"}</p>
              </div>
            ),
          },
          {
            label: "Contact",
            render: (record) => (
              <div>
                <p>{record.telephone}</p>
                <p className="text-xs text-[var(--muted)]">{record.email ?? "Email absent"}</p>
              </div>
            ),
          },
          {
            label: "Statut",
            render: (record) => (
              <Badge tone={record.statut === "membre" ? "success" : record.statut === "visiteur" ? "warning" : "accent"}>
                {record.statut}
              </Badge>
            ),
          },
          {
            label: "Responsable",
            render: (record) => record.responsable_nom ?? "Non assigné",
          },
          {
            label: "Participation",
            render: (record) => (
              <div>
                <p className="font-semibold">{record.participation_total}</p>
                <p className="text-xs text-[var(--muted)]">occurrence(s)</p>
              </div>
            ),
          },
        ]}
        searchKeys={["nom", "prenom", "telephone", "email", "quartier"]}
        filters={[
          {
            name: "statut",
            label: "Filtrer par statut",
            options: [
              { label: "Membre", value: "membre" },
              { label: "Visiteur", value: "visiteur" },
              { label: "Nouveau converti", value: "nouveau_converti" },
            ],
          },
        ]}
        emptyValues={{
          nom: "",
          prenom: "",
          telephone: "",
          email: "",
          adresse: "",
          date_naissance: "",
          statut: "membre",
          quartier: "",
          responsable_id: "",
          joined_at: "",
          notes: "",
        }}
        note={
          demoMode
            ? "Mode démonstration: les actions CRUD sont persistées localement dans votre navigateur."
            : "Mode connecté: les créations et mises à jour sont envoyées vers Supabase via l’API Next.js."
        }
        canCreate={permissions.create}
        canEdit={permissions.update}
        canDelete={permissions.delete}
        onCreate={async (values) => {
          const parsed = memberFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              id: createId("member"),
              ...parsed.data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              participation_total: 0,
              responsable_nom:
                responsibleOptions.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
            };
          }

          const raw = await createEntity<MemberRecord>("members", parsed.data);
          return {
            ...raw,
            participation_total: 0,
            responsable_nom:
              responsibleOptions.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
          };
        }}
        onUpdate={async (record, values) => {
          const parsed = memberFormSchema.safeParse(values);
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

          const raw = await updateEntity<MemberRecord>("members", record.id, parsed.data);
          return {
            ...raw,
            participation_total: record.participation_total,
            responsable_nom:
              responsibleOptions.find((option) => option.value === parsed.data.responsable_id)?.label ?? null,
          };
        }}
        onDelete={
          permissions.delete
            ? async (record) => {
                if (!demoMode) {
                  await deleteEntity("members", record.id);
                }
              }
            : undefined
        }
      />

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Historique récent de participation</h2>
          <p className="text-sm text-[var(--muted)]">Suivi synthétique des présences enregistrées</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {data.participation_feed.map((entry) => (
            <div key={entry.id} className="rounded-[24px] border border-[var(--line)] bg-[var(--card-strong)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{entry.membre}</p>
                <Badge tone="accent">{entry.source}</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{entry.date}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{entry.detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
