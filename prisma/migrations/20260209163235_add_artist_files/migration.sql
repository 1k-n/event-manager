-- CreateTable
CREATE TABLE "artist_files" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artist_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "artist_files" ADD CONSTRAINT "artist_files_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
