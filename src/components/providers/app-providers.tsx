"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          className: "surface border border-[var(--line)] text-[var(--foreground)]",
        }}
      />
    </ThemeProvider>
  );
}
