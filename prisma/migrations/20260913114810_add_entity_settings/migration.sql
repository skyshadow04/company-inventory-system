-- CreateTable
CREATE TABLE "EntitySettings" (
    "id" SERIAL NOT NULL,
    "entity" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'ocean',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntitySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EntitySettings_entity_key" ON "EntitySettings"("entity");
