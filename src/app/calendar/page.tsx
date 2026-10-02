import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMonth, fromDate, todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function parseMonth(value: string | undefined): { year: number; month: number } {
  const m = value?.match(/^(\d{4})-(\d{2})$/);
  if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12) return { year: Number(m[1]), month: Number(m[2]) };
  const [y, mo] = todayISO().split("-").map(Number);
  return { year: y, month: mo };
}

function monthKey(year: number, month: number) {
  const d = new Date(Date.UTC(year, month - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function cellColor(percent: number | null) {
  if (percent === null) return "bg-white";
  if (percent >= 80) return "bg-emerald-200";
  if (percent >= 50) return "bg-emerald-100";
  if (percent > 0) return "bg-amber-50";
  return "bg-stone-100";
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { year, month } = parseMonth((await searchParams).month);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const next = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // lundi = 0
  const today = todayISO();

  const days = await prisma.day.findMany({
    where: { date: { gte: first, lt: next } },
    include: { tasks: { select: { done: true, priority: true } } },
  });

  type Stat = { percent: number | null; journal: boolean; hardDay: boolean };
  const stats = new Map<string, Stat>(
    days.map((d): [string, Stat] => {
      const tasks = d.hardDay ? d.tasks.filter((t) => t.priority === "RED") : d.tasks;
      const done = tasks.filter((t) => t.done).length;
      return [
        fromDate(d.date),
        {
          percent: tasks.length ? Math.round((done / tasks.length) * 100) : null,
          journal: Boolean(d.journal?.trim()),
          hardDay: d.hardDay,
        },
      ];
    }),
  );

  const cells: (string | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => fromDate(new Date(Date.UTC(year, month - 1, i + 1)))),
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <Link href={`/calendar?month=${monthKey(year, month - 1)}`} className="rounded-lg px-3 py-1 hover:bg-stone-200">
          ←
        </Link>
        <h1 className="text-2xl font-bold capitalize text-stone-900">{formatMonth(year, month)}</h1>
        <Link href={`/calendar?month=${monthKey(year, month + 1)}`} className="rounded-lg px-3 py-1 hover:bg-stone-200">
          →
        </Link>
      </header>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-stone-500">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`empty-${i}`} />;
          const s = stats.get(iso);
          return (
            <Link
              key={iso}
              href={`/day/${iso}`}
              className={`flex aspect-square flex-col justify-between rounded-xl border p-2 text-left hover:border-stone-400 ${cellColor(
                s?.percent ?? null,
              )} ${iso === today ? "border-stone-800" : "border-stone-200"}`}
            >
              <span className="text-sm font-semibold text-stone-800">{Number(iso.slice(8))}</span>
              <span className="text-xs text-stone-600">
                {s?.percent != null ? `${s.percent} %` : ""}
                {s?.journal ? " ✎" : ""}
                {s?.hardDay ? " ♡" : ""}
              </span>
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-stone-500">✎ journal écrit · ♡ journée difficile · couleur = taux de complétion</p>
    </main>
  );
}
