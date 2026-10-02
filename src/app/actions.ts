"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateDay } from "@/lib/days";
import { isValidISO, toDate } from "@/lib/dates";
import { isPriority, isSection } from "@/lib/constants";

function refresh(date: string) {
  revalidatePath(`/day/${date}`);
  revalidatePath("/calendar");
}

export async function toggleTask(id: string, date: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return;
  await prisma.task.update({ where: { id }, data: { done: !task.done } });
  refresh(date);
}

export async function deleteTask(id: string, date: string) {
  await prisma.task.deleteMany({ where: { id } });
  refresh(date);
}

export async function addTask(date: string, formData: FormData) {
  if (!isValidISO(date)) return;
  const label = String(formData.get("label") ?? "").trim();
  const priority = String(formData.get("priority") ?? "");
  const section = String(formData.get("section") ?? "");
  if (!label || !isPriority(priority) || !isSection(section)) return;

  const day = await getOrCreateDay(date);
  const { _max } = await prisma.task.aggregate({
    where: { dayId: day.id },
    _max: { order: true },
  });

  await prisma.task.create({
    data: { label, priority, section, order: (_max.order ?? 0) + 1, dayId: day.id },
  });
  refresh(date);
}

/**
 * Ajoute au jour des tâches du répertoire : soit des tâches précises (`ids`),
 * soit tout un groupe de la section (`group`, tâches de premier niveau).
 * Les tâches déjà présentes dans la section (même libellé) sont ignorées pour
 * ne pas surcharger la journée si on clique deux fois.
 */
export async function addFromLibrary(
  date: string,
  section: string,
  input: { ids?: string[]; group?: string },
): Promise<{ added: number; skipped: number }> {
  if (!isValidISO(date) || !isSection(section)) return { added: 0, skipped: 0 };

  const rows = input.group
    ? await prisma.libraryTask.findMany({
        where: { section, group: input.group, parentId: null },
        include: { parent: true },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      })
    : await prisma.libraryTask.findMany({
        where: { section, id: { in: input.ids ?? [] } },
        include: { parent: true },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      });

  const candidates = rows.map((r) => ({
    label: r.parent ? `${r.parent.label} › ${r.label}` : r.label,
    priority: r.priority,
  }));
  if (candidates.length === 0) return { added: 0, skipped: 0 };

  const day = await getOrCreateDay(date);
  const present = new Set(day.tasks.filter((t) => t.section === section).map((t) => t.label));
  const toAdd = candidates.filter((c) => !present.has(c.label));

  if (toAdd.length > 0) {
    const { _max } = await prisma.task.aggregate({ where: { dayId: day.id }, _max: { order: true } });
    const start = (_max.order ?? 0) + 1;
    await prisma.task.createMany({
      data: toAdd.map((c, i) => ({ ...c, section, order: start + i, dayId: day.id })),
    });
    refresh(date);
  }
  return { added: toAdd.length, skipped: candidates.length - toAdd.length };
}

export async function saveJournal(date: string, formData: FormData) {
  if (!isValidISO(date)) return;
  const journal = String(formData.get("journal") ?? "");
  await prisma.day.update({ where: { date: toDate(date) }, data: { journal } });
  refresh(date);
}

export async function toggleHardDay(date: string) {
  if (!isValidISO(date)) return;
  const day = await prisma.day.findUnique({ where: { date: toDate(date) } });
  if (!day) return;
  await prisma.day.update({ where: { id: day.id }, data: { hardDay: !day.hardDay } });
  refresh(date);
}

export async function goToDate(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  if (isValidISO(date)) redirect(`/day/${date}`);
}
