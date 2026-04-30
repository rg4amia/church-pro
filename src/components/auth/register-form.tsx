"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nom, setNom] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function handleNomChange(value: string) {
    setNom(value);
    if (!slugEdited) {
      setSlug(toSlug(value));
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/churches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, slug, email, password }),
      });

      const result = (await response.json()) as { slug?: string; error?: string };

      if (!response.ok) {
        toast.error(result.error ?? "Erreur lors de la création");
        return;
      }

      toast.success("Église créée avec succès");
      router.replace(`/churches/${result.slug}`);
    });
  }

  return (
    <Card className="surface-strong w-full max-w-md rounded-[32px] p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Créer votre église</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Enregistrez votre église en quelques secondes.
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Nom de l'église</label>
          <Input
            value={nom}
            onChange={(e) => handleNomChange(e.target.value)}
            type="text"
            placeholder="Église Grâce Abidjan"
            required
            minLength={2}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Identifiant URL (slug)</label>
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
            type="text"
            placeholder="grace-abidjan"
            pattern="[a-z0-9-]+"
            required
            minLength={2}
          />
          <p className="text-xs text-[var(--muted)]">
            Votre espace sera accessible à{" "}
            <span className="font-mono">/churches/{slug || "votre-slug"}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Email administrateur</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Mot de passe</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={8}
          />
        </div>

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Création en cours..." : "Créer mon église"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Déjà inscrit ?{" "}
        <Link href="/sign-in" className="font-semibold underline underline-offset-2">
          Se connecter
        </Link>
      </p>
    </Card>
  );
}
