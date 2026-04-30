"use client";

import { Menu, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { DemoRoleSwitcher } from "@/components/ui/demo-role-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Viewer } from "@/lib/types";

const pageTitles: Record<string, string> = {
  "/": "Vue d'ensemble",
  "/members": "Gestion des membres",
  "/cells": "Cellules de prière",
  "/services": "Gestion des cultes",
  "/newcomers": "Nouveaux convertis et visiteurs",
  "/departments": "Départements",
  "/inventory": "Inventaire",
  "/reports": "Rapports et statistiques",
  "/notifications": "Notifications",
  "/sermons": "Prédications",
};

export function Topbar({
  viewer,
  onOpenMenu,
}: {
  viewer: Viewer;
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "GestEglise";

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="surface flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden"
            onClick={onOpenMenu}
            type="button"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{title}</h1>
              <Badge tone="accent" className="hidden sm:inline-flex">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                RBAC actif
              </Badge>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Accès courant: {viewer.role} {viewer.is_demo ? "en mode démonstration" : "via Supabase Auth"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {viewer.is_demo ? <DemoRoleSwitcher value={viewer.role} /> : null}
          <ThemeToggle />
          <Button variant="secondary" type="button">
            Centre d’aide
          </Button>
        </div>
      </div>
    </header>
  );
}
