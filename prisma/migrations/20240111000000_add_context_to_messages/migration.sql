-- AlterTable
ALTER TABLE "Message" ADD COLUMN "context" TEXT;
ALTER TABLE "Message" ALTER COLUMN "id" SET DATA TYPE INT;
ALTER TABLE "Message" ALTER COLUMN "id" SET DEFAULT nextval('message_id_seq');
