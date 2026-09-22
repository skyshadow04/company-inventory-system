-- CreateTable
CREATE TABLE "Printer" (
    "printer_id" SERIAL NOT NULL,
    "printer_name" TEXT NOT NULL,
    "entity" TEXT NOT NULL DEFAULT 'Leadership',

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("printer_id")
);

-- CreateTable
CREATE TABLE "PrinterToner" (
    "toner_id" SERIAL NOT NULL,
    "printer_id" INTEGER NOT NULL,
    "toner_name" TEXT NOT NULL,
    "toner_code" TEXT NOT NULL,
    "toner_quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PrinterToner_pkey" PRIMARY KEY ("toner_id")
);

-- CreateTable
CREATE TABLE "PrinterDrum" (
    "drum_id" SERIAL NOT NULL,
    "printer_id" INTEGER NOT NULL,
    "drum_name" TEXT NOT NULL,
    "drum_code" TEXT NOT NULL,
    "drum_quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PrinterDrum_pkey" PRIMARY KEY ("drum_id")
);

-- AddForeignKey
ALTER TABLE "PrinterToner" ADD CONSTRAINT "PrinterToner_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "Printer"("printer_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterDrum" ADD CONSTRAINT "PrinterDrum_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "Printer"("printer_id") ON DELETE CASCADE ON UPDATE CASCADE;
