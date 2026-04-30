import { subDays } from "date-fns";
import { isSupabaseConfigured } from "@/lib/env";
import {
  demoCellMeetings,
  demoDepartments,
  demoDepartmentActivities,
  demoFollowups,
  demoInventoryItems,
  demoInventoryMovements,
  demoMembers,
  demoNotifications,
  demoParticipations,
  demoPrayerCells,
  demoSermons,
  demoWorshipServices,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CellMeetingRecord,
  DashboardData,
  DepartmentActivityRecord,
  DepartmentRecord,
  InventoryItemRecord,
  InventoryMovementRecord,
  MemberParticipationRecord,
  MemberRecord,
  NewcomerFollowupRecord,
  NotificationRecord,
  PageStat,
  PrayerCellRecord,
  ReportExportRow,
  SermonRecord,
  Viewer,
  WorshipServiceRecord,
} from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime, formatNumber, percentage } from "@/lib/utils";

interface Snapshot {
  members: MemberRecord[];
  participations: MemberParticipationRecord[];
  prayer_cells: PrayerCellRecord[];
  cell_meetings: CellMeetingRecord[];
  worship_services: WorshipServiceRecord[];
  newcomer_followups: NewcomerFollowupRecord[];
  departments: DepartmentRecord[];
  department_activities: DepartmentActivityRecord[];
  inventory_items: InventoryItemRecord[];
  inventory_movements: InventoryMovementRecord[];
  sermons: SermonRecord[];
  notifications: NotificationRecord[];
}

export interface MembersPageData {
  stats: PageStat[];
  records: Array<MemberRecord & { responsable_nom: string | null; participation_total: number }>;
  participation_feed: Array<{ id: string; membre: string; source: string; date: string; detail: string }>;
}

export interface CellsPageData {
  stats: PageStat[];
  records: Array<PrayerCellRecord & { responsable_nom: string | null; reunions_total: number }>;
  meetings: Array<CellMeetingRecord & { cellule_nom: string }>;
}

export interface ServicesPageData {
  stats: PageStat[];
  records: WorshipServiceRecord[];
  total_attendance: Array<{ label: string; value: number }>;
}

export interface NewcomersPageData {
  stats: PageStat[];
  records: Array<
    NewcomerFollowupRecord & {
      membre_nom: string;
      cellule_nom: string | null;
      responsable_nom: string | null;
    }
  >;
  member_options: Array<{ label: string; value: string }>;
  cell_options: Array<{ label: string; value: string }>;
  responsible_options: Array<{ label: string; value: string }>;
}

export interface DepartmentsPageData {
  stats: PageStat[];
  records: Array<DepartmentRecord & { responsable_nom: string | null; activites_total: number }>;
  activities: Array<DepartmentActivityRecord & { departement_nom: string }>;
  responsible_options: Array<{ label: string; value: string }>;
}

export interface InventoryPageData {
  stats: PageStat[];
  records: InventoryItemRecord[];
  movements: Array<InventoryMovementRecord & { bien_nom: string }>;
}

export interface SermonsPageData {
  stats: PageStat[];
  records: SermonRecord[];
  service_options: Array<{ label: string; value: string }>;
}

export interface NotificationsPageData {
  stats: PageStat[];
  records: NotificationRecord[];
  member_options: Array<{ label: string; value: string }>;
}

export interface ReportsPageData {
  stats: PageStat[];
  memberBreakdown: Array<{ name: string; value: number }>;
  attendanceTrend: Array<{ period: string; cultes: number; cellules: number }>;
  cellPerformance: Array<{ cellule: string; participants: number; visiteurs: number }>;
  sermonPerformance: Array<{ titre: string; predicateur: string; diffusion: number }>;
}

const demoSnapshot: Snapshot = {
  members: demoMembers,
  participations: demoParticipations,
  prayer_cells: demoPrayerCells,
  cell_meetings: demoCellMeetings,
  worship_services: demoWorshipServices,
  newcomer_followups: demoFollowups,
  departments: demoDepartments,
  department_activities: demoDepartmentActivities,
  inventory_items: demoInventoryItems,
  inventory_movements: demoInventoryMovements,
  sermons: demoSermons,
  notifications: demoNotifications,
};

