"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CrudTable, type CrudField } from "@/components/crud/crud-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { createEntity, deleteEntity, updateEntity } from "@/lib/api-client";
import { useRealtimeRefresh } from "@/lib/realtime";
import { createId, formatCurrency, formatDateTime } from "@/lib/utils";
import { inventoryFormSchema } from "@/lib/validation/schemas";
import type { InventoryPageData } from "@/lib/services/app-data";
import type { InventoryItemRecord } from "@/lib/types";

export function InventoryModule({
  data,
  demoMode,
  permissions,
  churchId,
}: {
  data: InventoryPageData;
  demoMode: boolean;
  permissions: { create: boolean; update: boolean; delete: boolean };
  churchId: string;
}) {
  useRealtimeRefresh(["inventory_items", "inventory_movements"], "inventaire", churchId);

  const fields: CrudField[] = [
    { name: "nom", label: "Nom du bien", type: "text" },
    { name: "categorie", label: "Catégorie", type: "text" },
    {
      name: "etat",
      label: "État",
      type: "select",
      options: [
        { label: "Bon", value: "bon" },
        { label: "Panne", value: "panne" },
        { label: "Réparation", value: "reparation" },
      ],
    },
    { name: "localisation", label: "Localisation", type: "text" },
    { name: "date_achat", label: "Date d'achat", type: "date" },
    { name: "cout", label: "Coût", type: "number", min: 0, step: 1000 },
    { name: "quantite", label: "Quantité", type: "number", min: 1, step: 1 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaire"
        description="Suivi du parc matériel, de son état et des mouvements techniques ou logistiques."
        badge="Module 6"
      />

      <StatGrid stats={data.stats} />

      <CrudTable<InventoryItemRecord>
        title="Biens"
        description="Un inventaire léger mais exploitable par les équipes terrain."
        storageKey="gesteglise-inventory"
        demoMode={demoMode}
        records={data.records}
        fields={fields}
        columns={[
          {
            label: "Bien",
            render: (record) => (
              <div>
                <p className="font-semibold">{record.nom}</p>
                <p className="text-xs text-[var(--muted)]">{record.categorie}</p>
              </div>
            ),
          },
          {
            label: "État",
            render: (record) => (
              <Badge tone={record.etat === "bon" ? "success" : record.etat === "panne" ? "danger" : "warning"}>
                {record.etat}
              </Badge>
            ),
          },
          {
            label: "Localisation",
            render: (record) => record.localisation,
          },
          {
            label: "Valeur",
            render: (record) => formatCurrency(record.cout),
          },
        ]}
        searchKeys={["nom", "categorie", "localisation", "etat"]}
        filters={[
          {
            name: "etat",
            label: "Filtrer par état",
            options: [
              { label: "Bon", value: "bon" },
              { label: "Panne", value: "panne" },
              { label: "Réparation", value: "reparation" },
            ],
          },
        ]}
        emptyValues={{
          nom: "",
          categorie: "",
          etat: "bon",
          localisation: "",
          date_achat: "",
          cout: 0,
          quantite: 1,
        }}
        canCreate={permissions.create}
        canEdit={permissions.update}
        canDelete={permissions.delete}
        onCreate={async (values) => {
          const parsed = inventoryFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              id: createId("asset"),
              ...parsed.data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }

          return createEntity<InventoryItemRecord>("inventory", parsed.data);
        }}
        onUpdate={async (record, values) => {
          const parsed = inventoryFormSchema.safeParse(values);
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

          return updateEntity<InventoryItemRecord>("inventory", record.id, parsed.data);
        }}
        onDelete={
          permissions.delete
            ? async (record) => {
                if (!demoMode) {
                  await deleteEntity("inventory", record.id);
                }
              }
            : undefined
        }
      />

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Historique des mouvements</h2>
          <p className="text-sm text-[var(--muted)]">Dernières opérations logistiques et maintenance</p>
        </div>
        <div className="grid gap-3">
          {data.movements.map((movement) => (
            <div key={movement.id} className="rounded-[24px] border border-[var(--line)] bg-[var(--card-strong)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold">{movement.bien_nom}</p>
                <Badge tone={movement.mouvement_type === "maintenance" ? "warning" : "accent"}>
                  {movement.mouvement_type}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{formatDateTime(movement.moved_at)}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Quantité: {movement.quantite} • Destination: {movement.destination ?? "Non précisée"}
              </p>
              {movement.commentaire ? (
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{movement.commentaire}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
