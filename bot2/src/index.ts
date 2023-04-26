import { chromium } from "playwright-extra"
import type { BrowserContext, Page } from "playwright"
import stealth from "puppeteer-extra-plugin-stealth"
import { compareTwoStrings } from "string-similarity"
import { createHash } from "crypto"
import { PrismaClient } from "@prisma/client"
import TelegramBot from "node-telegram-bot-api"

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true })

const prisma = new PrismaClient()

function getHash(str: string) {
  return createHash("md5").update(str).digest("hex")
}

chromium.use(stealth())

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

const args = [
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-speech-api",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
  "--disable-accelerated-2d-canvas",
  "--disable-gpu"
]

const block_resources = [
  "image",
  "media ",
  "font",
  "texttrack",
  "eventsource",
  "manifest",
  "other"
]

interface Bet {
  casa: "estrelabet" | "playpix" | "f12" | "betano" | "melhorabet"
  date: Date
  team1: string
  team2: string
  ambasMarcam: [number, number]
  resultado: [number, number, number]
}

async function setupEstrelabet(context: BrowserContext) {
  const page = await context.newPage()
  await page.route("**/*", (route) => {
    return block_resources.includes(route.request().resourceType())
      ? route.abort()
      : route.continue()
  })
  await page.goto("https://estrelabet.com/ptb/bet/today-events/soccer", { waitUntil: "networkidle" })
  await page.click("#container-main > app-today-events > div > div.week-time-container > div > div.modul-content > div.time-country-other > div.time.left > div.range-container.left > div > span:nth-child(8)", { force: true, trial: true })

  return page
}

async function setupPlaypix(context: BrowserContext) {
  const page = await context.newPage()
  await page.route("**/*", (route) => {
    return block_resources.includes(route.request().resourceType())
      ? route.abort()
      : route.continue()
  })
  await page.goto("https://www.playpix.com/pt/sports/pre-match/event-view/Soccer/Brazil/", { waitUntil: "networkidle" })

  await page.click(".ui-kit-toggle")

  return page
}

async function setupF12(context: BrowserContext) {
  const page = await context.newPage()
  await page.route("**/*", (route) => {
    return block_resources.includes(route.request().resourceType())
      ? route.abort()
      : route.continue()
  })
  await page.goto("https://f12.bet/prejogo/#leagues/47026,2418,2417,20440,19025,43245,56001,41539,1306,10023,25441,10980,34579,56041,2838,45081,1251,821,5739,706,1187,28991,7461,596,29248,29833,2919,7933,8176,29834,7935,55078,55090,46,116,47,299,311,51", { waitUntil: "networkidle" })

  return page
}

async function setupBetano(context: BrowserContext) {
  const page = await context.newPage()
  await page.goto("https://br.betano.com/sport/futebol/ligas/10016r,1r,1o,1635r,1635o,10017r,216r,216o,5r,5o/")

  return page
}

async function setupMelhorabet(context: BrowserContext) {
  const page = await context.newPage()
  await page.route("**/*", (route) => {
    return block_resources.includes(route.request().resourceType())
      ? route.abort()
      : route.continue()
  })
  await page.goto("https://melhorabet.com/esportes/futebol/", { waitUntil: "networkidle" })

  return page
}

async function getEstralabetBets(page: Page) {
  const elements = await page.$$(".fixture-body.flex-container.ng-star-inserted")

  const bets: Bet[] = []

  for (const element of elements) {
    const hour = await (await element.$(".element.date.date-color"))?.innerText()
    const date = new Date()
    date.setHours(parseInt(hour!.split(":")[0]))
    date.setMinutes(parseInt(hour!.split(":")[1]))
    date.setSeconds(0)
    date.setMilliseconds(0)

    const teams = await element.$$(".text.truncate")

    const team1 = await teams[0].innerText()
    const team2 = await teams[1].innerText()

    const odds = await Promise.all((await element.$$(".bet-btn-odd")).map(async (odd) => Number(await odd.innerText())))

    const resultado: [number, number, number] = [odds[0], odds[1], odds[2]]
    const texts = await Promise.all((await element.$$(".bet-btn-text")).map(async (text) => (await text.innerText()).trim()))
    const ambasMarcam: [number, number] = [odds[texts.indexOf("Sim")] ?? 0, odds[texts.indexOf("Não")] ?? 0]
    bets.push({ date, team1, team2, resultado, ambasMarcam, casa: "estrelabet" })
  }

  return bets
}

