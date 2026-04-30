import { notFound } from "next/navigation";
import { SermonsModule } from "@/components/modules/sermons-module";
import { requireViewer } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getSermonsPageData } from "@/lib/services/app-data";

export default async function SermonsPage() {
  const viewer = await requireViewer();
  if (!hasPermission(viewer.role, "sermons", "view")) {
    notFound();
  }

  const data = await getSermonsPageData(viewer);

  return (
    <SermonsModule
      data={data}
      demoMode={viewer.is_demo}
      churchId={viewer.church_id}
      permissions={{
        create: hasPermission(viewer.role, "sermons", "create"),
        update: hasPermission(viewer.role, "sermons", "update"),
        delete: hasPermission(viewer.role, "sermons", "delete"),
      }}
    />
  );
}
