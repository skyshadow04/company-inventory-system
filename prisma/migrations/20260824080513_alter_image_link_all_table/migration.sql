-- AlterTable
ALTER TABLE "Assets" ALTER COLUMN "asset_image_link" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Items" ALTER COLUMN "item_file_link" SET DEFAULT '',
ALTER COLUMN "item_file_photo_link" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "entity" SET DEFAULT '';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image_link" SET DEFAULT 'https://u1ziwjw0vor3e4ce.public.blob.vercel-storage.com/profile/default-pfp.png';
