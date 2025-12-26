-- Fix markalar showOnScale field - set to true where null
UPDATE "Marka" 
SET "showOnScale" = true 
WHERE "showOnScale" IS NULL AND "status" = 'ACTIVE';

-- Check results
SELECT id, number, "productType", status, "showOnScale" 
FROM "Marka" 
WHERE status = 'ACTIVE' 
ORDER BY number;