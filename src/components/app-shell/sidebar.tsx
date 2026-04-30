"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Church,
  FolderKanban,
  HeartHandshake,
  LayoutDashboard,
  Network,
  Package,
  Radio,
  Users,
  X,
} from "lucide-react";
import { getNavigationItems } from "@/lib/navigation";
import { cn, getInitials } from "@/lib/utils";
import type { Viewer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  users: Users,
  network: Network,
  church: Church,
  "heart-handshake": HeartHandshake,
  folders: FolderKanban,
  package: Package,
  "bar-chart-3": BarChart3,
  bell: Bell,
  radio: Radio,
} as const;

export function Sidebar({
  viewer,
  mobileOpen,
  onClose,
}: {
  viewer: Viewer;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = getNavigationItems(viewer.church_slug).filter((item) =>
    item.roles.includes(viewer.role),
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] transition-transform lg:w-[19rem] lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-teal-200/70">GestEglise</p>
            <h2 className="mt-2 text-2xl font-bold">{viewer.church_nom || "Pilotage pastoral"}</h2>
          </div>
          <button
            className="rounded-2xl border border-white/10 p-2 text-white/70 lg:hidden"
            onClick={onClose}
            type="button"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold">
                {getInitials(viewer.display_name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{viewer.display_name}</p>
                <p className="truncate text-xs text-slate-300">{viewer.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge className="bg-teal-400/14 text-teal-200">{viewer.role}</Badge>
              {viewer.is_demo ? <Badge className="bg-amber-400/14 text-amber-200">DEMO</Badge> : null}
            </div>
          </div>
        </div>

        <nav className="scrollbar-thin mt-6 flex-1 space-y-2 overflow-y-auto px-4 pb-6">
          {items.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium",
                  isActive
                    ? "bg-white/12 text-white shadow-lg shadow-black/10"
                    : "text-slate-300 hover:bg-white/6 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Conseil du jour</p>
            <p className="mt-2 leading-6">
              Planifiez les suivis visiteurs avant le dimanche pour éviter les pertes d'intégration.
            </p>
            <Button className="mt-4 w-full" variant="secondary" type="button">
              Exporter les alertes
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
