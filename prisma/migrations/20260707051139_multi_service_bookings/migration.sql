-- CreateTable
CREATE TABLE "BookingService" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,

    CONSTRAINT "BookingService_pkey" PRIMARY KEY ("id")
);

-- AlterTable: add durationMinutes to Booking (temporary default to satisfy NOT NULL during backfill)
ALTER TABLE "Booking" ADD COLUMN "durationMinutes" INTEGER NOT NULL DEFAULT 30;

-- Backfill Booking.durationMinutes from the (soon to be removed) single-service relation
UPDATE "Booking" b
SET "durationMinutes" = s."durationMinutes"
FROM "Service" s
WHERE b."serviceId" = s.id;

-- Backfill BookingService rows from existing Booking.serviceId before dropping it
INSERT INTO "BookingService" ("id", "bookingId", "serviceId", "name", "price", "durationMinutes")
SELECT md5(random()::text || clock_timestamp()::text || b.id), b.id, b."serviceId", s.name, s.price, s."durationMinutes"
FROM "Booking" b
JOIN "Service" s ON s.id = b."serviceId"
WHERE b."serviceId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_serviceId_fkey";

-- AlterTable: remove the old single-service column now that data is preserved in BookingService
ALTER TABLE "Booking" DROP COLUMN "serviceId";

-- CreateIndex
CREATE UNIQUE INDEX "BookingService_bookingId_serviceId_key" ON "BookingService"("bookingId", "serviceId");

-- AddForeignKey
ALTER TABLE "BookingService" ADD CONSTRAINT "BookingService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingService" ADD CONSTRAINT "BookingService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