async function loadSnapshot(viewer: Viewer): Promise<Snapshot> {
  if (!isSupabaseConfigured) {
    return demoSnapshot;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return demoSnapshot;
  }

  const cid = viewer.church_id;

  const [
    membersResult,
    participationsResult,
    cellsResult,
    meetingsResult,
    servicesResult,
    followupsResult,
    departmentsResult,
    activitiesResult,
    inventoryItemsResult,
    movementsResult,
    sermonsResult,
    notificationsResult,
  ] = await Promise.all([
    supabase.from("members").select("*").eq("church_id", cid).order("nom"),
    supabase.from("member_participations").select("*").eq("church_id", cid).order("attended_at", { ascending: false }),
    supabase.from("prayer_cells").select("*").eq("church_id", cid).order("nom"),
    supabase.from("cell_meetings").select("*").eq("church_id", cid).order("date", { ascending: false }),
    supabase.from("worship_services").select("*").eq("church_id", cid).order("date", { ascending: false }),
    supabase.from("newcomer_followups").select("*").eq("church_id", cid).order("created_at", { ascending: false }),
    supabase.from("departments").select("*").eq("church_id", cid).order("nom"),
    supabase.from("department_activities").select("*").eq("church_id", cid).order("date", { ascending: false }),
    supabase.from("inventory_items").select("*").eq("church_id", cid).order("nom"),
    supabase.from("inventory_movements").select("*").eq("church_id", cid).order("moved_at", { ascending: false }),
    supabase.from("sermons").select("*").eq("church_id", cid).order("date", { ascending: false }),
    supabase.from("notifications").select("*").eq("church_id", cid).order("created_at", { ascending: false }),
  ]);

  return {
    members: membersResult.data ?? demoSnapshot.members,
    participations: participationsResult.data ?? demoSnapshot.participations,
    prayer_cells: cellsResult.data ?? demoSnapshot.prayer_cells,
    cell_meetings: meetingsResult.data ?? demoSnapshot.cell_meetings,
    worship_services: servicesResult.data ?? demoSnapshot.worship_services,
    newcomer_followups: followupsResult.data ?? demoSnapshot.newcomer_followups,
    departments: departmentsResult.data ?? demoSnapshot.departments,
    department_activities: activitiesResult.data ?? demoSnapshot.department_activities,
    inventory_items: inventoryItemsResult.data ?? demoSnapshot.inventory_items,
    inventory_movements: movementsResult.data ?? demoSnapshot.inventory_movements,
    sermons: sermonsResult.data ?? demoSnapshot.sermons,
    notifications: notificationsResult.data ?? demoSnapshot.notifications,
  };
}

function createMemberNameMap(members: MemberRecord[]) {
  return new Map(members.map((member) => [member.id, `${member.prenom} ${member.nom}`]));
}

function createCellNameMap(cells: PrayerCellRecord[]) {
  return new Map(cells.map((cell) => [cell.id, cell.nom]));
}

function createDepartmentNameMap(departments: DepartmentRecord[]) {
  return new Map(departments.map((department) => [department.id, department.nom]));
}

function createInventoryNameMap(items: InventoryItemRecord[]) {
  return new Map(items.map((item) => [item.id, item.nom]));
}

function getRecentPeriods() {
  return [21, 14, 7, 0].map((daysAgo) => formatDate(subDays(new Date(), daysAgo).toISOString(), "d MMM"));
}

function getAttendanceTotal(service: WorshipServiceRecord) {
  return service.nb_hommes + service.nb_femmes + service.nb_enfants + service.nb_visiteurs;
}

function getMeetingTotal(meeting: CellMeetingRecord) {
  return meeting.nb_hommes + meeting.nb_femmes + meeting.nb_enfants + meeting.nb_visiteurs;
}

