import Link from "next/link";
import { notFound } from "next/navigation";
import TaskSection from "@/components/TaskSection";
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

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/day/${addDays(date, -1)}`} className="rounded-lg px-3 py-1 hover:bg-stone-200">
            ← Veille
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold capitalize text-stone-900">{formatLong(date)}</h1>
            {date !== today && (
              <Link href={`/day/${today}`} className="text-sm text-stone-500 underline">
                Revenir à aujourd&apos;hui
              </Link>
            )}
          </div>
          <Link href={`/day/${addDays(date, 1)}`} className="rounded-lg px-3 py-1 hover:bg-stone-200">
            Lendemain →
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <form action={goToDate} className="flex gap-2">
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm"
            />
            <button type="submit" className="rounded-lg border border-stone-300 px-3 text-sm hover:bg-stone-100">
              Aller
            </button>
          </form>

          <form action={toggleHardDay.bind(null, date)}>
            <button
              type="submit"
              className={`rounded-lg px-3 py-1 text-sm ${
                day.hardDay ? "bg-rose-100 text-rose-700" : "border border-stone-300 hover:bg-stone-100"
              }`}
            >
              {day.hardDay ? "Mode journée difficile : activé" : "Mode journée difficile"}
            </button>
          </form>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm text-stone-500">
            <span>
              {done} / {tasks.length} tâches
            </span>
            <span>{percent} %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {day.hardDay && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            Aujourd&apos;hui, on ne rattrape rien. Le minimum suffit — le lendemain n&apos;est pas une journée de
            rattrapage.
          </p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleSections.map((s) => (
          <TaskSection key={s} date={date} section={s} tasks={tasks.filter((t) => t.section === s)} />
        ))}
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-stone-800">📓 Journal</h2>
        <form action={saveJournal.bind(null, date)} className="space-y-2">
          <textarea
            key={day.journal ?? ""}
            name="journal"
            defaultValue={day.journal ?? ""}
            rows={5}
            placeholder="Comment s'est passée la journée ?"
            className="w-full rounded-lg border border-stone-200 p-2 text-sm outline-none focus:border-stone-400"
          />
          <button type="submit" className="rounded-lg bg-stone-800 px-4 py-1 text-sm text-white hover:bg-stone-700">
            Enregistrer
          </button>
        </form>
      </section>
    </main>
  );
}
