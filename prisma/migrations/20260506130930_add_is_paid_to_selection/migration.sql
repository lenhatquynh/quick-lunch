-- AlterTable
ALTER TABLE "Selection" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Selection_personName_idx" ON "Selection"("personName");

-- CreateIndex
CREATE INDEX "Selection_isPaid_idx" ON "Selection"("isPaid");
