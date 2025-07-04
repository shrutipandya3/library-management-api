/*
  Warnings:

  - You are about to drop the column `fine` on the `book_borrowers` table. All the data in the column will be lost.
  - Added the required column `charge` to the `book_borrowers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "book_borrowers" DROP COLUMN "fine",
ADD COLUMN     "charge" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "returnDate" DROP NOT NULL;
