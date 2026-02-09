-- CreateEnum
CREATE TYPE "MemoType" AS ENUM ('MEMO', 'MESSAGE');

-- AlterTable
ALTER TABLE "project_memos" ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "type" "MemoType" NOT NULL DEFAULT 'MEMO';
