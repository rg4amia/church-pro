import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null | undefined, pattern = "d MMM yyyy") {
  if (!value) {
    return "Non renseigné";
  }

  return format(new Date(value), pattern, { locale: fr });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Non planifié";
  }

  return format(new Date(value), "d MMM yyyy 'à' HH:mm", { locale: fr });
}

export function formatCurrency(value: number | null | undefined) {
  if (value == null) {
    return "Non chiffré";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, T>();
  items.forEach((item) => {
    map.set(key(item), item);
  });
  return [...map.values()];
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function getYouTubeEmbedUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  );
  const videoId = match?.[1];

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export function percentage(part: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((part / total) * 100);
}
