-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE', 'SALES', 'ACCOUNTANT', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "MarkaStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('TOLA', 'LINT', 'SIKLON', 'ULUK');

-- CreateEnum
CREATE TYPE "LabGrade" AS ENUM ('OLIY', 'YAXSHI', 'ORTA', 'ODDIY', 'IFLOS');

-- CreateEnum
CREATE TYPE "LabStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WHStatus" AS ENUM ('QORALAMA', 'MIJOZ_TANLANGAN', 'TARKIB_TANLANGAN', 'TSD_CHECKLIST', 'YUKLASH_TAYYOR', 'YUKLANDI');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('DRAFT', 'READY', 'SCANNED', 'APPROVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tin" TEXT,
    "address" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marka" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "productType" "ProductType" NOT NULL,
    "sex" TEXT,
    "selection" TEXT,
    "ptm" TEXT,
    "status" "MarkaStatus" NOT NULL DEFAULT 'DRAFT',
    "showOnScale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Toy" (
    "id" TEXT NOT NULL,
    "qrUid" TEXT NOT NULL,
    "markaId" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "orderNo" INTEGER NOT NULL,
    "brutto" DECIMAL(65,30) NOT NULL,
    "tara" DECIMAL(65,30) NOT NULL,
    "netto" DECIMAL(65,30) NOT NULL,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "labStatus" "LabStatus" NOT NULL DEFAULT 'PENDING',
    "readyForWarehouse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Toy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "toyId" TEXT NOT NULL,
    "moisture" DECIMAL(65,30) NOT NULL,
    "trash" DECIMAL(65,30) NOT NULL,
    "navi" INTEGER NOT NULL,
    "grade" "LabGrade" NOT NULL,
    "strength" DECIMAL(65,30) NOT NULL,
    "lengthMm" DECIMAL(65,30) NOT NULL,
    "comment" TEXT,
    "status" "LabStatus" NOT NULL DEFAULT 'PENDING',
    "showToWarehouse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WHOrder" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "WHStatus" NOT NULL DEFAULT 'QORALAMA',
    "customerId" TEXT,
    "customerName" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WHOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WHItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "toyId" TEXT NOT NULL,
    "markaId" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "orderNo" INTEGER NOT NULL,
    "netto" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WHItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WHChecklist" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WHChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WHChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "toyId" TEXT NOT NULL,
    "scanned" BOOLEAN NOT NULL DEFAULT false,
    "scannedAt" TIMESTAMP(3),

    CONSTRAINT "WHChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "vehicleNo" TEXT,
    "driverName" TEXT,
    "forwarder" TEXT,
    "destinationAddress" TEXT,
    "plannedDate" TIMESTAMP(3),
    "loadedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" BIGSERIAL NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "diff" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tin_key" ON "Customer"("tin");

-- CreateIndex
CREATE UNIQUE INDEX "Marka_number_productType_key" ON "Marka"("number", "productType");

-- CreateIndex
CREATE UNIQUE INDEX "Toy_qrUid_key" ON "Toy"("qrUid");

-- CreateIndex
CREATE UNIQUE INDEX "LabResult_toyId_key" ON "LabResult"("toyId");

-- CreateIndex
CREATE UNIQUE INDEX "WHOrder_number_key" ON "WHOrder"("number");

-- CreateIndex
CREATE UNIQUE INDEX "WHItem_orderId_toyId_key" ON "WHItem"("orderId", "toyId");

-- CreateIndex
CREATE UNIQUE INDEX "WHChecklist_orderId_key" ON "WHChecklist"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "WHChecklist_code_key" ON "WHChecklist"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WHChecklistItem_checklistId_toyId_key" ON "WHChecklistItem"("checklistId", "toyId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

-- AddForeignKey
ALTER TABLE "Toy" ADD CONSTRAINT "Toy_markaId_fkey" FOREIGN KEY ("markaId") REFERENCES "Marka"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_toyId_fkey" FOREIGN KEY ("toyId") REFERENCES "Toy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WHItem" ADD CONSTRAINT "WHItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "WHOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WHChecklist" ADD CONSTRAINT "WHChecklist_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "WHOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WHChecklistItem" ADD CONSTRAINT "WHChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "WHChecklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "WHOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
