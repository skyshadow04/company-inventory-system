-- CreateTable
CREATE TABLE "Assets" (
    "asset_id" SERIAL NOT NULL,
    "asset_name" TEXT NOT NULL,
    "asset_serial_number" TEXT NOT NULL DEFAULT '',
    "asset_owner" TEXT NOT NULL,
    "asset_status" TEXT NOT NULL DEFAULT 'Used',
    "asset_type" TEXT NOT NULL,
    "asset_image_link" TEXT NOT NULL DEFAULT 'https://u1ziwjw0vor3e4ce.public.blob.vercel-storage.com/Signed%20Quotation/Logo%20Image.jpg',

    CONSTRAINT "Assets_pkey" PRIMARY KEY ("asset_id")
);
