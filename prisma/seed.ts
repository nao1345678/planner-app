// Remplit les routines de référence du planner A5.
// Lancer avec :  npx tsx prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

type P = "RED" | "YELLOW" | "GREEN" | "BLUE";
type S = "MORNING" | "TODO" | "EVENING" | "CREATION" | "COUPLE" | "RESET";
type Item = { label: string; priority: P; section: S };

// Lundi → samedi
const WEEKDAY: Item[] = [
  { section: "MORNING", priority: "RED", label: "Routine du matin" },
  { section: "MORNING", priority: "RED", label: "Petit-déjeuner" },
  { section: "MORNING", priority: "YELLOW", label: "Sport 10 min" },
  { section: "MORNING", priority: "GREEN", label: "Massage lymphatique" },
  { section: "EVENING", priority: "RED", label: "Reset appartement" },
  { section: "EVENING", priority: "RED", label: "Routine du soir" },
  { section: "EVENING", priority: "RED", label: "Dents" },
  { section: "EVENING", priority: "RED", label: "Lit à minuit" },
  { section: "CREATION", priority: "GREEN", label: "Ongles" },
  { section: "CREATION", priority: "GREEN", label: "Peinture" },
  { section: "CREATION", priority: "GREEN", label: "Repos" },
];

// Mercredi en plus
const WEDNESDAY: Item[] = [{ section: "COUPLE", priority: "YELLOW", label: "Soirée intentionnelle" }];

// Dimanche — Sunday reset
const SUNDAY: Item[] = [
  { section: "MORNING", priority: "RED", label: "Running" },
  { section: "MORNING", priority: "RED", label: "Douche + shampoing" },
  { section: "MORNING", priority: "RED", label: "Courses / livraison" },
  { section: "RESET", priority: "RED", label: "Grand ménage" },
  { section: "RESET", priority: "RED", label: "Salle de bain" },
  { section: "RESET", priority: "RED", label: "Frigo" },
  { section: "RESET", priority: "YELLOW", label: "Meal prep" },
  { section: "RESET", priority: "YELLOW", label: "Masque visage" },
  { section: "RESET", priority: "YELLOW", label: "Soin cheveux" },
  { section: "CREATION", priority: "YELLOW", label: "Peinture" },
  { section: "CREATION", priority: "YELLOW", label: "Journal" },
  { section: "CREATION", priority: "GREEN", label: "Temps libre" },
];

async function main() {
  const rows: (Item & { weekday: number })[] = [];
  for (let weekday = 1; weekday <= 6; weekday++) {
    for (const item of WEEKDAY) rows.push({ ...item, weekday });
    if (weekday === 3) for (const item of WEDNESDAY) rows.push({ ...item, weekday });
  }
  for (const item of SUNDAY) rows.push({ ...item, weekday: 0 });

  await prisma.routineTemplate.deleteMany();
  // Insertion une par une pour conserver l'ordre d'affichage.
  for (const row of rows) await prisma.routineTemplate.create({ data: row });

  console.log(`✅ ${rows.length} routines enregistrées`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