export async function getDashboardData(viewer: Viewer): Promise<DashboardData> {
  const snapshot = await loadSnapshot(viewer);
  const memberStats = {
    membres: snapshot.members.filter((member) => member.statut === "membre").length,
    visiteurs: snapshot.members.filter((member) => member.statut === "visiteur").length,
    convertis: snapshot.members.filter((member) => member.statut === "nouveau_converti").length,
  };
  const servicesAttendance = snapshot.worship_services.reduce(
    (sum, service) => sum + getAttendanceTotal(service),
    0,
  );
  const recentMeetings = snapshot.cell_meetings.slice(0, 4);
  const recentServices = snapshot.worship_services.slice(0, 4);

  return {
    viewer,
    metrics: [
      {
        label: "Membres actifs",
        value: formatNumber(memberStats.membres),
        change: `+${memberStats.convertis} nouveaux convertis ce mois`,
        tone: "accent",
      },
      {
        label: "Présence cultes",
        value: formatNumber(servicesAttendance),
        change: `${recentServices.length} cultes suivis sur 30 jours`,
        tone: "success",
      },
      {
        label: "Réunions de cellules",
        value: formatNumber(snapshot.cell_meetings.length),
        change: `${recentMeetings.length} relevés récents`,
      },
      {
        label: "Notifications en attente",
        value: formatNumber(snapshot.notifications.filter((item) => !item.sent_at).length),
        change: "À synchroniser avec Email/SMS mock",
        tone: "warning",
      },
    ],
    upcoming_events: [
      ...snapshot.prayer_cells.slice(0, 2).map((cell) => ({
        id: cell.id,
        title: cell.nom,
        date: `${cell.jour} à ${cell.heure}`,
        detail: cell.localisation,
      })),
      ...snapshot.newcomer_followups
        .filter((item) => item.prochain_suivi)
        .slice(0, 2)
        .map((item) => ({
          id: item.id,
          title: "Suivi nouveau converti",
          date: formatDateTime(item.prochain_suivi),
          detail: item.notes ?? "Suivi pastoral planifié",
        })),
    ],
    alerts: [
      {
        id: "alert-1",
        title: "Micro en réparation",
        description: "Un micro sans fil est toujours indisponible pour les cultes de semaine.",
        tone: "warning",
      },
      {
        id: "alert-2",
        title: "Visiteurs à rappeler",
        description: `${memberStats.visiteurs} visiteurs doivent être recontactés cette semaine.`,
        tone: "danger",
      },
      {
        id: "alert-3",
        title: "Prédications diffusées",
        description: `${snapshot.sermons.length} contenus vidéo prêts au partage.`,
        tone: "success",
      },
    ],
    membership_mix: [
      { name: "Membres", value: memberStats.membres },
      { name: "Visiteurs", value: memberStats.visiteurs },
      { name: "Nouveaux", value: memberStats.convertis },
    ],
    attendance_trend: getRecentPeriods().map((period, index) => ({
      period,
      cultes: snapshot.worship_services[index]
        ? getAttendanceTotal(snapshot.worship_services[index]!)
        : 0,
      cellules: snapshot.cell_meetings[index] ? getMeetingTotal(snapshot.cell_meetings[index]!) : 0,
    })),
  };
}

export async function getMembersPageData(viewer: Viewer): Promise<MembersPageData> {
  const snapshot = await loadSnapshot(viewer);
  const nameMap = createMemberNameMap(snapshot.members);

  const records = snapshot.members.map((member) => ({
    ...member,
    responsable_nom: member.responsable_id ? nameMap.get(member.responsable_id) ?? null : null,
    participation_total: snapshot.participations.filter((item) => item.member_id === member.id).length,
  }));

  return {
    stats: [
      {
        label: "Fiche membres",
        value: formatNumber(records.length),
        helper: "Base principale consolidée",
        tone: "accent",
      },
      {
        label: "Nouveaux convertis",
        value: formatNumber(records.filter((item) => item.statut === "nouveau_converti").length),
        helper: "À intégrer dans une cellule",
        tone: "success",
      },
      {
        label: "Visiteurs actifs",
        value: formatNumber(records.filter((item) => item.statut === "visiteur").length),
        helper: "Présences récentes à relancer",
        tone: "warning",
      },
    ],
    records,
    participation_feed: snapshot.participations.slice(0, 6).map((entry) => ({
      id: entry.id,
      membre: nameMap.get(entry.member_id) ?? "Membre inconnu",
      source:
        entry.source_type === "culte"
          ? "Culte"
          : entry.source_type === "cellule"
            ? "Cellule"
            : "Département",
      date: formatDateTime(entry.attended_at),
      detail: entry.notes ?? "Participation enregistrée",
    })),
  };
}

