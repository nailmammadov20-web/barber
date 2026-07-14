-- DropForeignKey
ALTER TABLE "BookingService" DROP CONSTRAINT "BookingService_serviceId_fkey";

-- AddForeignKey
ALTER TABLE "BookingService" ADD CONSTRAINT "BookingService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
