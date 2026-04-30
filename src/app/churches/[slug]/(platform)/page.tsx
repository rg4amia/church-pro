import { DashboardModule } from "@/components/modules/dashboard-module";
import { requireViewer } from "@/lib/auth";
import { getDashboardData } from "@/lib/services/app-data";

export default async function DashboardPage() {
  const viewer = await requireViewer();
  const data = await getDashboardData(viewer);

  return <DashboardModule data={data} />;
}