export async function getCellsPageData(viewer: Viewer): Promise<CellsPageData> {
  const snapshot = await loadSnapshot(viewer);
  const nameMap = createMemberNameMap(snapshot.members);
  const cellMap = createCellNameMap(snapshot.prayer_cells);

  return {
    stats: [
      {
        label: "Cellules actives",
        value: formatNumber(snapshot.prayer_cells.length),
        helper: "Maillage de proximité",
        tone: "accent",
      },
      {
        label: "Réunions remontées",
        value: formatNumber(snapshot.cell_meetings.length),
        helper: "Historique disponible",
        tone: "success",
      },
      {
        label: "Visiteurs en cellule",
        value: formatNumber(
          snapshot.cell_meetings.reduce((sum, item) => sum + item.nb_visiteurs, 0),
        ),
        helper: "À suivre avec l'accueil",
        tone: "warning",
      },
    ],
    records: snapshot.prayer_cells.map((cell) => ({
      ...cell,
      responsable_nom: cell.responsable_id ? nameMap.get(cell.responsable_id) ?? null : null,
      reunions_total: snapshot.cell_meetings.filter((meeting) => meeting.cellule_id === cell.id).length,
    })),
    meetings: snapshot.cell_meetings.map((meeting) => ({
      ...meeting,
      cellule_nom: cellMap.get(meeting.cellule_id) ?? "Cellule inconnue",
    })),
  };
}

export async function getServicesPageData(viewer: Viewer): Promise<ServicesPageData> {
  const snapshot = await loadSnapshot(viewer);
  const totals = snapshot.worship_services.reduce(
    (accumulator, service) => {
      accumulator.hommes += service.nb_hommes;
      accumulator.femmes += service.nb_femmes;
      accumulator.enfants += service.nb_enfants;
      accumulator.visiteurs += service.nb_visiteurs;
      return accumulator;
    },
    { hommes: 0, femmes: 0, enfants: 0, visiteurs: 0 },
  );

  return {
    stats: [
      {
        label: "Cultes enregistrés",
        value: formatNumber(snapshot.worship_services.length),
        helper: "Tous types confondus",
        tone: "accent",
      },
      {
        label: "Visiteurs cumulés",
        value: formatNumber(totals.visiteurs),
        helper: "Mesure de portée évangélique",
        tone: "warning",
      },
      {
        label: "Ressources audio",
        value: formatNumber(snapshot.worship_services.filter((item) => item.audio_url).length),
        helper: "Enregistrements disponibles",
        tone: "success",
      },
    ],
    records: snapshot.worship_services,
    total_attendance: [
      { label: "Hommes", value: totals.hommes },
      { label: "Femmes", value: totals.femmes },
      { label: "Enfants", value: totals.enfants },
      { label: "Visiteurs", value: totals.visiteurs },
    ],
  };
}

export async function getNewcomersPageData(viewer: Viewer): Promise<NewcomersPageData> {
  const snapshot = await loadSnapshot(viewer);
  const memberMap = createMemberNameMap(snapshot.members);
  const cellMap = createCellNameMap(snapshot.prayer_cells);

  return {
    stats: [
      {
        label: "Suivis ouverts",
        value: formatNumber(snapshot.newcomer_followups.length),
        helper: "Nouveaux convertis + visiteurs qualifiés",
        tone: "accent",
      },
      {
        label: "Baptêmes finalisés",
        value: formatNumber(snapshot.newcomer_followups.filter((item) => item.bapteme).length),
        helper: "Décisions déjà confirmées",
        tone: "success",
      },
      {
        label: "Suivis à planifier",
        value: formatNumber(snapshot.newcomer_followups.filter((item) => !item.prochain_suivi).length),
        helper: "Demande d'action pastorale",
        tone: "warning",
      },
    ],
    records: snapshot.newcomer_followups.map((item) => ({
      ...item,
      membre_nom: memberMap.get(item.member_id) ?? "Membre inconnu",
      cellule_nom: item.cellule_id ? cellMap.get(item.cellule_id) ?? null : null,
      responsable_nom: item.responsable_id ? memberMap.get(item.responsable_id) ?? null : null,
    })),
    member_options: snapshot.members.map((member) => ({
      label: `${member.prenom} ${member.nom}`,
      value: member.id,
    })),
    cell_options: snapshot.prayer_cells.map((cell) => ({
      label: cell.nom,
      value: cell.id,
    })),
    responsible_options: snapshot.members.map((member) => ({
      label: `${member.prenom} ${member.nom}`,
      value: member.id,
    })),
  };
}

