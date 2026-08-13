/*
  Warnings:

  - Added the required column `supplier_id` to the `Items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Items" ADD COLUMN     "item_description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "item_quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "item_serial_number" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "supplier_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;
