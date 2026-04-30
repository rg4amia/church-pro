"use client";

export type EntityKey =
  | "members"
  | "cells"
  | "services"
  | "newcomers"
  | "departments"
  | "inventory"
  | "sermons"
  | "notifications";

async function request<T>(entity: EntityKey, method: "POST" | "PUT" | "DELETE", body: Record<string, unknown>) {
  const response = await fetch(`/api/entities/${entity}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ error: "Erreur inattendue" }))) as {
      error?: string;
    };
    throw new Error(payload.error ?? "La requête a échoué");
  }

  if (method === "DELETE") {
    return null as T;
  }

  return (await response.json()) as T;
}

export function createEntity<T>(entity: EntityKey, payload: Record<string, unknown>) {
  return request<T>(entity, "POST", { payload });
}

export function updateEntity<T>(entity: EntityKey, id: string, payload: Record<string, unknown>) {
  return request<T>(entity, "PUT", { id, payload });
}

export function deleteEntity(entity: EntityKey, id: string) {
  return request<null>(entity, "DELETE", { id });
}
