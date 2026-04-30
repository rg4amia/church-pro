"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function useRealtimeRefresh(tables: string[], label: string, churchId: string) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || tables.length === 0 || !churchId) {
      return;
    }

    const channel = supabase.channel(`live-${label}-${tables.join("-")}`);

    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `church_id=eq.${churchId}` },
        () => {
          router.refresh();
          toast.info(`Mise à jour temps réel: ${label}`);
        },
      );
    });

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [churchId, label, router, tables]);
}
