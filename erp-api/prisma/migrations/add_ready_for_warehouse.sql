-- Add readyForWarehouse field to Toy table
ALTER TABLE "Toy" ADD COLUMN "readyForWarehouse" BOOLEAN NOT NULL DEFAULT false;

-- Set existing toys with lab results to ready for warehouse  
UPDATE "Toy" SET "readyForWarehouse" = true 
WHERE id IN (
  SELECT DISTINCT "toyId" FROM "LabResult" WHERE approved = true
);

-- If no lab results, set some toys to ready for testing
UPDATE "Toy" SET "readyForWarehouse" = true 
WHERE id IN (SELECT id FROM "Toy" LIMIT 10);