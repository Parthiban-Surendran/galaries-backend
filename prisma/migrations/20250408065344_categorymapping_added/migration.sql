-- CreateTable
CREATE TABLE "CategoryMapping" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER NOT NULL DEFAULT 6,
    "childId" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "CategoryMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryMapping_parentId_childId_key" ON "CategoryMapping"("parentId", "childId");

-- AddForeignKey
ALTER TABLE "CategoryMapping" ADD CONSTRAINT "CategoryMapping_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryMapping" ADD CONSTRAINT "CategoryMapping_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Category"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;
