import { prisma } from "@/lib/prisma";
import {
  PRIORITIES,
  PRIORITY_META,
  SECTIONS,
  SECTION_META,
  type SectionKey,
} from "@/lib/constants";
import {
  addLibraryTask,
  deleteLibraryGroup,
  deleteLibraryTask,
  updateLibraryGroup,
  updateLibraryTask,
} from "./actions";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof prisma.libraryTask.findMany>>[number];

const input = "rounded-full border border-ink/50 bg-transparent px-3 py-1 text-xs outline-none focus:border-ink";
const btn = "rounded-full border border-ink/60 px-3 py-1 text-xs uppercase hover:bg-ink hover:text-paper";

function PrioritySelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select name="priority" defaultValue={defaultValue} aria-label="Priorité" className={input}>
      {PRIORITIES.map((p) => (
        <option key={p} value={p}>
          {PRIORITY_META[p].dot} {PRIORITY_META[p].label}
        </option>
      ))}
    </select>
  );
}

function TaskRow({ task, child }: { task: Row; child?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-1 ${child ? "ml-6" : ""}`}>
      <form action={updateLibraryTask.bind(null, task.id)} className="flex flex-1 flex-wrap items-center gap-1">
        <input name="label" required defaultValue={task.label} aria-label="Libellé" className={`${input} min-w-40 flex-1`} />
        <PrioritySelect defaultValue={task.priority} />
        <button type="submit" className={btn}>
          OK
        </button>
      </form>
      <form action={deleteLibraryTask.bind(null, task.id)}>
        <button type="submit" aria-label={`Supprimer ${task.label}`} className="px-1  hover:opacity-60">
          ×
        </button>
      </form>
    </div>
  );
}

export default async function LibraryPage() {
  const rows = await prisma.libraryTask.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] });

  const bySection = new Map<SectionKey, Map<string, Row[]>>();
  for (const r of rows) {
    const s = r.section as SectionKey;
    const groups = bySection.get(s) ?? new Map<string, Row[]>();
    groups.set(r.group, [...(groups.get(r.group) ?? []), r]);
    bySection.set(s, groups);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-8 md:px-16">
      <header>
        <h1 className="font-display text-3xl font-black">Répertoire</h1>
        <p className="text-sm ">
          Le catalogue des tâches possibles. Rien n&apos;arrive dans une journée tant que tu ne l&apos;y ajoutes pas
          (bouton « + depuis le répertoire » dans la vue Jour). {rows.length} tâches.
        </p>
      </header>

      {SECTIONS.map((section) => {
        const groups = bySection.get(section) ?? new Map<string, Row[]>();
        return (
          <section key={section} className="space-y-3">
            <h2 className="font-display text-sm font-black uppercase">{SECTION_META[section].title}</h2>

            {[...groups.entries()].map(([name, items]) => {
              const top = items.filter((i) => !i.parentId);
              return (
                <details key={name} className="rounded-[28px] border border-ink/60 px-5 py-3">
                  <summary className="cursor-pointer font-medium ">
                    {name} <span className="font-normal ">({top.length})</span>
                  </summary>

                  <div className="mt-3 space-y-2">
                    <form
                      action={updateLibraryGroup.bind(null, section, name)}
                      className="flex flex-wrap items-center gap-1 rounded-2xl border border-ink/20 p-2"
                    >
                      <input name="name" required defaultValue={name} aria-label="Nom du groupe" className={`${input} flex-1`} />
                      <select name="section" defaultValue={section} aria-label="Section" className={input}>
                        {SECTIONS.map((s) => (
                          <option key={s} value={s}>
                            {SECTION_META[s].title}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className={btn}>
                        Renommer / déplacer
                      </button>
                    </form>
                    <form action={deleteLibraryGroup.bind(null, section, name)}>
                      <button type="submit" className="text-xs  hover:opacity-60">
                        Supprimer tout le groupe
                      </button>
                    </form>

                    {top.map((t) => (
                      <div key={t.id} className="space-y-1">
                        <TaskRow task={t} />
                        {items.filter((c) => c.parentId === t.id).map((c) => (
                          <TaskRow key={c.id} task={c} child />
                        ))}
                        <details className="ml-6">
                          <summary className="cursor-pointer text-xs ">+ sous-tâche</summary>
                          <form action={addLibraryTask} className="mt-1 flex gap-1">
                            <input type="hidden" name="section" value={section} />
                            <input type="hidden" name="group" value={name} />
                            <input type="hidden" name="parentId" value={t.id} />
                            <input type="hidden" name="priority" value={t.priority} />
                            <input name="label" required placeholder="Sous-tâche…" className={`${input} flex-1`} />
                            <button type="submit" className={btn}>
                              +
                            </button>
                          </form>
                        </details>
                      </div>
                    ))}

                    <form action={addLibraryTask} className="flex flex-wrap gap-1 border-t border-ink/20 pt-2">
                      <input type="hidden" name="section" value={section} />
                      <input type="hidden" name="group" value={name} />
                      <input name="label" required placeholder="Nouvelle tâche dans ce groupe…" className={`${input} min-w-40 flex-1`} />
                      <PrioritySelect defaultValue="YELLOW" />
                      <button type="submit" className={btn}>
                        Ajouter
                      </button>
                    </form>
                  </div>
                </details>
              );
            })}

            <details className="rounded-[28px] border border-dashed border-ink/50 px-5 py-3">
              <summary className="cursor-pointer text-sm ">+ nouveau groupe</summary>
              <form action={addLibraryTask} className="mt-2 flex flex-wrap gap-1">
                <input type="hidden" name="section" value={section} />
                <input name="group" required placeholder="Nom du groupe" className={`${input} w-48`} />
                <input name="label" required placeholder="Première tâche…" className={`${input} min-w-40 flex-1`} />
                <PrioritySelect defaultValue="YELLOW" />
                <button type="submit" className={btn}>
                  Créer
                </button>
              </form>
            </details>
          </section>
        );
      })}
    </main>
  );
}
