"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CrudValue = string | number | boolean | null;

export interface CrudField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "textarea" | "select" | "number" | "time" | "url" | "checkbox" | "datetime-local";
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  step?: number;
}

export interface CrudColumn<T> {
  label: string;
  className?: string;
  render: (record: T) => React.ReactNode;
}

export interface CrudFilter {
  name: string;
  label: string;
  options: Array<{ label: string; value: string }>;
}

export interface CrudTableProps<T extends { id: string }> {
  title: string;
  description?: string;
  storageKey: string;
  demoMode: boolean;
  records: T[];
  columns: CrudColumn<T>[];
  fields: CrudField[];
  searchKeys: string[];
  filters?: CrudFilter[];
  emptyValues: Record<string, CrudValue>;
  note?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onCreate: (values: Record<string, CrudValue>) => Promise<T> | T;
  onUpdate: (record: T, values: Record<string, CrudValue>) => Promise<T> | T;
  onDelete?: ((record: T) => Promise<void> | void) | undefined;
}

function renderFieldValue(field: CrudField, value: CrudValue, onChange: (next: CrudValue) => void) {
  if (field.type === "textarea") {
    return (
      <Textarea
        value={String(value ?? "")}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <Select value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
        <option value="">Sélectionner...</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-sm">
        <input
          checked={Boolean(value)}
          type="checkbox"
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{field.placeholder ?? field.label}</span>
      </label>
    );
  }

  return (
    <Input
      type={field.type}
      value={field.type === "number" && typeof value === "number" ? String(value) : String(value ?? "")}
      placeholder={field.placeholder}
      min={field.min}
      step={field.step}
      onChange={(event) =>
        onChange(field.type === "number" ? Number(event.target.value || 0) : event.target.value)
      }
    />
  );
}