async function getPlaypixBets(page: Page) {
  const bets: Bet[] = []

  const groups = await page.$$(".competition-bc")

  for (const group of groups) {
    const elements = await group.$$(".competition-details-section")
    const [day, month, year] = (await (await group.$(".c-title-bc.ellipsis"))?.innerText())?.split(".").map((x) => parseInt(x)) ?? []

    for (const element of elements) {
      const [hour, minute] = (await (await element.$(".competition-details-info-time.ellipsis"))?.innerText())?.split(":").map((x) => parseInt(x)) ?? []
      const datetime = new Date()
      datetime.setFullYear(year)
      datetime.setMonth(month - 1)
      datetime.setDate(day)
      datetime.setHours(hour)
      datetime.setMinutes(minute)
      datetime.setSeconds(0)
      datetime.setMilliseconds(0)

      const teams = (await (await element.$(".competition-details-header"))?.innerText())?.split("vs") ?? []

      const team1 = teams[0].trim()
      const team2 = teams[1].trim()

      let ambasMarcam: [number, number] = [0, 0]
      const resultado = await Promise.all((await element.$$(".market-odd-bc")).map(async (odd) => Number(await odd.innerText()))) as [number, number, number]

      bets.push({ date: datetime, team1, team2, resultado, ambasMarcam, casa: "playpix" })
    }
  }

  await page.click("#root > div.layout-content-holder-bc > div > div.sportsbook-center-section > div > div.prematch-page-bc > div > div.market-filter-bc > div > div", { force: true, trial: true })

  await page.click('text="Ambas as equipes marcam"', { delay: 1000, force: true, trial: true })

  await page.waitForTimeout(3000)

  const elements = await page.$$(".competition-details-section")

  elements.forEach(async (element, index) => {
    const ambasMarcam = await Promise.all((await element.$$(".market-odd-bc")).map(async (odd) => Number(await odd.innerText()))) as [number, number]

    bets[index].ambasMarcam = ambasMarcam
  })

  await page.click("#root > div.layout-content-holder-bc > div > div.sportsbook-center-section > div > div.prematch-page-bc > div > div.market-filter-bc > div > div", { force: true, trial: true })
  await page.click('text="Resultado do Jogo"', { delay: 1000, force: true, trial: true })

  return bets
}

async function getF12Bets(page: Page) {
  const bets: Bet[] = []

  const elements = await page.$$(".odds_tr")

  for (const element of elements) {
    const datetime = new Date()
    const [day, month] = (await (await element.$(".evdt_date"))?.innerText())?.split("/").map((x) => parseInt(x)) ?? []
    const [hour, minute] = (await (await element.$(".evdt_time"))?.innerText())?.split(":").map((x) => parseInt(x)) ?? []
    datetime.setMonth(month - 1)
    datetime.setDate(day)
    datetime.setHours(hour)
    datetime.setMinutes(minute)
    datetime.setSeconds(0)
    datetime.setMilliseconds(0)
    const team1 = (await (await element.$(".competitor1"))?.innerText())?.trim()!
    const team2 = (await (await element.$(".competitor2"))?.innerText())?.trim()!

    const odds = await Promise.all((await element.$$(".ev_sel_odd"))?.map(async (odd) => Number(await odd.innerText())))

    const resultado: [number, number, number] = [odds[0], odds[1], odds[2]]
    const ambasMarcam: [number, number] = [odds[22], odds[23]]

    bets.push({ date: datetime, team1, team2, resultado, ambasMarcam, casa: "f12" })
  }

  return bets
}

