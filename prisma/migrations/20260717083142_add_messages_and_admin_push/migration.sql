-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('BARBER', 'ADMIN');

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "body" TEXT NOT NULL,
    "readByBarber" BOOLEAN NOT NULL DEFAULT false,
    "readByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminPushSubscription" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_barberId_createdAt_idx" ON "Message"("barberId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminPushSubscription_endpoint_key" ON "AdminPushSubscription"("endpoint");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "BarberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminPushSubscription" ADD CONSTRAINT "AdminPushSubscription_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
