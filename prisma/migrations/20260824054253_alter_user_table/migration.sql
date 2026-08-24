/*
  Warnings:

  - A unique constraint covering the columns `[company_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "company_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_company_number_key" ON "User"("company_number");
