import { notFound } from "next/navigation";
import { DepartmentsModule } from "@/components/modules/departments-module";
import { requireViewer } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getDepartmentsPageData } from "@/lib/services/app-data";

export default async function DepartmentsPage() {
  const viewer = await requireViewer();
  if (!hasPermission(viewer.role, "departments", "view")) {
    notFound();
  }

  const data = await getDepartmentsPageData(viewer);

  return (
    <DepartmentsModule
      data={data}
      demoMode={viewer.is_demo}
      churchId={viewer.church_id}
      permissions={{
        create: hasPermission(viewer.role, "departments", "create"),
        update: hasPermission(viewer.role, "departments", "update"),
        delete: hasPermission(viewer.role, "departments", "delete"),
      }}
    />
  );
}
