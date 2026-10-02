# Planner

Application web de mon planner papier A5 : une to-do list quotidienne, un calendrier et un journal. Chaque jour est enregistré en base, ce qui garde un historique consultable.

## Fonctionnalités

- **Vue Jour** : sections Matin / À faire / Soir / Création (+ Reset le dimanche, Soirée couple le mercredi), priorités 🔴 obligatoire · 🟡 recommandé · 🟢 bonus · 🔵 projet.
- **Routines automatiques** : chaque nouveau jour est pré-rempli à partir de modèles selon le jour de la semaine.
- **Mode journée difficile** : n'affiche que le minimum 🔴.
- **Journal** quotidien.
- **Calendrier** mensuel avec le taux de complétion de chaque jour.

## Stack

Next.js (App Router, Server Actions) · TypeScript · Tailwind CSS · Prisma 7 · SQLite

## Lancer le projet

```bash
npm install
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

Puis ouvrir http://localhost:3000.

## Feuille de route

- [ ] Vue semaine : objectifs et bilan de fin de semaine
- [ ] Modules projets (peinture, Print Club, GitHub)
- [ ] Suivi des sessions de recherche d'emploi
- [ ] Déploiement (Vercel + PostgreSQL)
