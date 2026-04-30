import { notFound } from "next/navigation";
import { CellsModule } from "@/components/modules/cells-module";
import { requireViewer } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getCellsPageData } from "@/lib/services/app-data";

export default async function CellsPage() {
  const viewer = await requireViewer();
  if (!hasPermission(viewer.role, "cells", "view")) {
    notFound();
  }

  const data = await getCellsPageData(viewer);

  return (
    <CellsModule
      data={data}
      demoMode={viewer.is_demo}
      churchId={viewer.church_id}
      permissions={{
        create: hasPermission(viewer.role, "cells", "create"),
        update: hasPermission(viewer.role, "cells", "update"),
        delete: hasPermission(viewer.role, "cells", "delete"),
      }}
    />
  );
}
