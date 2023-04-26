/*
  Warnings:

  - You are about to drop the `Odd` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Odd" DROP CONSTRAINT "Odd_apostaId_fkey";

-- AlterTable
ALTER TABLE "Aposta" ADD COLUMN     "odds" FLOAT8[];

-- DropTable
DROP TABLE "Odd";
