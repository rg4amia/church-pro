import { notFound } from "next/navigation";
import { NotificationsModule } from "@/components/modules/notifications-module";
import { requireViewer } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getNotificationsPageData } from "@/lib/services/app-data";

export default async function NotificationsPage() {
  const viewer = await requireViewer();
  if (!hasPermission(viewer.role, "notifications", "view")) {
    notFound();
  }

  const data = await getNotificationsPageData(viewer);

  return (
    <NotificationsModule
      data={data}
      churchId={viewer.church_id}
      demoMode={viewer.is_demo}
      permissions={{
        create: hasPermission(viewer.role, "notifications", "create"),
        update: hasPermission(viewer.role, "notifications", "update"),
        delete: hasPermission(viewer.role, "notifications", "delete"),
      }}
    />
  );
}
