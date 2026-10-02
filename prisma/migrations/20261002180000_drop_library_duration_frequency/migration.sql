-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LibraryTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'YELLOW',
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    CONSTRAINT "LibraryTask_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LibraryTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LibraryTask" ("group", "id", "label", "order", "parentId", "priority", "section") SELECT "group", "id", "label", "order", "parentId", "priority", "section" FROM "LibraryTask";
DROP TABLE "LibraryTask";
ALTER TABLE "new_LibraryTask" RENAME TO "LibraryTask";
CREATE INDEX "LibraryTask_section_group_idx" ON "LibraryTask"("section", "group");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

