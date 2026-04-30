import { z } from "zod";
import { ASSET_STATES, CELL_DAYS, MEMBER_STATUSES, NOTIFICATION_CHANNELS, NOTIFICATION_TYPES, SERVICE_TYPES, USER_ROLES } from "@/lib/types";

const optionalText = z.string().trim().optional().transform((value) => value || null);
const requiredText = (label: string) => z.string().trim().min(2, `${label} est requis`);
const optionalDate = z.string().trim().optional().transform((value) => value || null);
const positiveNumber = (label: string) =>
  z.coerce.number().min(0, `${label} doit être positif`);

export const memberFormSchema = z.object({
  nom: requiredText("Le nom"),
  prenom: requiredText("Le prénom"),
  telephone: requiredText("Le téléphone"),
  email: z.string().email("Email invalide").optional().or(z.literal("")).transform((value) => value || null),
  adresse: optionalText,
  date_naissance: optionalDate,
  statut: z.enum(MEMBER_STATUSES),
  quartier: optionalText,
  responsable_id: z.string().optional().transform((value) => value || null),
  notes: optionalText,
  joined_at: optionalDate,
});

export const cellFormSchema = z.object({
  nom: requiredText("Le nom"),
  localisation: requiredText("La localisation"),
  responsable_id: z.string().optional().transform((value) => value || null),
  jour: z.enum(CELL_DAYS),
  heure: z.string().trim().min(2, "L'heure est requise"),
});

export const serviceFormSchema = z.object({
  date: z.string().trim().min(2, "La date est requise"),
  type: z.enum(SERVICE_TYPES),
  predicateur: requiredText("Le prédicateur"),
  theme: requiredText("Le thème"),
  nb_hommes: positiveNumber("Le nombre d'hommes"),
  nb_femmes: positiveNumber("Le nombre de femmes"),
  nb_enfants: positiveNumber("Le nombre d'enfants"),
  nb_visiteurs: positiveNumber("Le nombre de visiteurs"),
  audio_url: z.string().url("URL invalide").optional().or(z.literal("")).transform((value) => value || null),
});

export const newcomerFormSchema = z.object({
  member_id: z.string().trim().min(2, "Le membre est requis"),
  date_conversion: optionalDate,
  bapteme: z.coerce.boolean(),
  cellule_id: z.string().optional().transform((value) => value || null),
  responsable_id: z.string().optional().transform((value) => value || null),
  notes: optionalText,
  prochain_suivi: optionalText,
});

export const departmentFormSchema = z.object({
  nom: requiredText("Le nom"),
  responsable_id: z.string().optional().transform((value) => value || null),
  description: optionalText,
});

export const inventoryFormSchema = z.object({
  nom: requiredText("Le nom"),
  categorie: requiredText("La catégorie"),
  etat: z.enum(ASSET_STATES),
  localisation: requiredText("La localisation"),
  date_achat: optionalDate,
  cout: z.coerce.number().optional().transform((value) => value ?? null),
  quantite: z.coerce.number().min(1, "La quantité minimale est 1"),
});

export const sermonFormSchema = z.object({
  culte_id: z.string().optional().transform((value) => value || null),
  titre: requiredText("Le titre"),
  predicateur: requiredText("Le prédicateur"),
  date: z.string().trim().min(2, "La date est requise"),
  heure: optionalText,
  resume: optionalText,
  video_url: z.string().url("URL vidéo invalide").optional().or(z.literal("")).transform((value) => value || null),
  thumbnail_url: z.string().url("URL miniature invalide").optional().or(z.literal("")).transform((value) => value || null),
});

export const notificationFormSchema = z.object({
  titre: requiredText("Le titre"),
  message: requiredText("Le message"),
  type: z.enum(NOTIFICATION_TYPES),
  canal: z.enum(NOTIFICATION_CHANNELS),
  audience_role: z.enum(USER_ROLES).optional().or(z.literal("")).transform((value) => value || null),
  member_id: z.string().optional().transform((value) => value || null),
  scheduled_for: optionalText,
});

export const createChurchSchema = z.object({
  nom: z.string().trim().min(2, "Le nom de l'église est requis"),
  slug: z
    .string()
    .trim()
    .min(2, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Slug invalide — uniquement lettres minuscules, chiffres et tirets"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe de 8 caractères minimum"),
});