export async function getDepartmentsPageData(viewer: Viewer): Promise<DepartmentsPageData> {
  const snapshot = await loadSnapshot(viewer);
  const memberMap = createMemberNameMap(snapshot.members);
  const departmentMap = createDepartmentNameMap(snapshot.departments);

  return {
    stats: [
      {
        label: "Départements",
        value: formatNumber(snapshot.departments.length),
        helper: "Pôles d'engagement actifs",
        tone: "accent",
      },
      {
        label: "Activités récentes",
        value: formatNumber(snapshot.department_activities.length),
        helper: "Historique consolidé",
        tone: "success",
      },
      {
        label: "Leaders identifiés",
        value: formatNumber(snapshot.departments.filter((item) => item.responsable_id).length),
        helper: "Responsabilités attribuées",
      },
    ],
    records: snapshot.departments.map((department) => ({
      ...department,
      responsable_nom: department.responsable_id
        ? memberMap.get(department.responsable_id) ?? null
        : null,
      activites_total: snapshot.department_activities.filter(
        (activity) => activity.departement_id === department.id,
      ).length,
    })),
    activities: snapshot.department_activities.map((activity) => ({
      ...activity,
      departement_nom: departmentMap.get(activity.departement_id) ?? "Département inconnu",
    })),
    responsible_options: snapshot.members.map((member) => ({
      label: `${member.prenom} ${member.nom}`,
      value: member.id,
    })),
  };
}

export async function getInventoryPageData(viewer: Viewer): Promise<InventoryPageData> {
  const snapshot = await loadSnapshot(viewer);
  const inventoryMap = createInventoryNameMap(snapshot.inventory_items);

  return {
    stats: [
      {
        label: "Biens suivis",
        value: formatNumber(snapshot.inventory_items.length),
        helper: "Parc disponible",
        tone: "accent",
      },
      {
        label: "Valeur estimée",
        value: formatCurrency(
          snapshot.inventory_items.reduce((sum, item) => sum + (item.cout ?? 0), 0),
        ),
        helper: "Base achat simple",
        tone: "success",
      },
      {
        label: "Pannes ou réparations",
        value: formatNumber(
          snapshot.inventory_items.filter((item) => item.etat !== "bon").length,
        ),
        helper: "À traiter rapidement",
        tone: "warning",
      },
    ],
    records: snapshot.inventory_items,
    movements: snapshot.inventory_movements.map((movement) => ({
      ...movement,
      bien_nom: inventoryMap.get(movement.bien_id) ?? "Bien inconnu",
    })),
  };
}

export async function getSermonsPageData(viewer: Viewer): Promise<SermonsPageData> {
  const snapshot = await loadSnapshot(viewer);

  return {
    stats: [
      {
        label: "Prédications publiées",
        value: formatNumber(snapshot.sermons.length),
        helper: "Bibliothèque vidéo active",
        tone: "accent",
      },
      {
        label: "Avec miniature",
        value: formatNumber(snapshot.sermons.filter((item) => item.thumbnail_url).length),
        helper: "Prêt pour diffusion digitale",
        tone: "success",
      },
      {
        label: "Prédicateurs distincts",
        value: formatNumber(new Set(snapshot.sermons.map((item) => item.predicateur)).size),
        helper: "Diversité d'enseignement",
      },
    ],
    records: snapshot.sermons,
    service_options: snapshot.worship_services.map((service) => ({
      label: `${formatDate(service.date)} • ${service.theme}`,
      value: service.id,
    })),
  };
}

export async function getNotificationsPageData(viewer: Viewer): Promise<NotificationsPageData> {
  const snapshot = await loadSnapshot(viewer);
  const records = snapshot.notifications.filter(
    (notification) =>
      notification.member_id === viewer.member_id ||
      notification.member_id === null ||
      notification.audience_role === null ||
      notification.audience_role === viewer.role,
  );

  return {
    stats: [
      {
        label: "Notifications visibles",
        value: formatNumber(records.length),
        helper: "Selon le rôle courant",
        tone: "accent",
      },
      {
        label: "À envoyer",
        value: formatNumber(records.filter((item) => !item.sent_at).length),
        helper: "Queue mock Email/SMS",
        tone: "warning",
      },
      {
        label: "Lues",
        value: formatNumber(records.filter((item) => item.read_at).length),
        helper: `${percentage(
          records.filter((item) => item.read_at).length,
          records.length,
        )}% de lecture`,
        tone: "success",
      },
    ],
    records,
    member_options: snapshot.members.map((member) => ({
      label: `${member.prenom} ${member.nom}`,
      value: member.id,
    })),
  };
}

