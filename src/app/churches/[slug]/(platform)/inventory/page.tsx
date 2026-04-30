import { notFound } from "next/navigation";
import { InventoryModule } from "@/components/modules/inventory-module";
import { requireViewer } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getInventoryPageData } from "@/lib/services/app-data";

export default async function InventoryPage() {
  const viewer = await requireViewer();
  if (!hasPermission(viewer.role, "inventory", "view")) {
    notFound();
  }

  const data = await getInventoryPageData(viewer);

  return (
    <InventoryModule
      data={data}
      demoMode={viewer.is_demo}
      churchId={viewer.church_id}
      permissions={{
        create: hasPermission(viewer.role, "inventory", "create"),
        update: hasPermission(viewer.role, "inventory", "update"),
        delete: hasPermission(viewer.role, "inventory", "delete"),
      }}
    />
  );
}
