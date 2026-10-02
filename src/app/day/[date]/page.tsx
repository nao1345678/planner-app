import Link from "next/link";
import { notFound } from "next/navigation";
import TaskSection from "@/components/TaskSection";
import { getLibraryGroups } from "@/lib/library";
import { getOrCreateDay } from "@/lib/days";
import { addDays, formatLong, isValidISO, todayISO } from "@/lib/dates";
import { SECTIONS, SECTION_META } from "@/lib/constants";
import { goToDate, saveJournal, toggleHardDay } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!isValidISO(date)) notFound();

  const day = await getOrCreateDay(date);
  const today = todayISO();

  // Mode journée difficile : on ne garde que le minimum 🔴
  const tasks = day.hardDay ? day.tasks.filter((t) => t.priority === "RED") : day.tasks;
  const done = tasks.filter((t) => t.done).length;
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const visibleSections = SECTIONS.filter(
    (s) => SECTION_META[s].alwaysVisible || tasks.some((t) => t.section === s),
  );

  const libraries = await Promise.all(visibleSections.map((s) => getLibraryGroups(s)));

  const field = "rounded-full border border-ink/60 bg-transparent px-3 py-1 text-xs outline-none focus:border-ink";
  const pill = "rounded-full border border-ink/60 px-3 py-1 text-xs uppercase hover:bg-ink hover:text-paper";

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-8 md:px-16">
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] italic">Coucou, voici notre to-do du</p>
          <h1 className="font-display text-3xl font-black first-letter:capitalize">{formatLong(date)}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs uppercase">
          <Link href={`/day/${addDays(date, -1)}`} className="hover:underline">
            ⟵ Veille
          </Link>
          <Link href={`/day/${addDays(date, 1)}`} className="hover:underline">
            Lendemain ⟶
          </Link>
          {date !== today && (
            <Link href={`/day/${today}`} className="normal-case underline">
              Revenir à aujourd&apos;hui
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form action={goToDate} className="flex gap-2">
            <input type="date" name="date" defaultValue={date} className={field} />
            <button type="submit" className={pill}>
              Aller
            </button>
          </form>

          <form action={toggleHardDay.bind(null, date)}>
            <button type="submit" className={`${pill} ${day.hardDay ? "bg-ink text-paper" : ""}`}>
              {day.hardDay ? "Journée difficile : activée" : "Journée difficile"}
            </button>
          </form>
        </div>

        <div className="max-w-md">
          <div className="mb-1 flex justify-between text-xs">
            <span>
              {done} / {tasks.length} tâches
            </span>
            <span>{percent} %</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full border border-ink/60">
            <div className="h-full bg-ink transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {day.hardDay && (
          <p className="max-w-xl text-sm italic">
            Aujourd&apos;hui, on ne rattrape rien. Le minimum suffit — le lendemain n&apos;est pas une journée de
            rattrapage.
          </p>
        )}
      </header>

      <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
        {visibleSections.map((s, i) => (
          <TaskSection key={s} date={date} section={s} tasks={tasks.filter((t) => t.section === s)} library={libraries[i]} />
        ))}
      </div>

      <section className="rounded-[40px] border border-ink/60 px-7 py-6">
        <h2 className="mb-3 font-display text-sm font-black uppercase">Journal</h2>
        <form action={saveJournal.bind(null, date)} className="space-y-3">
          <textarea
            key={day.journal ?? ""}
            name="journal"
            defaultValue={day.journal ?? ""}
            rows={5}
            placeholder="Comment s'est passée la journée ?"
            className="w-full rounded-2xl border border-ink/40 bg-transparent p-3 text-sm outline-none focus:border-ink"
          />
          <button type="submit" className={pill}>
            Enregistrer
          </button>
        </form>
      </section>
    </main>
  );
}
