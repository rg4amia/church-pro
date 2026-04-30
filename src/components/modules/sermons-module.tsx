"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CrudTable, type CrudField } from "@/components/crud/crud-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { createEntity, deleteEntity, updateEntity } from "@/lib/api-client";
import { useRealtimeRefresh } from "@/lib/realtime";
import { createId, formatDate, getYouTubeEmbedUrl } from "@/lib/utils";
import { sermonFormSchema } from "@/lib/validation/schemas";
import type { SermonsPageData } from "@/lib/services/app-data";
import type { SermonRecord } from "@/lib/types";

export function SermonsModule({
  data,
  demoMode,
  permissions,
  churchId,
}: {
  data: SermonsPageData;
  demoMode: boolean;
  permissions: { create: boolean; update: boolean; delete: boolean };
  churchId: string;
}) {
  useRealtimeRefresh(["sermons"], "prédications", churchId);

  const featured = data.records[0];
  const embedUrl = featured ? getYouTubeEmbedUrl(featured.video_url) : null;

  const fields: CrudField[] = [
    {
      name: "culte_id",
      label: "Culte lié",
      type: "select",
      options: [{ label: "Aucun", value: "" }, ...data.service_options],
    },
    { name: "titre", label: "Titre", type: "text" },
    { name: "predicateur", label: "Prédicateur", type: "text" },
    { name: "date", label: "Date", type: "date" },
    { name: "heure", label: "Heure", type: "time" },
    { name: "resume", label: "Résumé", type: "textarea" },
    { name: "video_url", label: "URL vidéo", type: "url" },
    { name: "thumbnail_url", label: "URL miniature", type: "url" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prédications"
        description="Bibliothèque vidéo dominicale avec recherche, filtrage et aperçu intégré des contenus diffusés."
        badge="Module 9"
      />

      <StatGrid stats={data.stats} />

      {featured ? (
        <Card className="overflow-hidden">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-black">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="aspect-video w-full"
                  title={featured.titre}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : featured.thumbnail_url ? (
                <Image
                  src={featured.thumbnail_url}
                  alt={featured.titre}
                  width={900}
                  height={506}
                  className="aspect-video h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-4">
              <Badge tone="accent">À la une</Badge>
              <div>
                <h2 className="text-2xl font-bold">{featured.titre}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {featured.predicateur} • {formatDate(featured.date)}
                </p>
              </div>
              <p className="text-sm leading-7 text-[var(--muted)]">
                {featured.resume ?? "Résumé non fourni"}
              </p>
              {featured.video_url ? (
                <Button type="button" onClick={() => window.open(featured.video_url ?? "", "_blank", "noopener,noreferrer")}>
                  Ouvrir la vidéo source
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      <CrudTable<SermonRecord>
        title="Catalogue des prédications"
        description="Les filtres, la recherche et la fiche vidéo servent l’équipe média comme l’équipe pastorale."
        storageKey="gesteglise-sermons"
        demoMode={demoMode}
        records={data.records}
        fields={fields}
        columns={[
          {
            label: "Prédication",
            render: (record) => (
              <div>
                <p className="font-semibold">{record.titre}</p>
                <p className="text-xs text-[var(--muted)]">{record.predicateur}</p>
              </div>
            ),
          },
          {
            label: "Date",
            render: (record) => formatDate(record.date),
          },
          {
            label: "Vidéo",
            render: (record) => (
              <Badge tone={record.video_url ? "success" : "warning"}>
                {record.video_url ? "Disponible" : "À charger"}
              </Badge>
            ),
          },
          {
            label: "Résumé",
            render: (record) => record.resume ?? "Résumé non fourni",
          },
        ]}
        searchKeys={["titre", "predicateur", "resume", "date"]}
        emptyValues={{
          culte_id: "",
          titre: "",
          predicateur: "",
          date: "",
          heure: "",
          resume: "",
          video_url: "",
          thumbnail_url: "",
        }}
        canCreate={permissions.create}
        canEdit={permissions.update}
        canDelete={permissions.delete}
        onCreate={async (values) => {
          const parsed = sermonFormSchema.safeParse(values);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          }

          if (demoMode) {
            return {
              id: createId("sermon"),
              ...parsed.data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }

          return createEntity<SermonRecord>("sermons", parsed.data);
        }}
        onUpdate={async (record, values) => {
          const parsed = sermonFormSchema.safeParse(values);
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

          return updateEntity<SermonRecord>("sermons", record.id, parsed.data);
        }}
        onDelete={
          permissions.delete
            ? async (record) => {
                if (!demoMode) {
                  await deleteEntity("sermons", record.id);
                }
              }
            : undefined
        }
      />
    </div>
  );
}
