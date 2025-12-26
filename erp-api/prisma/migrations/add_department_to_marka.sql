-- CreateEnum
CREATE TYPE "MarkaDepartment" AS ENUM ('ARRALI_SEX', 'VALIKLI_SEX', 'UNIVERSAL');

-- AlterTable
ALTER TABLE "Marka" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "department" "MarkaDepartment" NOT NULL DEFAULT 'UNIVERSAL',
ADD COLUMN     "labTestedAt" TIMESTAMP(3),
ADD COLUMN     "labTestedBy" TEXT,
ADD COLUMN     "nextMarkaId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "previousMarkaId" TEXT;

-- DropIndex
DROP INDEX "Marka_number_productType_sex_key";

-- CreateIndex
CREATE UNIQUE INDEX "Marka_number_department_key" ON "Marka"("number", "department");