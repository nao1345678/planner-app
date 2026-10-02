-- CreateTable
CREATE TABLE "LibraryTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'YELLOW',
    "frequency" TEXT,
    "duration" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    CONSTRAINT "LibraryTask_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LibraryTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LibraryTask_section_group_idx" ON "LibraryTask"("section", "group");
