import type { ModuleKey, UserRole } from "@/lib/types";

export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  module: ModuleKey;
  roles: UserRole[];
}

const navConfig: Omit<NavigationItem, "href">[] = [
  { label: "Dashboard",    icon: "layout-dashboard", module: "dashboard",     roles: ["ADMIN", "RESPONSABLE", "MEMBRE", "VISITEUR"] },
  { label: "Membres",      icon: "users",            module: "members",       roles: ["ADMIN", "RESPONSABLE", "MEMBRE"] },
  { label: "Cellules",     icon: "network",          module: "cells",         roles: ["ADMIN", "RESPONSABLE", "MEMBRE", "VISITEUR"] },
  { label: "Cultes",       icon: "church",           module: "services",      roles: ["ADMIN", "RESPONSABLE", "MEMBRE", "VISITEUR"] },
  { label: "Suivi",        icon: "heart-handshake",  module: "newcomers",     roles: ["ADMIN", "RESPONSABLE", "MEMBRE", "VISITEUR"] },
  { label: "Départements", icon: "folders",          module: "departments",   roles: ["ADMIN", "RESPONSABLE", "MEMBRE"] },
  { label: "Inventaire",   icon: "package",          module: "inventory",     roles: ["ADMIN", "RESPONSABLE", "MEMBRE"] },
  { label: "Rapports",     icon: "bar-chart-3",      module: "reports",       roles: ["ADMIN", "RESPONSABLE", "MEMBRE"] },
  { label: "Notifications",icon: "bell",             module: "notifications", roles: ["ADMIN", "RESPONSABLE", "MEMBRE", "VISITEUR"] },
  { label: "Prédications", icon: "radio",            module: "sermons",       roles: ["ADMIN", "RESPONSABLE", "MEMBRE", "VISITEUR"] },
];

const moduleToPath: Record<ModuleKey, string> = {
  dashboard:     "",
  members:       "members",
  cells:         "cells",
  services:      "services",
  newcomers:     "newcomers",
  departments:   "departments",
  inventory:     "inventory",
  reports:       "reports",
  notifications: "notifications",
  sermons:       "sermons",
};

export function getNavigationItems(churchSlug: string): NavigationItem[] {
  const base = `/churches/${churchSlug}`;
  return navConfig.map((item) => ({
    ...item,
    href: moduleToPath[item.module] ? `${base}/${moduleToPath[item.module]}` : base,
  }));
}
