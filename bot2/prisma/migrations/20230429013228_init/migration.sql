-- CreateEnum
CREATE TYPE "TipoAposta" AS ENUM ('RESULTADO', 'AMBAS_MARCAM', 'EMPATE_ANULA');

-- CreateEnum
CREATE TYPE "Casas" AS ENUM ('ESTRELABET', 'PLAYPIX', 'F12BET');

-- CreateTable
CREATE TABLE "Aposta" (
    "id" STRING NOT NULL,
    "tipo" "TipoAposta" NOT NULL,
    "info" JSONB NOT NULL DEFAULT '{}',
    "odds" FLOAT8[],
    "jogoId" STRING NOT NULL,

    CONSTRAINT "Aposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jogo" (
    "id" STRING NOT NULL,
    "casa" STRING NOT NULL,
    "time1" STRING NOT NULL,
    "time2" STRING NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApostaToSurebet" (
    "id" STRING NOT NULL,
    "apostaId" STRING NOT NULL,
    "surebetId" STRING NOT NULL,
    "selectedOddIndex" INT4 NOT NULL,

    CONSTRAINT "ApostaToSurebet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Surebet" (
    "id" STRING NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "lucro" FLOAT8 NOT NULL,

    CONSTRAINT "Surebet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Aposta" ADD CONSTRAINT "Aposta_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "Jogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApostaToSurebet" ADD CONSTRAINT "ApostaToSurebet_apostaId_fkey" FOREIGN KEY ("apostaId") REFERENCES "Aposta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApostaToSurebet" ADD CONSTRAINT "ApostaToSurebet_surebetId_fkey" FOREIGN KEY ("surebetId") REFERENCES "Surebet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
