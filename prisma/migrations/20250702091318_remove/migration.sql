/*
  Warnings:

  - The values [RETURN_DELAY] on the enum `BorrowStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BorrowStatus_new" AS ENUM ('BORROWED', 'RETURNED');
ALTER TABLE "book_borrowers" ALTER COLUMN "status" TYPE "BorrowStatus_new" USING ("status"::text::"BorrowStatus_new");
ALTER TYPE "BorrowStatus" RENAME TO "BorrowStatus_old";
ALTER TYPE "BorrowStatus_new" RENAME TO "BorrowStatus";
DROP TYPE "BorrowStatus_old";
COMMIT;
