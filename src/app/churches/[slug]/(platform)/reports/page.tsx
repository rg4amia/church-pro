import { notFound } from "next/navigation";
import { ReportsModule } from "@/components/modules/reports-module";
import { requireViewer } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getReportsPageData } from "@/lib/services/app-data";

export default async function ReportsPage() {
  const viewer = await requireViewer();
  if (!hasPermission(viewer.role, "reports", "view")) {
    notFound();
  }

  const data = await getReportsPageData(viewer);

  return <ReportsModule data={data}
      churchId={viewer.church_id} />;
}
