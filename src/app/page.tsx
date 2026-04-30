import { redirect } from "next/navigation";
import { getCurrentViewer } from "@/lib/auth";

export default async function RootPage() {
  const viewer = await getCurrentViewer();

  if (!viewer || !viewer.church_slug) {
    redirect("/sign-in");
  }

  redirect(`/churches/${viewer.church_slug}`);
}
