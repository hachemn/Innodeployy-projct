-- CreateEnum
CREATE TYPE "GitProvider" AS ENUM ('GITHUB', 'GITLAB', 'BITBUCKET');

-- CreateTable
CREATE TABLE "Repository" (
    "id" SERIAL NOT NULL,
    "provider" "GitProvider" NOT NULL,
    "url" TEXT NOT NULL,
    "branch" TEXT NOT NULL DEFAULT 'main',
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_projectId_key" ON "Repository"("projectId");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
