-- AlterTable
ALTER TABLE "project_memos" ADD COLUMN     "confirmedBy" TEXT[] DEFAULT ARRAY[]::TEXT[];
