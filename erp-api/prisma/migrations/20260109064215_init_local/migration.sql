-- CreateEnum
CREATE TYPE "ToyStatus" AS ENUM ('IN_STOCK', 'RESERVED', 'SHIPPED', 'RETURNED', 'WASTE');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SCANNER';

-- AlterTable
ALTER TABLE "LabResult" ADD COLUMN     "micronaire" DECIMAL(65,30),
ADD COLUMN     "operatorName" TEXT;

-- AlterTable
ALTER TABLE "Toy" ADD COLUMN     "brigade" TEXT,
ADD COLUMN     "status" "ToyStatus" NOT NULL DEFAULT 'IN_STOCK';

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_idx" ON "ActivityLog"("actorId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityId_idx" ON "ActivityLog"("entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "Toy_status_idx" ON "Toy"("status");

-- CreateIndex
CREATE INDEX "Toy_labStatus_idx" ON "Toy"("labStatus");

-- CreateIndex
CREATE INDEX "Toy_readyForWarehouse_idx" ON "Toy"("readyForWarehouse");
