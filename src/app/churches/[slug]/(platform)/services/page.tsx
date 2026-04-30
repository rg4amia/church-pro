import { notFound } from "next/navigation";
import { ServicesModule } from "@/components/modules/services-module";
import { requireViewer } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getServicesPageData } from "@/lib/services/app-data";

export default async function ServicesPage() {
  const viewer = await requireViewer();
  if (!hasPermission(viewer.role, "services", "view")) {
    notFound();
  }

  const data = await getServicesPageData(viewer);

  return (
    <ServicesModule
      data={data}
      demoMode={viewer.is_demo}
      churchId={viewer.church_id}
      permissions={{
        create: hasPermission(viewer.role, "services", "create"),
        update: hasPermission(viewer.role, "services", "update"),
        delete: hasPermission(viewer.role, "services", "delete"),
      }}
    />
  );
}
