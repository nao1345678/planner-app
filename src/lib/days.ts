import { prisma } from "@/lib/prisma";
import { toDate, weekdayOf } from "@/lib/dates";

const include = {
  tasks: { orderBy: [{ order: "asc" as const }, { id: "asc" as const }] },
};

/**
 * Renvoie le jour demandé avec ses tâches.
 * S'il n'existe pas encore, il est créé à partir des routines (RoutineTemplate)
 * du jour de la semaine correspondant : c'est la « mémoire » du planner.
 */
export async function getOrCreateDay(iso: string) {
  const date = toDate(iso);

  const existing = await prisma.day.findUnique({ where: { date }, include });
  if (existing) return existing;

  const templates = await prisma.routineTemplate.findMany({
    where: { OR: [{ weekday: weekdayOf(iso) }, { weekday: null }] },
  });

  try {
    return await prisma.day.create({
      data: {
        date,
        tasks: {
          create: templates.map((t, i) => ({
            label: t.label,
            priority: t.priority,
            section: t.section,
            order: i,
          })),
        },
      },
      include,
    });
  } catch (err) {
    // Deux requêtes simultanées ont pu créer le jour en même temps.
    const again = await prisma.day.findUnique({ where: { date }, include });
    if (again) return again;
    throw err;
  }
}
