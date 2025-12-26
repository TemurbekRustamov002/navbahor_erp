/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Customer` table. All the data in the column will be lost.
  - The `sex` column on the `Marka` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[number,department]` on the table `Marka` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[markaId,orderNo]` on the table `Toy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `department` to the `Marka` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SexType" AS ENUM ('ARRALI', 'VALIKLI', 'UNIVERSAL');

-- CreateEnum
CREATE TYPE "MarkaDepartment" AS ENUM ('ARRALI_SEX', 'VALIKLI_SEX', 'UNIVERSAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'OPERATOR';
ALTER TYPE "Role" ADD VALUE 'LAB_ANALYST';
ALTER TYPE "Role" ADD VALUE 'WAREHOUSE_MANAGER';
ALTER TYPE "Role" ADD VALUE 'PRODUCTION_MANAGER';
ALTER TYPE "Role" ADD VALUE 'CUSTOMER_MANAGER';
ALTER TYPE "Role" ADD VALUE 'SALES_MANAGER';

-- DropIndex
DROP INDEX "Marka_number_productType_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "updatedAt",
ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "director" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "mfo" TEXT,
ADD COLUMN     "oked" TEXT;

-- AlterTable
ALTER TABLE "Marka" ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 220,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "department" "MarkaDepartment" NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pickingType" TEXT,
ADD COLUMN     "used" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "sex",
ADD COLUMN     "sex" "SexType";

-- CreateTable
CREATE TABLE "CustomerReport" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reportData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDocument" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScaleConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" "MarkaDepartment" NOT NULL,
    "comPort" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "tolerance" DECIMAL(65,30) NOT NULL DEFAULT 0.1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScaleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScaleReading" (
    "id" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isStable" BOOLEAN NOT NULL DEFAULT true,
    "toyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScaleReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScaleConfig_name_department_key" ON "ScaleConfig"("name", "department");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX "Customer_tin_idx" ON "Customer"("tin");

-- CreateIndex
CREATE UNIQUE INDEX "Marka_number_department_key" ON "Marka"("number", "department");

-- CreateIndex
CREATE UNIQUE INDEX "Toy_markaId_orderNo_key" ON "Toy"("markaId", "orderNo");

-- AddForeignKey
ALTER TABLE "CustomerReport" ADD CONSTRAINT "CustomerReport_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WHOrder" ADD CONSTRAINT "WHOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleReading" ADD CONSTRAINT "ScaleReading_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "ScaleConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
