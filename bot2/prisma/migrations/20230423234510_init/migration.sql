-- CreateEnum
CREATE TYPE "TipoAposta" AS ENUM ('RESULTADO', 'AMBAS_MARCAM', 'EMPATE_ANULA');

-- CreateEnum
CREATE TYPE "Casas" AS ENUM ('ESTRELABET');

-- CreateTable
CREATE TABLE "Aposta" (
    "id" STRING NOT NULL,
    "tipo" "TipoAposta" NOT NULL,
    "info" STRING,
    "jogoId" STRING NOT NULL,

    CONSTRAINT "Aposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Odd" (
    "id" STRING NOT NULL,
    "odd" FLOAT8 NOT NULL,
    "apostaId" STRING NOT NULL,

    CONSTRAINT "Odd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jogo" (
    "id" STRING NOT NULL,
    "casa" STRING NOT NULL,
    "time1" STRING NOT NULL,
    "time2" STRING NOT NULL,

    CONSTRAINT "Jogo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Aposta" ADD CONSTRAINT "Aposta_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "Jogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odd" ADD CONSTRAINT "Odd_apostaId_fkey" FOREIGN KEY ("apostaId") REFERENCES "Aposta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
