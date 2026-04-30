"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignInForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      document.cookie = "demo-role=ADMIN; path=/; max-age=31536000";
      router.replace("/");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(result.error ?? "Connexion impossible");
        return;
      }

      toast.success("Connexion réussie");
      window.location.href = "/";
    });
  }

  return (
    <Card className="surface-strong w-full max-w-md rounded-[32px] p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Authentification Supabase si la configuration est fournie, sinon bascule automatique en démo.
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Email</label>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Mot de passe</label>
          <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </div>
        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </Card>
  );
}