export function CrudTable<T extends { id: string }>({
  title,
  description,
  storageKey,
  demoMode,
  records,
  columns,
  fields,
  searchKeys,
  filters = [],
  emptyValues,
  note,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  onCreate,
  onUpdate,
  onDelete,
}: CrudTableProps<T>) {
  const [items, setItems] = useState(records);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    Object.fromEntries(filters.map((filter) => [filter.name, ""])),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<Record<string, CrudValue>>(emptyValues);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (demoMode) {
        const cached = window.localStorage.getItem(storageKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as T[];
            setItems(parsed);
            return;
          } catch {
            window.localStorage.removeItem(storageKey);
          }
        }
      }

      setItems(records);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [demoMode, records, storageKey]);

  useEffect(() => {
    if (demoMode) {
      const cached = window.localStorage.getItem(storageKey);
      if (!cached) {
        window.localStorage.setItem(storageKey, JSON.stringify(items));
      }
    }
  }, [demoMode, items, storageKey]);

  const filteredItems = useMemo(() => {
    const queryValue = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        !queryValue ||
        searchKeys.some((key) => String((item as Record<string, unknown>)[key] ?? "").toLowerCase().includes(queryValue));

      const matchesFilters = filters.every((filter) => {
        const selectedValue = filterValues[filter.name];
        if (!selectedValue) {
          return true;
        }

        return String((item as Record<string, unknown>)[filter.name] ?? "") === selectedValue;
      });

      return matchesQuery && matchesFilters;
    });
  }, [filterValues, filters, items, query, searchKeys]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function openCreate() {
    setEditingRecord(null);
    setFormValues(emptyValues);
    setModalOpen(true);
  }

  function openEdit(record: T) {
    setEditingRecord(record);
    setFormValues(record as unknown as Record<string, CrudValue>);
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingRecord) {
        const updatedRecord = await onUpdate(editingRecord, formValues);
        setItems((current) => current.map((item) => (item.id === editingRecord.id ? updatedRecord : item)));
        toast.success(`${title} mis à jour`);
      } else {
        const createdRecord = await onCreate(formValues);
        setItems((current) => [createdRecord, ...current]);
        toast.success(`${title} ajouté`);
      }

      setModalOpen(false);
      setFormValues(emptyValues);
      setEditingRecord(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  }

  async function handleDelete(record: T) {
    if (!onDelete) {
      return;
    }

    const confirmed = window.confirm("Confirmer la suppression ?");
    if (!confirmed) {
      return;
    }

    try {
      await onDelete(record);
      setItems((current) => current.filter((item) => item.id !== record.id));
      toast.success("Suppression effectuée");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible");
    }
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{title}</h2>
          {description ? <p className="text-sm text-[var(--muted)]">{description}</p> : null}
        </div>
        {canCreate ? (
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,220px))]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            className="pl-11"
            placeholder="Recherche rapide..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {filters.map((filter) => (
          <div key={filter.name}>
            <Select
              value={filterValues[filter.name] ?? ""}
              onChange={(event) =>
                setFilterValues((current) => ({ ...current, [filter.name]: event.target.value }))
              }
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>

      {note ? <p className="text-sm leading-6 text-[var(--muted)]">{note}</p> : null}

      {filteredItems.length === 0 ? (
        <EmptyState
          title="Aucun élément trouvé"
          description="Ajustez les filtres ou ajoutez un nouvel enregistrement pour alimenter ce module."
          action={canCreate ? <Button onClick={openCreate}>Créer un enregistrement</Button> : undefined}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[28px] border border-[var(--line)] lg:block">
            <table className="min-w-full divide-y divide-[var(--line)]">
              <thead className="bg-white/40 text-left text-xs uppercase tracking-[0.24em] text-[var(--muted)] dark:bg-white/4">
                <tr>
                  {columns.map((column) => (
                    <th key={column.label} className={cn("px-5 py-4 font-semibold", column.className)}>
                      {column.label}
                    </th>
                  ))}
                  {(canEdit || canDelete) ? <th className="px-5 py-4 text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-sm">
                {paginatedItems.map((record) => (
                  <tr key={record.id} className="bg-transparent">
                    {columns.map((column) => (
                      <td key={column.label} className={cn("px-5 py-4 align-top", column.className)}>
                        {column.render(record)}
                      </td>
                    ))}
                    {(canEdit || canDelete) ? (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {canEdit ? (
                            <Button variant="ghost" type="button" onClick={() => openEdit(record)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {canDelete ? (
                            <Button variant="ghost" type="button" onClick={() => void handleDelete(record)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {paginatedItems.map((record) => (
              <Card key={record.id} className="space-y-3 rounded-[24px]">
                {columns.map((column) => (
                  <div key={column.label}>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{column.label}</p>
                    <div className="mt-1 text-sm">{column.render(record)}</div>
                  </div>
                ))}
                {(canEdit || canDelete) ? (
                  <div className="flex justify-end gap-2 pt-2">
                    {canEdit ? (
                      <Button variant="secondary" type="button" onClick={() => openEdit(record)}>
                        Modifier
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button variant="ghost" type="button" onClick={() => void handleDelete(record)}>
                        Supprimer
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
            <p>
              {formatCount(filteredItems.length)} résultat(s) • page {currentPage}/{pageCount}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" type="button" onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Précédent
              </Button>
              <Button variant="secondary" type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
                Suivant
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        title={editingRecord ? `Modifier ${title.toLowerCase()}` : `Ajouter ${title.toLowerCase()}`}
        description="Complétez les champs puis enregistrez."
        onClose={() => setModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={cn(field.type === "textarea" ? "md:col-span-2" : undefined)}>
                <label className="mb-2 block text-sm font-semibold">{field.label}</label>
                {renderFieldValue(field, formValues[field.name] ?? null, (next) =>
                  setFormValues((current) => ({ ...current, [field.name]: next })),
                )}
                {field.description ? (
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{field.description}</p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

function formatCount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}
