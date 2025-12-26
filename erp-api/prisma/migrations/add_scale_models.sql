-- CreateTable
CREATE TABLE "ScaleConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" "MarkaDepartment" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectionStatus" TEXT NOT NULL DEFAULT 'disconnected',
    "lastHeartbeat" TIMESTAMP(3),
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScaleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScaleReading" (
    "id" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "weight" DECIMAL(65,30) NOT NULL,
    "isStable" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "markaId" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "ScaleReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScaleConfig_name_key" ON "ScaleConfig"("name");

-- CreateIndex
CREATE INDEX "ScaleReading_scaleId_timestamp_idx" ON "ScaleReading"("scaleId", "timestamp");

-- AddForeignKey
ALTER TABLE "ScaleReading" ADD CONSTRAINT "ScaleReading_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "ScaleConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;