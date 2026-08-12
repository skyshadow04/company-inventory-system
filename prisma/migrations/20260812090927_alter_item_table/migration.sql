/*
  Warnings:

  - Added the required column `item_file_link` to the `Items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_file_photo_link` to the `Items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Items" ADD COLUMN     "item_file_link" TEXT NOT NULL,
ADD COLUMN     "item_file_photo_link" TEXT NOT NULL;