async function getBetanoBets(page: Page) {
  const bets: Bet[] = []

  const elements = await page.$$(".events-list__grid__event")

  for (const element of elements) {
    const [dateElement, timeElement] = await element.$$(".tw-flex.tw-flex-row.tw-justify-start.tw-items-center.tw-text-xs.tw-leading-s.tw-text-n-48-slate.tw-flex-col-reverse.tw-justify-center span")
    const [day, month] = (await dateElement.innerText()).trim().split("/").map((x) => parseInt(x))
    const [hour, minute] = (await timeElement.innerText()).trim().split(":").map((x) => parseInt(x))

    const datetime = new Date()
    datetime.setMonth(month - 1)
    datetime.setDate(day)
    datetime.setHours(hour)
    datetime.setMinutes(minute)
    datetime.setSeconds(0)
    datetime.setMilliseconds(0)

    const teams = await element.$$(".events-list__grid__info__main__participants__participant-name.tw-truncate")

    const team1 = (await teams[0].innerText()).trim()
    const team2 = (await teams[1].innerText()).trim()

    const odds = await Promise.all((await element.$$(".selections__selection__odd")).map(async (odd) => Number(await odd.innerText())))

    const resultado: [number, number, number] = [odds[0], odds[1], odds[2]]
    const ambasMarcam: [number, number] = [odds[5], odds[6]]

    bets.push({ date: datetime, team1, team2, resultado, ambasMarcam, casa: "betano" })
  }

  return bets
}

async function getMelhorabetBets(page: Page) {
  const games = await page.$$(".dashboard .c-events")

  const bets: string[] = []

  games.forEach(async (game) => {
    bets.push(await game.innerText())
  })

  return bets
}

