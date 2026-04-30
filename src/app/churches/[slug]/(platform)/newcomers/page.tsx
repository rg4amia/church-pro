import { notFound } from "next/navigation";
import { NewcomersModule } from "@/components/modules/newcomers-module";
import { requireViewer } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getNewcomersPageData } from "@/lib/services/app-data";

export default async function NewcomersPage() {
  const viewer = await requireViewer();
  if (!hasPermission(viewer.role, "newcomers", "view")) {
    notFound();
  }

  const data = await getNewcomersPageData(viewer);

  return (
    <NewcomersModule
      data={data}
      demoMode={viewer.is_demo}
      churchId={viewer.church_id}
      permissions={{
        create: hasPermission(viewer.role, "newcomers", "create"),
        update: hasPermission(viewer.role, "newcomers", "update"),
        delete: hasPermission(viewer.role, "newcomers", "delete"),
      }}
    />
  );
}
