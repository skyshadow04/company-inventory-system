-- CreateTable
CREATE TABLE "Items" (
    "item_id" SERIAL NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_price" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_delivery_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Items_pkey" PRIMARY KEY ("item_id")
);