async function run(
  estrelabet: Page,
  playpix: Page,
  f12: Page,
  betano: Page,
  melhoraBet: Page
) {
  const casas = await Promise.all([
    getEstralabetBets(estrelabet),
    getPlaypixBets(playpix),
    getF12Bets(f12),
    getBetanoBets(betano),
    // getMelhorabetBets(melhoraBet)
  ])

  const bets = casas.flat()

  const same: Bet[][] = []

  for (let i = 0; i < bets.length - 1; i++) {
    const bet = bets[i]
    const group: Bet[] = []

    for (let j = i + 1; j < bets.length; j++) {
      const bet2 = bets[j]

      if (bet.casa === bet2.casa) continue

      if (compareTwoStrings(bet.team1 || "", bet2.team1 || "") >= 0.75 && compareTwoStrings(bet.team2 || "", bet2.team2 || "") >= 0.75 && bet.date.getTime() === bet2.date.getTime()) {
        group.push(bet2)
      }
    }

    if (group.length > 0) {
      group.push(bet)
      same.push(group)
    }
  }

  const links = {
    "estrelabet": "https://bit.ly/3msLBjO",
    "playpix": "https://bit.ly/3kMEa6K",
    "f12": "https://bit.ly/3kRAjoU",
    "betano": "https://bit.ly/3ISoN4w",
    "22bet": "https://links22.com/pt/registration/"
  }

  for (const group of same) {
    const bet = group[0]
    const bet2 = group[1]
    const bet3 = group[2] ?? {}

    const betsCasas = {
      [bet.casa]: bet,
      [bet2.casa]: bet2,
      [bet3?.casa ?? ""]: bet3 ?? undefined
    }

    const casas = [bet.casa, bet2.casa, bet3.casa].sort() as ["betano" | "estrelabet" | "f12" | "playpix" | "melhorabet", "betano" | "estrelabet" | "f12" | "playpix" | "melhorabet", "betano" | "estrelabet" | "f12" | "playpix" | "melhorabet" | ""]
    const betPrincipal = betsCasas[casas[0]] as Bet
    const betSecundario = betsCasas[casas[1]] as Bet
    const betTerciario = betsCasas[casas[2] as string] as Bet | undefined

    const lucro1 = calcularSurebet2(100, betPrincipal.ambasMarcam[0], betSecundario.ambasMarcam[1]).lucro
    const lucro2 = calcularSurebet2(100, betPrincipal.ambasMarcam[1], betSecundario.ambasMarcam[0]).lucro
    const lucro3 = calcularSurebet3(100, betPrincipal.resultado[0], betSecundario.resultado[1], betTerciario?.resultado[2] ?? 0).lucro
    const lucro4 = calcularSurebet3(100, betPrincipal.resultado[1], betSecundario.resultado[0], betTerciario?.resultado[2] ?? 0).lucro
    const lucro5 = calcularSurebet3(100, betPrincipal.resultado[2], betSecundario.resultado[0], betTerciario?.resultado[1] ?? 0).lucro
    const lucro6 = calcularSurebet3(100, betPrincipal.resultado[0], betSecundario.resultado[2], betTerciario?.resultado[1] ?? 0).lucro
    const lucro7 = calcularSurebet3(100, betPrincipal.resultado[1], betSecundario.resultado[2], betTerciario?.resultado[0] ?? 0).lucro
    const lucro8 = calcularSurebet3(100, betPrincipal.resultado[2], betSecundario.resultado[1], betTerciario?.resultado[0] ?? 0).lucro

    const lucros = [lucro1, lucro2, lucro3, lucro4, lucro5, lucro6, lucro7, lucro8]

    const lucro = Math.max(...lucros)

    if (lucro > 0) {
      const index = lucros.indexOf(lucro)

      let subText: string

      if (index === 0) {
        subText = `
⚽ Ambas marcam: Sim 🤑(odd: ${betPrincipal.ambasMarcam[0]})
🍙 Casa de aposta: [${betPrincipal.casa}](${links[betPrincipal.casa]})

⚽ Ambas marcam: Não 🤑(odd: ${betPrincipal.ambasMarcam[1]})
🍙 Casa de aposta: [${betSecundario.casa}](${links[betSecundario.casa]})`
      } else if (index === 1) {
        subText = `
⚽ Ambas marcam: Não 🤑(odd: ${betPrincipal.ambasMarcam[1]})
🍙 Casa de aposta: [${betPrincipal.casa}](${links[betPrincipal.casa]})

⚽ Ambas marcam: Sim 🤑(odd: ${betPrincipal.ambasMarcam[0]})
🍙 Casa de aposta: [${betSecundario.casa}](${links[betSecundario.casa]})`
      } else if (index === 2) {
        subText = `
⚽ Resultado: ${betPrincipal.team1} vence 🤑(odd: ${betPrincipal.resultado[0]})
🍙 Casa de aposta: [${betPrincipal.casa}](${links[betPrincipal.casa]})

⚽ Resultado: empate 🤑(odd: ${betSecundario.resultado[1]})
🍙 Casa de aposta: [${betSecundario.casa}](${links[betSecundario.casa]})

⚽ Resultado: ${betTerciario?.team2} vence 🤑(odd: ${betSecundario.resultado[1]})
🍙 Casa de aposta: [${betTerciario?.casa}](${links[betTerciario?.casa ?? ""]})`
      } else if (index === 3) {
        subText = `
⚽ Resultado: empate 🤑(odd: ${betPrincipal.resultado[1]})
🍙 Casa de aposta: [${betPrincipal.casa}](${links[betPrincipal.casa]})

⚽ Resultado: ${betPrincipal.team1} vence 🤑(odd: ${betSecundario.resultado[0]})
🍙 Casa de aposta: [${betSecundario.casa}](${links[betSecundario.casa]})

⚽ Resultado: ${betTerciario?.team2} vence 🤑(odd: ${betSecundario.resultado[1]})
🍙 Casa de aposta: [${betTerciario?.casa}](${links[betTerciario?.casa ?? ""]})`
      } else if (index === 4) {
        subText = `
⚽ Resultado: ${betPrincipal.team2} vence 🤑(odd: ${betPrincipal.resultado[2]})
🍙 Casa de aposta: [${betPrincipal.casa}](${links[betPrincipal.casa]})

⚽ Resultado: empate 🤑(odd: ${betSecundario.resultado[1]})
🍙 Casa de aposta: [${betSecundario.casa}](${links[betSecundario.casa]})

⚽ Resultado: ${betPrincipal.team1} vence 🤑(odd: ${betSecundario.resultado[0]})
🍙 Casa de aposta: [${betTerciario?.casa}](${links[betTerciario?.casa ?? ""]})`
      } else if (index === 5) {
        subText = `
⚽ Resultado: ${betPrincipal.team1} vence 🤑(odd: ${betPrincipal.resultado[0]})
🍙 Casa de aposta: [${betPrincipal.casa}](${links[betPrincipal.casa]})

⚽ Resultado: ${betPrincipal.team2} vence 🤑(odd: ${betSecundario.resultado[2]})
🍙 Casa de aposta: [${betSecundario.casa}](${links[betSecundario.casa]})

⚽ Resultado: empate 🤑(odd: ${betTerciario?.resultado[1]})
🍙 Casa de aposta: [${betTerciario?.casa}](${links[betTerciario?.casa ?? ""]})`
      } else if (index === 6) {
        subText = `
⚽ Resultado: empate 🤑(odd: ${betPrincipal.resultado[1]})
🍙 Casa de aposta: [${betPrincipal.casa}](${links[betPrincipal.casa]})

⚽ Resultado: ${betPrincipal.team2} vence 🤑(odd: ${betSecundario.resultado[2]})
🍙 Casa de aposta: [${betSecundario.casa}](${links[betSecundario.casa]})

⚽ Resultado: ${betPrincipal.team1} vence 🤑(odd: ${betTerciario?.resultado[0]})
🍙 Casa de aposta: [${betTerciario?.casa}](${links[betTerciario?.casa ?? ""]})`
      } else {
        subText = `
⚽ Resultado: ${betPrincipal.team2} vence 🤑(odd: ${betPrincipal.resultado[2]})
🍙 Casa de aposta: [${betPrincipal.casa}](${links[betPrincipal.casa]})

⚽ Resultado: empate 🤑(odd: ${betSecundario.resultado[1]})
🍙 Casa de aposta: [${betSecundario.casa}](${links[betSecundario.casa]})

⚽ Resultado: ${betPrincipal.team1} vence 🤑(odd: ${betTerciario?.resultado[0]})
🍙 Casa de aposta: [${betTerciario?.casa}](${links[betTerciario?.casa ?? ""]})`
      }

      const text = `✅♾ OPERAÇÃO INFINITY GAIN ♾✅

🕐 Data/Hora: ${betPrincipal.date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}

⚽ ${betPrincipal.team1} x ${betPrincipal.team2}

${subText}

Calculadora: https://sitesdeapostas.bet/calculadora/

💸 LUCRO DE ${lucro.toFixed(2)}% 🤑

⚠️ ANTES DE APOSTAR, VERIFIQUE SE AS ODDS E OS JOGOS CORRESPONDEM AO DESCRITO AQUI ⚠️`

      try {
        await bot.sendMessage(process.env.TELEGRAM_CHAT_ID!, text, {
          parse_mode: "Markdown",
          disable_web_page_preview: true
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}

async function main() {
  const browser = await chromium.launch({ args, headless: false })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })

  const estrelabet = await setupEstrelabet(context)
  const playpix = await setupPlaypix(context)
  const f12 = await setupF12(context)
  const betano = await setupBetano(context)
  //const melhoraBet = await setupMelhorabet(context)

  setTimeout(async () => {
    console.log("Running...")
    await run(estrelabet, playpix, f12, betano, betano)
    console.log("Done!")
  }, 60000)

  setInterval(async () => {
    console.log("Running...")
    await run(estrelabet, playpix, f12, betano, betano)
    console.log("Done!")
  }, 1800000)
}

main()
