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
  if (percent === null) return "bg-transparent";
  if (percent >= 80) return "bg-ink/30";
  if (percent >= 50) return "bg-ink/20";
  if (percent > 0) return "bg-ink/10";
  return "bg-ink/5";
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
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-8 md:px-16">
      <header className="flex items-center justify-between">
        <Link href={`/calendar?month=${monthKey(year, month - 1)}`} className="rounded-full border border-ink/60 px-3 py-1 hover:bg-ink hover:text-paper">
          ←
        </Link>
        <h1 className="font-display text-3xl font-black capitalize">{formatMonth(year, month)}</h1>
        <Link href={`/calendar?month=${monthKey(year, month + 1)}`} className="rounded-full border border-ink/60 px-3 py-1 hover:bg-ink hover:text-paper">
          →
        </Link>
      </header>

      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase">
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
              className={`flex aspect-square flex-col justify-between rounded-2xl border p-2 text-left hover:border-ink ${cellColor(
                s?.percent ?? null,
              )} ${iso === today ? "border-ink border-2" : "border-ink/40"}`}
            >
              <span className="font-display text-sm font-black">{Number(iso.slice(8))}</span>
              <span className="text-[10px]">
                {s?.percent != null ? `${s.percent} %` : ""}
                {s?.journal ? " ✎" : ""}
                {s?.hardDay ? " ♡" : ""}
              </span>
            </Link>
          );
        })}
      </div>

      <p className="text-[10px] italic">✎ journal écrit · ♡ journée difficile · couleur = taux de complétion</p>
    </main>
  );
}
