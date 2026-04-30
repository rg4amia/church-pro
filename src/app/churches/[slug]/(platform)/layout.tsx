import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { requireViewer } from "@/lib/auth";

export default async function PlatformLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const [viewer, { slug }] = await Promise.all([requireViewer(), params]);

  if (viewer.church_slug && viewer.church_slug !== slug) {
    redirect(`/churches/${viewer.church_slug}`);
  }

  return <AppShell viewer={viewer}>{children}</AppShell>;
}
