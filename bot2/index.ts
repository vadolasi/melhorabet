import { PrismaClient, Jogo, Aposta, Prisma	 } from "@prisma/client"
import { compareTwoStrings } from "string-similarity"

function calcularSurebet2(valorTotal: number, odd1: number, odd2: number): { lucro: number, valorAposta1: number, valorAposta2: number } {
  const prob1 = 1 / odd1
  const prob2 = 1 / odd2

  const somaProbabilidades = prob1 + prob2
  const percentualAposta1 = prob2 / somaProbabilidades
  const percentualAposta2 = prob1 / somaProbabilidades

  const valorAposta1 = Number((valorTotal * percentualAposta1).toFixed(2))
  const valorAposta2 = Number((valorTotal * percentualAposta2).toFixed(2))

  const possivelLucro = valorTotal / somaProbabilidades

  const lucro = Number((possivelLucro - valorTotal).toFixed(2))

  return { lucro, valorAposta1, valorAposta2 }
}

function calcularSurebet3(valorTotal: number, odd1: number, odd2: number, odd3: number): { lucro: number, valorAposta1: number, valorAposta2: number, valorAposta3: number } {
  const prob1 = 1 / odd1
  const prob2 = 1 / odd2
  const prob3 = 1 / odd3

  const somaProbabilidades = prob1 + prob2 + prob3
  const percentualAposta1 = prob2 * prob3 / somaProbabilidades
  const percentualAposta2 = prob1 * prob3 / somaProbabilidades
  const percentualAposta3 = prob1 * prob2 / somaProbabilidades

  const valorAposta1 = Number((valorTotal * percentualAposta1).toFixed(2))
  const valorAposta2 = Number((valorTotal * percentualAposta2).toFixed(2))
  const valorAposta3 = Number((valorTotal * percentualAposta3).toFixed(2))

  const possivelLucro = valorTotal / somaProbabilidades

  const lucro = Number((possivelLucro - valorTotal).toFixed(2))

  return { lucro, valorAposta1, valorAposta2, valorAposta3 }
}

const prisma = new PrismaClient()

