export const USER_ROLES = ["ADMIN", "RESPONSABLE", "MEMBRE", "VISITEUR"] as const;
export const MEMBER_STATUSES = ["membre", "visiteur", "nouveau_converti"] as const;
export const SERVICE_TYPES = ["semaine", "dimanche", "ecole_du_dimanche"] as const;
export const ASSET_STATES = ["bon", "panne", "reparation"] as const;
export const CELL_DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;
export const NOTIFICATION_TYPES = [
  "rappel_evenement",
  "alerte_suivi",
  "message_interne",
  "nouvelle_predication",
] as const;
export const NOTIFICATION_CHANNELS = ["realtime", "email", "sms"] as const;
export const ATTENDANCE_SOURCES = ["culte", "cellule", "departement"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];
export type AssetState = (typeof ASSET_STATES)[number];
export type CellDay = (typeof CELL_DAYS)[number];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
export type AttendanceSource = (typeof ATTENDANCE_SOURCES)[number];

export interface Viewer {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  member_id: string | null;
  church_id: string;
  church_slug: string;
  church_nom: string;
  is_demo: boolean;
}

export interface MemberRecord {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
  date_naissance: string | null;
  statut: MemberStatus;
  quartier: string | null;
  responsable_id: string | null;
  notes: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberParticipationRecord {
  id: string;
  member_id: string;
  source_type: AttendanceSource;
  culte_id: string | null;
  cellule_reunion_id: string | null;
  departement_activite_id: string | null;
  attended_at: string;
  notes: string | null;
  created_at: string;
}

export interface PrayerCellRecord {
  id: string;
  nom: string;
  localisation: string;
  responsable_id: string | null;
  jour: CellDay;
  heure: string;
  created_at: string;
  updated_at: string;
}

export interface CellMeetingRecord {
  id: string;
  cellule_id: string;
  date: string;
  theme: string;
  nb_hommes: number;
  nb_femmes: number;
  nb_enfants: number;
  nb_visiteurs: number;
  notes: string | null;
  created_at: string;
}

export interface WorshipServiceRecord {
  id: string;
  date: string;
  type: ServiceType;
  predicateur: string;
  theme: string;
  nb_hommes: number;
  nb_femmes: number;
  nb_enfants: number;
  nb_visiteurs: number;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewcomerFollowupRecord {
  id: string;
  member_id: string;
  date_conversion: string | null;
  bapteme: boolean;
  cellule_id: string | null;
  responsable_id: string | null;
  notes: string | null;
  prochain_suivi: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentRecord {
  id: string;
  nom: string;
  responsable_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentActivityRecord {
  id: string;
  departement_id: string;
  description: string;
  date: string;
  objectifs: string | null;
  resultats: string | null;
  created_at: string;
}

export interface InventoryItemRecord {
  id: string;
  nom: string;
  categorie: string;
  etat: AssetState;
  localisation: string;
  date_achat: string | null;
  cout: number | null;
  quantite: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovementRecord {
  id: string;
  bien_id: string;
  mouvement_type: "entree" | "sortie" | "maintenance" | "transfert";
  quantite: number;
  destination: string | null;
  commentaire: string | null;
  moved_at: string;
  created_at: string;
}

export interface SermonRecord {
  id: string;
  culte_id: string | null;
  titre: string;
  predicateur: string;
  date: string;
  heure: string | null;
  resume: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  titre: string;
  message: string;
  type: NotificationType;
  canal: NotificationChannel;
  audience_role: UserRole | null;
  member_id: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  read_at: string | null;
  metadata: Record<string, string | number | boolean | null> | null;
  created_at: string;
}

export interface PageStat {
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  tone?: "default" | "accent" | "success" | "warning";
}

export interface DashboardData {
  viewer: Viewer;
  metrics: DashboardMetric[];
  upcoming_events: {
    id: string;
    title: string;
    date: string;
    detail: string;
  }[];
  alerts: {
    id: string;
    title: string;
    description: string;
    tone: "warning" | "success" | "danger";
  }[];
  membership_mix: {
    name: string;
    value: number;
  }[];
  attendance_trend: {
    period: string;
    cultes: number;
    cellules: number;
  }[];
}

export interface ReportExportRow {
  [key: string]: string | number | boolean | null;
}

export type ModuleKey =
  | "dashboard"
  | "members"
  | "cells"
  | "services"
  | "newcomers"
  | "departments"
  | "inventory"
  | "reports"
  | "notifications"
  | "sermons";

export type CrudAction = "view" | "create" | "update" | "delete" | "export" | "notify";
