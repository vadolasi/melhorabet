import { chromium } from "playwright-extra"
import stealth from "puppeteer-extra-plugin-stealth"
import { PrismaClient } from "@prisma/client"
import { createHash } from "crypto"

function getHash(text: string) {
  return createHash("sha256").update(text).digest("hex")
}

const prisma = new PrismaClient()

chromium.use(stealth())

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

async function main() {
  const browser = await chromium.launch({ args, headless: false })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })

  const page = await context.newPage()

  await page.route("**/*", (route) => {
    return block_resources.includes(route.request().resourceType())
      ? route.abort()
      : route.continue()
  })

  await page.goto("https://estrelabet.com/ptb/bet/main", { waitUntil: "networkidle" })
  await page.click("#left-sidebar > div.modul-accordion.lsb-bm-cont.left-menu > div > div.sport.lsb-bm > div.accordion-view > ul > li:nth-child(1) > a")
  await page.click("#left-sidebar > div.modul-accordion.lsb-bm-cont.left-menu > div > div.sport.lsb-bm > div.accordion-view > ul > li.ng-star-inserted.active > ul > li:nth-child(16) > a")

  const contriesLinks = await page.$$(".ng-star-inserted.active > ul > li > a")

  const mapAbrevToMonth = {
    "JAN": 0,
    "FEV": 1,
    "MAR": 2,
    "ABR": 3,
    "MAI": 4,
    "JUN": 5,
    "JUL": 6,
    "AGO": 7,
    "SET": 8,
    "OUT": 9,
    "NOV": 10,
    "DEZ": 11
  }

  for (const contryLink of contriesLinks) {
    await contryLink.click()
    const leagues = await page.$$(".ng-star-inserted.active > ul > li > ol > li > a >> visible=true")

    for (const league of leagues) {
      if (!(league.isVisible())) {
        await league.click()
      }

      await page.waitForSelector(".btn.other-btn.waves-effect.waves-light.modal-trigger")
      const games = await page.$$(".btn.other-btn.waves-effect.waves-light.modal-trigger")
      const gamesLength = games.length

      /*
      for (let i = 0; i < gamesLength; i++) {
        await page.waitForSelector(".btn.other-btn.waves-effect.waves-light.modal-trigger")
        const game = (await page.$$(".btn.other-btn.waves-effect.waves-light.modal-trigger"))[i]

        if (!game) {
          break
        }

        await game.click()

        await page.waitForSelector("div.modul-accordion.bet-type-group.ng-star-inserted:has(span.header-text:text-is('Resultado'))")

        const resultadoBlock = await page.$("div.modul-accordion.bet-type-group.ng-star-inserted:has(span.header-text:text-is('Resultado'))")!

        const resultadoOdds = await Promise.all((await resultadoBlock?.$$(".bet-btn-odd") ?? []).map(async (odd) => Number(await odd.innerText())))

        const ambasMarcamBlock = await page.$("div.modul-accordion.bet-type-group.ng-star-inserted:has(span.header-text:text-is('Ambas equipes marcam'))")

        const ambasMarcamOdds = await Promise.all((await ambasMarcamBlock?.$$(".bet-btn-odd") ?? []).map(async (odd) => Number(await odd.innerText())))

        const [team1, team2] = (await page.innerText(".center.flex-item.truncate.ng-star-inserted")).trim().split("-")

        const [date, hour] = (await page.innerText(".sr-lmt-plus-scb__status.srt-text-secondary.srt-neutral-9")).trim().split("|")
        const [day, monthCode] = date.trim().split(" ")
        const month = mapAbrevToMonth[monthCode]
        const [hourNumber, minutes] = hour.trim().split(":")

        const datetime = new Date(new Date().getFullYear(), month, Number(day), Number(hourNumber), Number(minutes))

        const id = getHash(`estrelabet${team1}${team2}${date.toLocaleString()}`)

        await prisma.jogo.upsert({
          where: {
            id
          },
          create: {
            id,
            time1: team1,
            time2: team2,
            data: datetime,
            casa: "estrelabet",
            apostas: {
              create: [
                {
                  tipo: "RESULTADO" as const,
                  id: getHash(`estrelabet${team1}${team2}${date.toLocaleString()}Resultado`),
                  odds: resultadoOdds
                },
                {
                  tipo: "AMBAS_MARCAM" as const,
                  id: getHash(`estrelabet${team1}${team2}${date.toLocaleString()}AmbasMarcam`),
                  odds: ambasMarcamOdds
                }
              ]
            }
          },
          update: {
            apostas: {
              upsert: [
                {
                  where: {
                    id: getHash(`estrelabet${team1}${team2}${date.toLocaleString()}Resultado`)
                  },
                  create: {
                    tipo: "RESULTADO",
                    id: getHash(`estrelabet${team1}${team2}${date.toLocaleString()}Resultado`),
                    odds: resultadoOdds
                  },
                  update: {
                    odds: resultadoOdds
                  }
                },
                {
                  where: {
                    id: getHash(`estrelabet${team1}${team2}${date.toLocaleString()}AmbasMarcam`)
                  },
                  create: {
                    tipo: "AMBAS_MARCAM",
                    id: getHash(`estrelabet${team1}${team2}${date.toLocaleString()}AmbasMarcam`),
                    odds: ambasMarcamOdds
                  },
                  update: {
                    odds: ambasMarcamOdds
                  }
                }
              ]
            }
          }
        })

        await page.goBack()
      }*/
    }
  }

  await prisma.aposta.deleteMany({
    where: {
      odds: {
        equals: []
      }
    }
  })
}

main()
