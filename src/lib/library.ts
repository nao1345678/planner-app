import { prisma } from "@/lib/prisma";
import type { SectionKey } from "@/lib/constants";

export type LibraryItem = {
  id: string;
  label: string;
  priority: string;
  children: { id: string; label: string; priority: string }[];
};

export type LibraryGroup = {
  name: string;
  items: LibraryItem[];
};

/** Catalogue d'une section, regroupé par groupe (ordre du fichier d'origine). */
export async function getLibraryGroups(section: SectionKey): Promise<LibraryGroup[]> {
  const rows = await prisma.libraryTask.findMany({
    where: { section },
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });

  const groups = new Map<string, LibraryGroup>();
  const byId = new Map<string, LibraryItem>();

  for (const r of rows) {
    if (r.parentId) continue;
    let g = groups.get(r.group);
    if (!g) groups.set(r.group, (g = { name: r.group, items: [] }));
    const item: LibraryItem = { id: r.id, label: r.label, priority: r.priority, children: [] };
    g.items.push(item);
    byId.set(r.id, item);
  }
  for (const r of rows) {
    if (r.parentId) {
      byId.get(r.parentId)?.children.push({
        id: r.id,
        label: r.label,
        priority: r.priority,
      });
    }
  }
  return [...groups.values()];
}
