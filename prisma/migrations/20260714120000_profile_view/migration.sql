-- CreateTable
CREATE TABLE "ProfileView" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileView_barberId_lastSeenAt_idx" ON "ProfileView"("barberId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileView_barberId_visitorId_key" ON "ProfileView"("barberId", "visitorId");

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "BarberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
