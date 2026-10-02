import { addTask, deleteTask, toggleTask } from "@/app/actions";
import LibraryPicker from "@/components/LibraryPicker";
import type { LibraryGroup } from "@/lib/library";
import { PRIORITIES, PRIORITY_META, SECTION_META, priorityRank, type PriorityKey, type SectionKey } from "@/lib/constants";

type Task = {
  id: string;
  label: string;
  priority: string;
  section: string;
  done: boolean;
  order: number;
};

export default function TaskSection({
  date,
  section,
  tasks,
  library,
}: {
  date: string;
  section: SectionKey;
  tasks: Task[];
  library: LibraryGroup[];
}) {
  const sorted = [...tasks].sort(
    (a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.order - b.order,
  );

  const field = "rounded-full border border-ink/50 bg-transparent px-2 py-1 text-xs outline-none focus:border-ink";

  return (
    <section className="min-h-40 rounded-[40px] border border-ink/60 px-7 py-6">
      <h2 className="mb-3 font-display text-sm font-black uppercase">{SECTION_META[section].title}</h2>

      <ul className="space-y-1">
        {sorted.map((t) => (
          <li key={t.id} className="group flex items-center gap-2 text-xs">
            <form action={toggleTask.bind(null, t.id, date)}>
              <button
                type="submit"
                aria-label={t.done ? "Décocher" : "Cocher"}
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border border-ink text-[9px] leading-none ${
                  t.done ? "bg-ink text-paper" : ""
                }`}
              >
                {t.done ? "✓" : ""}
              </button>
            </form>
            <span className="text-[9px]" title={PRIORITY_META[t.priority as PriorityKey]?.label}>
              {PRIORITY_META[t.priority as PriorityKey]?.dot}
            </span>
            <span className={`flex-1 ${t.done ? "line-through opacity-60" : ""}`}>{t.label}</span>
            <form action={deleteTask.bind(null, t.id, date)} className="opacity-0 group-hover:opacity-100">
              <button type="submit" aria-label="Supprimer" className="px-1 hover:opacity-60">
                ×
              </button>
            </form>
          </li>
        ))}
        {sorted.length === 0 && <li className="text-xs italic opacity-60">Rien pour l&apos;instant.</li>}
      </ul>

      <form action={addTask.bind(null, date)} className="mt-4 flex gap-2">
        <input type="hidden" name="section" value={section} />
        <select name="priority" defaultValue="RED" className={field} aria-label="Priorité">
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_META[p].dot}
            </option>
          ))}
        </select>
        <input name="label" required placeholder="Ajouter une tâche…" className={`${field} min-w-0 flex-1`} />
        <button type="submit" className={`${field} px-3 hover:bg-ink hover:text-paper`}>
          +
        </button>
      </form>

      <LibraryPicker date={date} section={section} groups={library} />
    </section>
  );
}
