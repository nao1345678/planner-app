export const PRIORITIES = ["RED", "YELLOW", "GREEN", "BLUE"] as const;
export type PriorityKey = (typeof PRIORITIES)[number];

export const SECTIONS = ["MORNING", "RESET", "TODO", "EVENING", "CREATION", "COUPLE"] as const;
export type SectionKey = (typeof SECTIONS)[number];

export const PRIORITY_META: Record<PriorityKey, { dot: string; label: string }> = {
  RED: { dot: "🔴", label: "Obligatoire" },
  YELLOW: { dot: "🟡", label: "Recommandé" },
  GREEN: { dot: "🟢", label: "Bonus" },
  BLUE: { dot: "🔵", label: "Projet" },
};

export const SECTION_META: Record<SectionKey, { title: string; alwaysVisible: boolean }> = {
  MORNING: { title: "Matin", alwaysVisible: true },
  RESET: { title: "Reset", alwaysVisible: false },
  TODO: { title: "À faire", alwaysVisible: true },
  EVENING: { title: "Soir", alwaysVisible: true },
  CREATION: { title: "Création", alwaysVisible: true },
  COUPLE: { title: "Soirée couple", alwaysVisible: false },
};

export function priorityRank(p: string): number {
  const i = PRIORITIES.indexOf(p as PriorityKey);
  return i === -1 ? 99 : i;
}

export function isPriority(v: string): v is PriorityKey {
  return (PRIORITIES as readonly string[]).includes(v);
}

export function isSection(v: string): v is SectionKey {
  return (SECTIONS as readonly string[]).includes(v);
}
