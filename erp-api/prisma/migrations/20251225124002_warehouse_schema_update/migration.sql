/*
  Warnings:

  - A unique constraint covering the columns `[trackingNumber]` on the table `Shipment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "documents" JSONB,
ADD COLUMN     "driverLicense" TEXT,
ADD COLUMN     "driverPhone" TEXT,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "vehicleType" TEXT;

-- AlterTable
ALTER TABLE "WHItem" ADD COLUMN     "labData" JSONB;

-- AlterTable
ALTER TABLE "WHOrder" ADD COLUMN     "notes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_trackingNumber_key" ON "Shipment"("trackingNumber");
