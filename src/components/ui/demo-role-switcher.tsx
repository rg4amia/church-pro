"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { USER_ROLES, type UserRole } from "@/lib/types";

export function DemoRoleSwitcher({ value }: { value: UserRole }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-3 text-sm text-[var(--muted)]">
      Prévisualisation
      <Select
        className="min-w-[10.5rem]"
        value={value}
        onChange={(event) => {
          document.cookie = `demo-role=${event.target.value}; path=/; max-age=31536000`;
          router.refresh();
        }}
      >
        {USER_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </Select>
    </label>
  );
}
