// Remplit le catalogue LibraryTask à partir de systeme_planner_pour_script.txt.
// Ne touche pas aux RoutineTemplate (ni aux jours existants).
//
//   npx tsx prisma/seed-library.ts           → remplit le catalogue s'il est vide
//   npx tsx prisma/seed-library.ts --reset   → vide le catalogue puis le re-remplit
//                                              (efface les modifications faites dans /library)
//
// Format des lignes d'un groupe :
//   "Label"          tâche de premier niveau, priorité du groupe
//   "Label @G"       priorité propre (R rouge, Y jaune, G bonus, B projet)
//   "> Label"        sous-tâche de la tâche de premier niveau qui précède
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

type P = "RED" | "YELLOW" | "GREEN" | "BLUE";
type S = "MORNING" | "TODO" | "EVENING" | "CREATION" | "COUPLE" | "RESET";
type Group = {
  group: string;
  section: S;
  priority: P;
  items: string[];
};

const PRIORITY_CODE: Record<string, P> = { R: "RED", Y: "YELLOW", G: "GREEN", B: "BLUE" };

const GROUPS: Group[] = [
  // ───────── MATIN ─────────
  {
    group: "Routine du matin", section: "MORNING", priority: "RED",
    items: [
      "Toilettes", "Douche",
      "Skincare matin", "> Acide azélaïque", "> Hydratant",
      "Dents",
      "Cheveux", "> Huile cheveux rapide", "> Coiffer",
      "Maquillage @G",
      "S'habiller", "Parfum", "Bijoux", "Faire le lit",
      "Plantes", "Compléments", "Petit-déjeuner",
    ],
  },
  {
    group: "Sport du matin", section: "MORNING", priority: "YELLOW",
    items: ["10 min renforcement", "10 min cardio en chantant / dansant"],
  },
  {
    group: "Massage lymphatique", section: "MORNING", priority: "GREEN",
    items: ["Massage lymphatique pendant skincare / huile corps"],
  },
  { group: "Boisson", section: "MORNING", priority: "YELLOW", items: ["Iced tea préparé la veille"] },

  // ───────── À FAIRE ─────────
  {
    group: "Session recherche d'emploi 1 h", section: "TODO", priority: "RED",
    items: [
      "Lancer le bot", "Corriger les candidatures générées", "Envoyer les candidatures",
      "Candidatures manuelles", "Lire les mails", "Faire les relances nécessaires",
      "Continuer jusqu'à la fin de l'heure",
    ],
  },
  {
    group: "Alternance", section: "TODO", priority: "YELLOW",
    items: [
      "Rechercher les offres", "Sélectionner les offres pertinentes", "Adapter la candidature",
      "Envoyer", "Suivre", "Relancer",
    ],
  },
  {
    group: "Après la session emploi", section: "TODO", priority: "YELLOW",
    items: ["Candidatures job alimentaire", "Candidatures junior informatique", "Mettre à jour le suivi Excel"],
  },
  {
    group: "Maison — reset quotidien", section: "TODO", priority: "YELLOW",
    items: [
      "Évier vide", "Ranger les objets", "Ranger les surfaces",
      "Ranger l'espace créatif @G", "Ranger la salle de bain @G",
      "Ranger les vêtements", "Linge sale dans le panier", "Ranger les chaussures",
      "Ranger appareils / câbles autour du lit", "Remettre l'appartement en état fonctionnel",
    ],
  },
  {
    group: "Cuisine après cuisson", section: "TODO", priority: "RED",
    items: [
      "Vaisselle", "Essuyer les plans de travail", "Essuyer les surfaces utilisées",
      "Mettre déchets / objets au bon endroit", "Faire tremper la casserole @G",
    ],
  },
  {
    group: "Lessive", section: "TODO", priority: "YELLOW",
    items: ["Lancer une machine", "Étendre le linge le lendemain", "Laisser sécher", "Ranger"],
  },
  { group: "Courses / alimentation", section: "TODO", priority: "YELLOW", items: ["Courses", "Livraison @G"] },
  {
    group: "Meal prep", section: "TODO", priority: "GREEN",
    items: [
      "Confit d'ail", "Persil / menthe", "Congeler les préparations", "Desserts", "Pain / pâte à pizza",
      "Viande", "Mariner la viande", "Congeler la viande", "Granola", "Oat pudding", "Autre préparation utile",
    ],
  },
  {
    group: "Repas plaisir / livraison", section: "TODO", priority: "GREEN",
    items: ["Prévoir un repas plaisir / livraison"],
  },
  {
    group: "Maison — hebdomadaire", section: "TODO", priority: "YELLOW",
    items: [
      "Poussière", "Ranger / trier",
      "Salle de bain", "> Lavabo", "> Carrelage", "> Toilettes", "> Douche",
      "Miroirs", "Changer les draps", "Nettoyer / organiser la chambre",
      "Ranger l'espace ongles", "Ranger les espaces créatifs", "Encens / sauge @G",
    ],
  },
  {
    group: "Soins — quotidien", section: "TODO", priority: "YELLOW",
    items: ["Skincare matin", "Skincare soir", "Huile corps", "Dents", "Huile cheveux"],
  },
  {
    group: "Soins — hebdomadaire", section: "TODO", priority: "GREEN",
    items: ["Routine cheveux complète", "Masque visage"],
  },
  {
    group: "Soins — ponctuels", section: "TODO", priority: "GREEN",
    items: ["Gommage corps", "Henna + amla", "Rasage", "Manucure personnelle", "Pédicure"],
  },
  { group: "Running", section: "TODO", priority: "GREEN", items: ["Running le dimanche", "Running lors d'un déplacement / d'une course"] },
  {
    group: "Permis — code", section: "TODO", priority: "YELLOW",
    items: ["Session de révision", "Séries", "Corriger les erreurs", "Revoir les notions faibles"],
  },

  // ───────── RESET (dimanche / fin de semaine) ─────────
  {
    group: "Dimanche reset", section: "RESET", priority: "YELLOW",
    items: [
      "Running", "Douche", "Shampoing", "Courses / livraison", "Deep clean", "Salle de bain", "Frigo",
      "Rangement", "Meal prep", "Masque visage", "Soin cheveux", "Après-shampoing / masque", "Peinture",
      "Journal", "Temps libre @G",
    ],
  },
  {
    group: "Fin de semaine", section: "RESET", priority: "YELLOW",
    items: [
      "Regarder ce qui a été fait", "Reporter seulement ce qui reste nécessaire",
      "Définir les prochaines actions des projets", "Préparer les priorités de la semaine suivante",
    ],
  },

  // ───────── CRÉATION ─────────
  {
    group: "Création du jour", section: "CREATION", priority: "GREEN",
    items: ["Ongles", "Peinture"],
  },
  {
    group: "Ongles — création personnelle", section: "CREATION", priority: "GREEN",
    items: [
      "Choisir le design", "Préparer le matériel", "Préparer les capsules", "Faire le set",
      "Filmer les étapes intéressantes", "Photographier le résultat", "Ranger le matériel",
    ],
  },
  {
    group: "Ongles — commande cliente", section: "CREATION", priority: "YELLOW",
    items: [
      "Demande", "Paiement", "Préparation", "Manucure / réalisation", "Suivi cliente",
      "Contenu de la commande", "Finition", "Emballage", "Expédition",
    ],
  },
  {
    group: "Contenu TikTok / réseaux", section: "CREATION", priority: "GREEN",
    items: ["Filmer", "Trier les rushs", "Monter une vidéo", "Faire un montage photo", "Poster une vidéo", "Poster une story"],
  },
  {
    group: "Peinture — une toile", section: "CREATION", priority: "GREEN",
    items: [
      "Choisir / préparer le sujet", "Faire le croquis", "Préparer la toile", "Préparer plusieurs toiles",
      "Préparer la palette", "Peindre", "Continuer sur plusieurs jours / semaines", "Terminer",
      "Faire un échantillon de palette", "Tamponner / certificat d'authenticité", "Stocker", "Photographier",
      "Filmer",
    ],
  },
  {
    group: "Print club — essai / journal", section: "CREATION", priority: "GREEN",
    items: ["Choisir l'œuvre", "Écrire l'essai", "Relire", "Préparer le texte"],
  },

  // ───────── SOIR ─────────
  {
    group: "Reset appartement", section: "EVENING", priority: "RED",
    items: [
      "Évier vide", "Ranger les surfaces", "Ranger les objets", "Ranger l'espace créatif @G",
      "Ranger la salle de bain @G", "Ranger les vêtements", "Ranger les chaussures",
      "Ranger câbles / appareils autour du lit", "Lancer une lessive @G",
    ],
  },
  {
    group: "Routine du soir", section: "EVENING", priority: "RED",
    items: [
      "Skincare soir", "> Rétinol", "Huile corps", "Dents", "Préparer l'iced tea pour le lendemain",
      "Se préparer pour le coucher", "Lit avant minuit",
    ],
  },
  {
    group: "Contenu du soir", section: "EVENING", priority: "YELLOW",
    items: ["Trier les rushs", "Monter une vidéo", "Faire un montage photo", "Poster une vidéo", "Poster une story"],
  },
  {
    group: "Temps calme", section: "EVENING", priority: "GREEN",
    items: ["Temps libre", "Série / film", "Activité personnelle"],
  },

  // ───────── PROJETS CARRIÈRE ─────────
  {
    group: "Projet GitHub", section: "TODO", priority: "BLUE",
    items: [
      "Choisir une technologie", "Choisir un projet", "Définir l'objectif", "Définir les fonctionnalités",
      "Créer le dépôt", "Initialiser", "Développer la première fonctionnalité", "Développer les suivantes",
      "Corriger les bugs", "Finaliser", "README", "Captures / démonstration", "Publier",
    ],
  },
  {
    group: "Projets — prochaine action", section: "TODO", priority: "BLUE",
    items: ["Projet 1 — prochaine action concrète", "Projet 2 — prochaine action concrète"],
  },

  // ───────── PETITES ACTIONS ─────────
  {
    group: "Petites actions · 5 min", section: "TODO", priority: "GREEN",
    items: ["Ranger une surface", "Plantes", "Petite action projet", "Trier quelques rushs", "Préparer une étape créative"],
  },
  {
    group: "Petites actions · 10–15 min", section: "TODO", priority: "GREEN",
    items: ["Sport", "Petite action peinture", "Petite action ongles", "Petite action projet", "Petite tâche maison"],
  },
  {
    group: "Petites actions · 20–30 min", section: "TODO", priority: "GREEN",
    items: ["Peindre", "Faire une petite partie d'un set", "Monter une vidéo", "Faire une partie d'un projet", "Tâche maison"],
  },

  // ───────── MODE JOURNÉE DIFFICILE ─────────
  {
    group: "Journée difficile — le minimum", section: "TODO", priority: "RED",
    items: ["Manger", "Hygiène de base", "Dents", "Strict nécessaire dans l'appartement", "UNE tâche importante"],
  },
  {
    group: "Journée difficile — bonus", section: "TODO", priority: "YELLOW",
    items: ["10 min mouvement @G", "20 min création @G"],
  },
];

async function main() {
  const reset = process.argv.includes("--reset");
  const existing = await prisma.libraryTask.count();
  if (existing > 0 && !reset) {
    console.log(`ℹ️  Le catalogue contient déjà ${existing} tâches — rien fait (utiliser --reset pour le refaire).`);
    return;
  }
  if (reset) await prisma.libraryTask.deleteMany();

  let total = 0;
  let order = 0;
  for (const g of GROUPS) {
    let parentId: string | null = null;
    for (const raw of g.items) {
      const isChild = raw.startsWith("> ");
      const m = (isChild ? raw.slice(2) : raw).match(/^(.*?)(?:\s@([RYGB]))?$/)!;
      const created: { id: string } = await prisma.libraryTask.create({
        data: {
          label: m[1],
          section: g.section,
          group: g.group,
          priority: m[2] ? PRIORITY_CODE[m[2]] : g.priority,
          order: order++,
          parentId: isChild ? parentId : null,
        },
      });
      if (!isChild) parentId = created.id;
      total++;
    }
  }
  console.log(`✅ ${total} tâches dans le catalogue (${GROUPS.length} groupes)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
