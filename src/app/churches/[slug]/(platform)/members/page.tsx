import { notFound } from "next/navigation";
import { MembersModule } from "@/components/modules/members-module";
import { requireViewer } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getMembersPageData } from "@/lib/services/app-data";

export default async function MembersPage() {
  const viewer = await requireViewer();
  if (!hasPermission(viewer.role, "members", "view")) {
    notFound();
  }

  const data = await getMembersPageData(viewer);

  return (
    <MembersModule
      data={data}
      demoMode={viewer.is_demo}
      churchId={viewer.church_id}
      permissions={{
        create: hasPermission(viewer.role, "members", "create"),
        update: hasPermission(viewer.role, "members", "update"),
        delete: hasPermission(viewer.role, "members", "delete"),
      }}
    />
  );
}
