-- CreateTable
CREATE TABLE "AssetHistory" (
    "asset_history_id" SERIAL NOT NULL,
    "asset_history_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asset_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'updated',
    "asset_owner" TEXT NOT NULL,
    "asset_status" TEXT NOT NULL,
    "entity" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "AssetHistory_pkey" PRIMARY KEY ("asset_history_id")
);

-- AddForeignKey
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Assets"("asset_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
