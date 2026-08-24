-- AlterTable
ALTER TABLE "Assets" ADD COLUMN     "entity" TEXT NOT NULL DEFAULT 'Leadership';

-- AlterTable
ALTER TABLE "Items" ADD COLUMN     "entity" TEXT NOT NULL DEFAULT 'Leadership';

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "entity" TEXT NOT NULL DEFAULT 'Leadership';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "entity" TEXT NOT NULL DEFAULT 'Leadership';
