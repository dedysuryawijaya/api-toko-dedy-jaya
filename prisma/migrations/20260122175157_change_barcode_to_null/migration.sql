-- AlterTable
ALTER TABLE "products" ALTER COLUMN "barcode" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tokens" ALTER COLUMN "deviceId" DROP NOT NULL;
