-- AlterTable
ALTER TABLE "ScaleConfig" ADD COLUMN     "connectionStatus" TEXT DEFAULT 'disconnected',
ADD COLUMN     "lastHeartbeat" TIMESTAMP(3),
ADD COLUMN     "settings" JSONB;
