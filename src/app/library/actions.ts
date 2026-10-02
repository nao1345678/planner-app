"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isPriority, isSection } from "@/lib/constants";

function refresh() {
  revalidatePath("/library");
  revalidatePath("/day/[date]", "page");
}

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const optional = (f: FormData, k: string) => text(f, k) || null;

export async function addLibraryTask(formData: FormData) {
  const label = text(formData, "label");
  const section = text(formData, "section");
  const group = text(formData, "group");
  const priority = text(formData, "priority") || "YELLOW";
  const parentId = optional(formData, "parentId");
  if (!label || !group || !isSection(section) || !isPriority(priority)) return;

  const { _max } = await prisma.libraryTask.aggregate({ _max: { order: true } });
  await prisma.libraryTask.create({
    data: {
      label,
      section,
      group,
      priority,
      parentId,
      order: (_max.order ?? 0) + 1,
    },
  });
  refresh();
}

export async function updateLibraryTask(id: string, formData: FormData) {
  const label = text(formData, "label");
  const priority = text(formData, "priority");
  if (!label || !isPriority(priority)) return;

  await prisma.libraryTask.updateMany({
    where: { id },
    data: {
      label,
      priority,
    },
  });
  refresh();
}

export async function deleteLibraryTask(id: string) {
  await prisma.libraryTask.deleteMany({ where: { id } }); // les sous-tâches suivent (cascade)
  refresh();
}

/** Renomme un groupe et/ou le déplace vers une autre section. */
export async function updateLibraryGroup(section: string, group: string, formData: FormData) {
  const newName = text(formData, "name");
  const newSection = text(formData, "section");
  if (!newName || !isSection(section) || !isSection(newSection)) return;

  await prisma.libraryTask.updateMany({
    where: { section, group },
    data: { group: newName, section: newSection },
  });
  refresh();
}

export async function deleteLibraryGroup(section: string, group: string) {
  if (!isSection(section)) return;
  await prisma.libraryTask.deleteMany({ where: { section, group } });
  refresh();
}