export async function getReportsPageData(viewer: Viewer): Promise<ReportsPageData> {
  const snapshot = await loadSnapshot(viewer);

  return {
    stats: [
      {
        label: "Couverture cellules",
        value: `${snapshot.prayer_cells.length} zones`,
        helper: "Présence territoriale suivie",
        tone: "accent",
      },
      {
        label: "Audience moyenne cultes",
        value:
          snapshot.worship_services.length > 0
            ? formatNumber(
                Math.round(
                  snapshot.worship_services.reduce(
                    (sum, service) => sum + getAttendanceTotal(service),
                    0,
                  ) / snapshot.worship_services.length,
                ),
              )
            : "0",
        helper: "Moyenne sur l'échantillon",
        tone: "success",
      },
      {
        label: "Taux visiteurs",
        value: `${percentage(
          snapshot.worship_services.reduce((sum, service) => sum + service.nb_visiteurs, 0),
          snapshot.worship_services.reduce((sum, service) => sum + getAttendanceTotal(service), 0),
        )}%`,
        helper: "Mesure d'attraction",
        tone: "warning",
      },
    ],
    memberBreakdown: [
      {
        name: "Membres",
        value: snapshot.members.filter((member) => member.statut === "membre").length,
      },
      {
        name: "Visiteurs",
        value: snapshot.members.filter((member) => member.statut === "visiteur").length,
      },
      {
        name: "Nouveaux",
        value: snapshot.members.filter((member) => member.statut === "nouveau_converti").length,
      },
    ],
    attendanceTrend: getRecentPeriods().map((period, index) => ({
      period,
      cultes: snapshot.worship_services[index]
        ? getAttendanceTotal(snapshot.worship_services[index]!)
        : 0,
      cellules: snapshot.cell_meetings[index] ? getMeetingTotal(snapshot.cell_meetings[index]!) : 0,
    })),
    cellPerformance: snapshot.prayer_cells.map((cell) => {
      const meetings = snapshot.cell_meetings.filter((meeting) => meeting.cellule_id === cell.id);
      return {
        cellule: cell.nom,
        participants: meetings.reduce((sum, meeting) => sum + getMeetingTotal(meeting), 0),
        visiteurs: meetings.reduce((sum, meeting) => sum + meeting.nb_visiteurs, 0),
      };
    }),
    sermonPerformance: snapshot.sermons.map((sermon, index) => ({
      titre: sermon.titre,
      predicateur: sermon.predicateur,
      diffusion: 250 + index * 85,
    })),
  };
}

export async function getReportRows(viewer: Viewer, type: "members" | "services" | "cells" | "inventory" | "sermons") {
  const snapshot = await loadSnapshot(viewer);
  const memberMap = createMemberNameMap(snapshot.members);
  const cellMap = createCellNameMap(snapshot.prayer_cells);

  const rows: Record<typeof type, ReportExportRow[]> = {
    members: snapshot.members.map((member) => ({
      nom: member.nom,
      prenom: member.prenom,
      statut: member.statut,
      telephone: member.telephone,
      email: member.email,
      quartier: member.quartier,
      responsable: member.responsable_id ? memberMap.get(member.responsable_id) ?? "" : "",
      date_adhesion: member.joined_at,
    })),
    services: snapshot.worship_services.map((service) => ({
      date: service.date,
      type: service.type,
      predicateur: service.predicateur,
      theme: service.theme,
      total: getAttendanceTotal(service),
      visiteurs: service.nb_visiteurs,
    })),
    cells: snapshot.cell_meetings.map((meeting) => ({
      cellule: cellMap.get(meeting.cellule_id) ?? "",
      date: meeting.date,
      theme: meeting.theme,
      participants: getMeetingTotal(meeting),
      visiteurs: meeting.nb_visiteurs,
      notes: meeting.notes,
    })),
    inventory: snapshot.inventory_items.map((item) => ({
      nom: item.nom,
      categorie: item.categorie,
      etat: item.etat,
      localisation: item.localisation,
      quantite: item.quantite,
      cout: item.cout,
    })),
    sermons: snapshot.sermons.map((sermon) => ({
      titre: sermon.titre,
      predicateur: sermon.predicateur,
      date: sermon.date,
      heure: sermon.heure,
      video_url: sermon.video_url,
      resume: sermon.resume,
    })),
  };

  return rows[type];
}
