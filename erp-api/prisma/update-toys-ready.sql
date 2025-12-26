-- Set existing toys to ready for warehouse testing
UPDATE "Toy" SET "readyForWarehouse" = true WHERE id IN (
  SELECT id FROM "Toy" LIMIT 10
);

-- Check results
SELECT id, "orderNo", "netto", "readyForWarehouse" FROM "Toy" 
WHERE "readyForWarehouse" = true LIMIT 5;