async function main() {
  const groups: (Jogo & { apostas: Aposta[] })[][] = []

  const jogos = await prisma.jogo.findMany({
    where: {
      data: {
        gte: new Date()
      }
    },
    include: {
      apostas: true
    }
  })

  jogo1: for (let i = 0; i < jogos.length; i++) {
    const jogo = jogos[i]

    const group = [jogo]

    jogo2: for (let j = i + 1; j < jogos.length; j++) {
      const jogo2 = jogos[j]

      if (jogo.casa === jogo2.casa) {
        continue jogo2
      }

      if (compareTwoStrings(jogo.time1.toLocaleLowerCase(), jogo2.time1.toLocaleLowerCase()) > 0.75 && compareTwoStrings(jogo.time2.toLowerCase(), jogo2.time2.toLowerCase()) > 0.75 && Math.abs(jogo.data.getTime() - jogo2.data.getTime()) < 1000 * 60 * 60) {
        group.push(jogo2)
      }
    }

    if (group.length > 1) {
      groups.push(group)
    }
  }

  for (const group of groups) {
    const combinations2: [(Jogo & { apostas: Aposta[] }), (Jogo & { apostas: Aposta[] })][] = []

    for (let i = 0; i < group.length; i++) {
      const jogo = group[i]

      for (let j = i + 1; j < group.length; j++) {
        const jogo2 = group[j]

        combinations2.push([jogo, jogo2])
      }
    }

    const combinations3: [(Jogo & { apostas: Aposta[] }), (Jogo & { apostas: Aposta[] }), (Jogo & { apostas: Aposta[] })][] = []

    for (let i = 0; i < group.length; i++) {
      const jogo = group[i]

      for (let j = i + 1; j < group.length; j++) {
        const jogo2 = group[j]

        for (let k = j + 1; k < group.length; k++) {
          const jogo3 = group[k]

          combinations3.push([jogo, jogo2, jogo3])
        }
      }
    }

    for (const combination of combinations2) {
      const sortedCombination = combination.sort((a, b) => a.casa.localeCompare(b.casa))

      const jogo1 = sortedCombination[0]
      const jogo2 = sortedCombination[1]

      const odds1AmbasMarcam = jogo1.apostas.find(aposta => aposta.tipo === "AMBAS_MARCAM")?.odds || [0, 0]
      const odds2AmbasMarcam = jogo2.apostas.find(aposta => aposta.tipo === "AMBAS_MARCAM")?.odds || [0, 0]

      if (calcularSurebet2(100, odds1AmbasMarcam[0], odds2AmbasMarcam[1]).lucro > 0) {
        const lucro = calcularSurebet2(100, odds1AmbasMarcam[0], odds2AmbasMarcam[1]).lucro
        console.log(jogo1.time1, jogo1.time2, odds1AmbasMarcam[0], odds2AmbasMarcam[1], lucro)
      } else if (calcularSurebet2(100, odds1AmbasMarcam[1], odds2AmbasMarcam[0]).lucro > 0) {
        const lucro = calcularSurebet2(100, odds1AmbasMarcam[1], odds2AmbasMarcam[0]).lucro
        console.log(jogo1.time1, jogo1.time2, odds1AmbasMarcam[1], odds2AmbasMarcam[0], lucro)
      }

      for (const aposta of jogo1.apostas) {
        if (aposta.tipo === "TOTAL_GOLS") {
          const value = (aposta.info as any).value as number
          const odds1 = aposta.odds

          const apostasJogo2 = jogo2.apostas.filter(aposta => aposta.tipo === "TOTAL_GOLS" && (aposta.info as any).value === value)

          for (const apostaJogo2 of apostasJogo2) {
            const odds2 = apostaJogo2.odds

            if (calcularSurebet2(100, odds1[0], odds2[1]).lucro > 0) {
              const lucro = calcularSurebet2(100, odds1[0], odds2[1]).lucro
              console.log(`casa1: ${jogo1.casa}, casa2: ${jogo2.casa}
time1: ${jogo1.time1}, time2: ${jogo1.time2}
valor: ${value}
odds1: ${odds1[0]}, odds2: ${odds2[1]}
data: ${jogo1.data.toLocaleDateString()}, hora: ${jogo1.data.toLocaleTimeString()}
lucro: ${lucro}`)
            } else if (calcularSurebet2(100, odds1[1], odds2[0]).lucro > 0) {
              const lucro = calcularSurebet2(100, odds1[1], odds2[0]).lucro
              console.log(jogo1.time1, jogo1.time2, odds1[1], odds2[0], lucro)
            }
          }
        }
      }
    }

    for (const combination of combinations3) {
      const sortedCombination = combination.sort((a, b) => a.casa.localeCompare(b.casa))

      const jogo1 = sortedCombination[0]
      const jogo2 = sortedCombination[1]
      const jogo3 = sortedCombination[2]

      const odds1Resultado = jogo1.apostas.find(aposta => aposta.tipo === "RESULTADO")?.odds
      const odds2Resultado = jogo2.apostas.find(aposta => aposta.tipo === "RESULTADO")?.odds
      const odds3Resultado = jogo3.apostas.find(aposta => aposta.tipo === "RESULTADO")?.odds

      if (calcularSurebet3(100, odds1Resultado?.[0] ?? 0, odds2Resultado?.[1] ?? 0, odds3Resultado?.[2] ?? 0).lucro > 0) {
        console.log(0)
        console.log(jogo1.casa, jogo2.casa, jogo3.casa)
        const lucro = calcularSurebet3(100, odds1Resultado?.[0] ?? 0, odds2Resultado?.[1] ?? 0, odds3Resultado?.[2] ?? 0).lucro
        console.log(jogo1.time1, jogo1.time2, odds1Resultado?.[0] ?? 0, odds2Resultado?.[1] ?? 0, odds3Resultado?.[2] ?? 0, lucro)
      } else if (calcularSurebet3(100, odds1Resultado?.[0] ?? 0, odds2Resultado?.[2] ?? 0, odds3Resultado?.[1] ?? 0).lucro > 0) {
        console.log(1)
        console.log(jogo1.casa, jogo2.casa, jogo3.casa)
        const lucro = calcularSurebet3(100, odds1Resultado?.[0] ?? 0, odds2Resultado?.[2] ?? 0, odds3Resultado?.[1] ?? 0).lucro
        console.log(jogo1.time1, jogo1.time2, odds1Resultado?.[0] ?? 0, odds2Resultado?.[2] ?? 0, odds3Resultado?.[1] ?? 0, lucro)
      } else if (calcularSurebet3(100, odds1Resultado?.[1] ?? 0, odds2Resultado?.[0] ?? 0, odds3Resultado?.[2] ?? 0).lucro > 0) {
        console.log(2)
        console.log(jogo1.casa, jogo2.casa, jogo3.casa)
        const lucro = calcularSurebet3(100, odds1Resultado?.[1] ?? 0, odds2Resultado?.[0] ?? 0, odds3Resultado?.[2] ?? 0).lucro
        console.log(jogo1.time1, jogo1.time2, odds1Resultado?.[1] ?? 0, odds2Resultado?.[0] ?? 0, odds3Resultado?.[2] ?? 0, lucro)
      } else if (calcularSurebet3(100, odds1Resultado?.[1] ?? 0, odds2Resultado?.[2] ?? 0, odds3Resultado?.[0] ?? 0).lucro > 0) {
        console.log(3)
        console.log(jogo1.casa, jogo2.casa, jogo3.casa)
        const lucro = calcularSurebet3(100, odds1Resultado?.[1] ?? 0, odds2Resultado?.[2] ?? 0, odds3Resultado?.[0] ?? 0).lucro
        console.log(jogo1.time1, jogo1.time2, jogo2.time1, jogo2.time2, jogo3.time1, jogo3.time2, odds1Resultado?.[1] ?? 0, odds2Resultado?.[2] ?? 0, odds3Resultado?.[0] ?? 0, lucro)
      } else if (calcularSurebet3(100, odds1Resultado?.[2] ?? 0, odds2Resultado?.[0] ?? 0, odds3Resultado?.[1] ?? 0).lucro > 0) {
        console.log(4)
        console.log(jogo1.casa, jogo2.casa, jogo3.casa)
        const lucro = calcularSurebet3(100, odds1Resultado?.[2] ?? 0, odds2Resultado?.[0] ?? 0, odds3Resultado?.[1] ?? 0).lucro
        console.log(jogo1.time1, jogo1.time2, jogo2.time1, jogo2.time2, jogo3.time1, jogo3.time2, odds1Resultado?.[2] ?? 0, odds2Resultado?.[0] ?? 0, odds3Resultado?.[1] ?? 0, lucro)
      } else if (calcularSurebet3(100, odds1Resultado?.[2] ?? 0, odds2Resultado?.[1] ?? 0, odds3Resultado?.[0] ?? 0).lucro > 0) {
        console.log(5)
        console.log(jogo1.casa, jogo2.casa, jogo3.casa)
        const lucro = calcularSurebet3(100, odds1Resultado?.[2] ?? 0, odds2Resultado?.[1] ?? 0, odds3Resultado?.[0] ?? 0).lucro
        console.log(jogo1.time1, jogo1.time2, jogo2.time1, jogo2.time2, jogo3.time1, jogo3.time2, odds1Resultado?.[2] ?? 0, odds2Resultado?.[1] ?? 0, odds3Resultado?.[0] ?? 0, lucro)
      }
    }
  }
}

main()
  .then(() => process.exit(0))
