import type { CrudAction, ModuleKey, UserRole } from "@/lib/types";

const FULL_ACCESS: Record<ModuleKey, CrudAction[]> = {
  dashboard: ["view"],
  members: ["view", "create", "update", "delete", "export"],
  cells: ["view", "create", "update", "delete", "export"],
  services: ["view", "create", "update", "delete", "export"],
  newcomers: ["view", "create", "update", "delete", "export"],
  departments: ["view", "create", "update", "delete", "export"],
  inventory: ["view", "create", "update", "delete", "export"],
  reports: ["view", "export"],
  notifications: ["view", "create", "update", "delete", "notify"],
  sermons: ["view", "create", "update", "delete", "export"],
};

export const PERMISSIONS: Record<UserRole, Record<ModuleKey, CrudAction[]>> = {
  ADMIN: FULL_ACCESS,
  RESPONSABLE: {
    dashboard: ["view"],
    members: ["view", "create", "update", "export"],
    cells: ["view", "create", "update", "export"],
    services: ["view", "create", "update", "export"],
    newcomers: ["view", "create", "update", "export"],
    departments: ["view", "create", "update", "export"],
    inventory: ["view", "create", "update", "export"],
    reports: ["view", "export"],
    notifications: ["view", "create", "notify"],
    sermons: ["view", "create", "update", "export"],
  },
  MEMBRE: {
    dashboard: ["view"],
    members: ["view"],
    cells: ["view"],
    services: ["view"],
    newcomers: ["view"],
    departments: ["view"],
    inventory: ["view"],
    reports: ["view"],
    notifications: ["view"],
    sermons: ["view"],
  },
  VISITEUR: {
    dashboard: ["view"],
    members: [],
    cells: ["view"],
    services: ["view"],
    newcomers: ["view"],
    departments: [],
    inventory: [],
    reports: [],
    notifications: ["view"],
    sermons: ["view"],
  },
};

export function hasPermission(role: UserRole, module: ModuleKey, action: CrudAction) {
  return PERMISSIONS[role][module].includes(action);
}
