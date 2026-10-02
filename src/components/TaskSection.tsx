import { addTask, deleteTask, toggleTask } from "@/app/actions";
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
}: {
  date: string;
  section: SectionKey;
  tasks: Task[];
}) {
  const sorted = [...tasks].sort(
    (a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.order - b.order,
  );

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold text-stone-800">{SECTION_META[section].title}</h2>

      <ul className="space-y-1">
        {sorted.map((t) => (
          <li key={t.id} className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-stone-50">
            <form action={toggleTask.bind(null, t.id, date)}>
              <button
                type="submit"
                aria-label={t.done ? "Décocher" : "Cocher"}
                className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                  t.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 bg-white"
                }`}
              >
                {t.done ? "✓" : ""}
              </button>
            </form>
            <span title={PRIORITY_META[t.priority as PriorityKey]?.label}>
              {PRIORITY_META[t.priority as PriorityKey]?.dot}
            </span>
            <span className={`flex-1 text-sm ${t.done ? "text-stone-400 line-through" : "text-stone-700"}`}>
              {t.label}
            </span>
            <form action={deleteTask.bind(null, t.id, date)} className="opacity-0 group-hover:opacity-100">
              <button type="submit" aria-label="Supprimer" className="px-1 text-stone-400 hover:text-red-500">
                ×
              </button>
            </form>
          </li>
        ))}
        {sorted.length === 0 && <li className="px-1 text-sm text-stone-400">Rien pour l&apos;instant.</li>}
      </ul>

      <form action={addTask.bind(null, date)} className="mt-3 flex gap-2">
        <input type="hidden" name="section" value={section} />
        <select
          name="priority"
          defaultValue="RED"
          className="rounded-lg border border-stone-200 bg-white px-1 text-sm"
          aria-label="Priorité"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_META[p].dot}
            </option>
          ))}
        </select>
        <input
          name="label"
          required
          placeholder="Ajouter une tâche…"
          className="min-w-0 flex-1 rounded-lg border border-stone-200 px-2 py-1 text-sm outline-none focus:border-stone-400"
        />
        <button type="submit" className="rounded-lg bg-stone-800 px-3 text-sm text-white hover:bg-stone-700">
          +
        </button>
      </form>
    </section>
  );
}
