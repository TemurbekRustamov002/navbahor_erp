-- Professional Migration: Marka-Specific Toy Numbering
-- This migration fixes the toy numbering system to be marka-specific

BEGIN;

-- Step 1: Add temporary column for new ordering
ALTER TABLE "Toy" ADD COLUMN "new_orderNo" INTEGER;

-- Step 2: Renumber toys within each marka to start from 1
WITH RenumberedToys AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY "markaId" ORDER BY "createdAt") as new_order
  FROM "Toy"
)
UPDATE "Toy" 
SET "new_orderNo" = RenumberedToys.new_order
FROM RenumberedToys 
WHERE "Toy".id = RenumberedToys.id;

-- Step 3: Drop the old orderNo column and rename new one
ALTER TABLE "Toy" DROP COLUMN "orderNo";
ALTER TABLE "Toy" RENAME COLUMN "new_orderNo" TO "orderNo";

-- Step 4: Add the unique constraint for marka-specific numbering
ALTER TABLE "Toy" ADD CONSTRAINT "Toy_markaId_orderNo_key" UNIQUE ("markaId", "orderNo");

-- Step 5: Update QR UIDs to reflect marka-specific numbering
-- Format: MRK{markaNumber}-{orderNo:3d}-QR
UPDATE "Toy" 
SET "qrUid" = CONCAT('MRK', m.number::text, '-', LPAD("Toy"."orderNo"::text, 3, '0'), '-QR')
FROM "Marka" m 
WHERE "Toy"."markaId" = m.id;

COMMIT;

-- Verification queries
-- SELECT m.number as marka_number, t."orderNo", t."qrUid" 
-- FROM "Toy" t 
-- JOIN "Marka" m ON t."markaId" = m.id 
-- ORDER BY m.number, t."orderNo";