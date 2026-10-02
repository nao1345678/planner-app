"use client";

import { useState, useTransition } from "react";
import { addFromLibrary } from "@/app/actions";
import { PRIORITY_META, type PriorityKey } from "@/lib/constants";
import type { LibraryGroup } from "@/lib/library";

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function LibraryPicker({
  date,
  section,
  groups,
}: {
  date: string;
  section: string;
  groups: LibraryGroup[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const q = norm(query.trim());
  const visible = groups
    .map((g) => {
      if (!q || norm(g.name).includes(q)) return g;
      const items = g.items.filter(
        (i) => norm(i.label).includes(q) || i.children.some((c) => norm(c.label).includes(q)),
      );
      return { ...g, items };
    })
    .filter((g) => g.items.length > 0);

  function add(input: { ids?: string[]; group?: string }) {
    startTransition(async () => {
      const { added, skipped } = await addFromLibrary(date, section, input);
      setMessage(
        added === 0 && skipped > 0
          ? "Déjà dans la journée."
          : `${added} ajoutée${added > 1 ? "s" : ""}${skipped ? ` (${skipped} déjà présente${skipped > 1 ? "s" : ""})` : ""}.`,
      );
    });
  }

  if (groups.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-sm text-ink underline-offset-2 hover:text-ink hover:underline"
      >
        {open ? "− fermer le répertoire" : "+ depuis le répertoire"}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-xl border border-ink/40 p-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer par groupe ou tâche…"
            className="w-full rounded-full border border-ink/50 bg-transparent px-3 py-1 text-xs outline-none focus:border-ink"
          />
          <p className="min-h-4 text-xs text-ink" aria-live="polite">
            {pending ? "Ajout…" : message}
          </p>

          <div className="max-h-80 space-y-1 overflow-y-auto">
            {visible.map((g) => (
              <details key={g.name} open={q !== ""} className="rounded-xl border border-ink/20 px-2 py-1">
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                  <span className="flex-1">
                    {g.name}
                    <span className="ml-1 font-normal text-ink">
                      ({g.items.length})
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={(e) => {
                      e.preventDefault();
                      add({ group: g.name });
                    }}
                    className="rounded-md border border-ink/60 px-2 py-0.5 text-xs font-normal hover:bg-ink hover:text-paper disabled:opacity-50"
                  >
                    Tout ajouter
                  </button>
                </summary>
                <ul className="mt-1 space-y-0.5 pb-1">
                  {g.items.map((i) => (
                    <li key={i.id}>
                      <Row
                        label={i.label}
                        priority={i.priority}
                        disabled={pending}
                        onAdd={() => add({ ids: [i.id] })}
                      />
                      {i.children.map((c) => (
                        <div key={c.id} className="ml-5">
                          <Row
                            label={c.label}
                            priority={c.priority}
                            disabled={pending}
                            onAdd={() => add({ ids: [c.id] })}
                          />
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            {visible.length === 0 && <p className="px-1 text-sm text-ink">Aucun résultat.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  priority,
  disabled,
  onAdd,
}: {
  label: string;
  priority: string;
  disabled: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink">
      <span title={PRIORITY_META[priority as PriorityKey]?.label}>{PRIORITY_META[priority as PriorityKey]?.dot}</span>
      <span className="flex-1">
        {label}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onAdd}
        aria-label={`Ajouter ${label}`}
        className="rounded px-1.5 text-ink hover:bg-ink/10 disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}
