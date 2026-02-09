-- CreateEnum
CREATE TYPE "TimetableType" AS ENUM ('REHEARSAL', 'MAIN');

-- AlterTable
ALTER TABLE "timetable_entries" ADD COLUMN     "type" "TimetableType" NOT NULL DEFAULT 'MAIN';
