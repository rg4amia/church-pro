"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CrudTable, type CrudField } from "@/components/crud/crud-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { createEntity, deleteEntity, updateEntity } from "@/lib/api-client";
import { useRealtimeRefresh } from "@/lib/realtime";
import { createId, formatDateTime } from "@/lib/utils";
import { notificationFormSchema } from "@/lib/validation/schemas";
import type { NotificationsPageData } from "@/lib/services/app-data";
import type { NotificationRecord } from "@/lib/types";

export function NotificationsModule({
  data,
  demoMode,
  permissions,
  churchId,
}: {
  data: NotificationsPageData;
  demoMode: boolean;
  permissions: { create: boolean; update: boolean; delete: boolean };
  churchId: string;
}) {
  useRealtimeRefresh(["notifications"], "notifications", churchId);

  const fields: CrudField[] = [
    { name: "titre", label: "Titre", type: "text" },
    { name: "message", label: "Message", type: "textarea" },
    {
      name: "type",
      label: "Type",
      type: "select",
      options: [
        { label: "Rappel événement", value: "rappel_evenement" },
        { label: "Alerte suivi", value: "alerte_suivi" },
        { label: "Message interne", value: "message_interne" },
        { label: "Nouvelle prédication", value: "nouvelle_predication" },
      ],
    },
    {
      name: "canal",
      label: "Canal",
      type: "select",
      options: [
        { label: "Realtime", value: "realtime" },
        { label: "Email", value: "email" },
        { label: "SMS", value: "sms" },
      ],
    },
    {
      name: "audience_role",
      label: "Audience rôle",
      type: "select",
      options: [
        { label: "Tous", value: "" },
        { label: "ADMIN", value: "ADMIN" },
        { label: "RESPONSABLE", value: "RESPONSABLE" },
        { label: "MEMBRE", value: "MEMBRE" },
        { label: "VISITEUR", value: "VISITEUR" },
      ],
    },
    {
      name: "member_id",
      label: "Membre ciblé",
      type: "select",
      options: [{ label: "Aucun ciblage individuel", value: "" }, ...data.member_options],
    },
    { name: "scheduled_for", label: "Planification", type: "datetime-local" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Rappels, alertes de suivi, messages internes et diffusion des nouvelles vidéos."
        badge="Module 8"
      />

      <StatGrid stats={data.stats} />

      <CrudTable<NotificationRecord>
        title="Centre de notifications"
        description="Les envois sont mockés mais structurés pour être branchés sur Realtime, Email et SMS."
        storageKey="gesteglise-notifications"
        demoMode={demoMode}
        records={data.records}
        fields={fields}
        columns={[
          {
            label: "Message",
            render: (record) => (
              <div>
                <p className="font-semibold">{record.titre}</p>
                <p className="text-xs text-[var(--muted)]">{record.message}</p>
              </div>
            ),
          },
          {
            label: "Canal",
            render: (record) => <Badge tone="accent">{record.canal}</Badge>,
          },
          {
            label: "Audience",
            render: (record) => record.audience_role ?? "Ciblage individuel",
          },
          {
            label: "État",
            render: (record) => (
              <Badge tone={record.sent_at ? "success" : "warning"}>
                {record.sent_at ? "Envoyé" : "Programmé"}
              </Badge>
            ),
          },
        ]}
        searchKeys={["titre", "message", "type", "canal"]}
        filters={[
          {
            name: "type",
            label: "Filtrer par type",
            options: [
              { label: "Rappel", value: "rappel_evenement" },
              { label: "Alerte", value: "alerte_suivi" },
              { label: "Interne", value: "message_interne" },
              { label: "Prédication", value: "nouvelle_predication" },
            ],
          },
        ]}
        emptyValues={{
          titre: "",
          message: "",
          type: "message_interne",
          canal: "realtime",
          audience_role: "",
          member_id: "",
          scheduled_for: "",
        }}
        canCreate={permissions.create}
        canEdit={permissions.update}
        canDelete={permissions.delete}
        onCreate={async (values) => {
          const parsed = notificationFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              id: createId("notification"),
              ...parsed.data,
              sent_at: null,
              read_at: null,
              metadata: null,
              created_at: new Date().toISOString(),
            };
          }

          return createEntity<NotificationRecord>("notifications", parsed.data);
        }}
        onUpdate={async (record, values) => {
          const parsed = notificationFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              ...record,
              ...parsed.data,
            };
          }

          return updateEntity<NotificationRecord>("notifications", record.id, parsed.data);
        }}
        onDelete={
          permissions.delete
            ? async (record) => {
                if (!demoMode) {
                  await deleteEntity("notifications", record.id);
                }
              }
            : undefined
        }
      />

      <div className="grid gap-3 xl:grid-cols-2">
        {data.records.map((record) => (
          <Card key={record.id} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{record.titre}</p>
              <Badge tone={record.read_at ? "success" : record.sent_at ? "accent" : "warning"}>
                {record.read_at ? "Lu" : record.sent_at ? "Envoyé" : "En attente"}
              </Badge>
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">{record.message}</p>
            <p className="text-xs text-[var(--muted)]">
              {record.scheduled_for ? formatDateTime(record.scheduled_for) : "Sans planification"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
