-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxQuantity" INTEGER;

-- AlterTable
ALTER TABLE "Selection" ADD COLUMN     "note" TEXT;

-- CreateIndex
CREATE INDEX "MenuItem_menuId_isArchived_idx" ON "MenuItem"("menuId", "isArchived");
