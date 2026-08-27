-- CreateTable
CREATE TABLE "EtisalatBill" (
    "etisalat_bill_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "etisalat_bill_entity" TEXT NOT NULL DEFAULT '',
    "etisalat_bill_month" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etisalat_bill_status" TEXT NOT NULL DEFAULT 'unpaid',

    CONSTRAINT "EtisalatBill_pkey" PRIMARY KEY ("etisalat_bill_id")
);

-- AddForeignKey
ALTER TABLE "EtisalatBill" ADD CONSTRAINT "EtisalatBill_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
