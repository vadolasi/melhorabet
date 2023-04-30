import { chromium } from "playwright-extra"
import stealth from "puppeteer-extra-plugin-stealth"
import { PrismaClient, Prisma } from "@prisma/client"
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
  const browser = await chromium.launch({ args })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })

  const page = await context.newPage()

  await page.route("**/*", (route) => {
    return block_resources.includes(route.request().resourceType())
      ? route.abort()
      : route.continue()
  })

  page.goto("https://f12.bet/prejogo/?btag=a_4488b_86c_ma#leagues/2417,51,45932,111,117,2838,46513,1837,45081,14640,55565,395,903,29144,142,25879,42642,2135,135,2230,862,26078,2098,1612,29833,1251,1186,2095,345,1441,1090,821,37547,1604,437,1113,21329,900,55704,2972,899,1091,28991,55505,55552,29248,659,55542,14641,29249,55567,1580,39973,9325,10845,39704,46787,29834,49255,1831,596,14425,29179,14040,1472,378,42639,47,4481,46578,710,13049,124,706,7935,932,10023,55703,46577,707,118,151,1261,10536,311,42323,33357,2231,1832,312,42984,574,2202,902,39793,1577,39794,31645,264,2096,1444,55554,28,7516,39979,498,55521,39795,360,1984,35,38871,116,861,894,1446,1680,32028,1187,267,9221,42636,110,11674,2099,46579,9079,730,2418,265,46569,898,9290,21328,897,1307,10848,2201,694,99,39792,46570,21327,858,216,55504,1047,39783,21330,25993,39796,1602,1,68,446,220,853,337,42637,521,125,46,1993,47474,48,42321,1064,1681,525,1471,39727,1450,17199,55263,299,498,394,49,8145,299,209", { timeout: 300000 })
  await page.waitForSelector(".odds_tr", { timeout: 300000 })
  const elements = await page.$$(".odds_tr")

  for (const element of elements) {
    try {
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

      let odds = await Promise.all((await element.$$(".ev_sel_odd odd:visible"))?.map(async (odd) => Number(await odd.innerText())))

      const resultado: [number, number, number] = [odds[0], odds[1], odds[2]]
      const ambasMarcam: [number, number] = [odds[11], odds[12]]

      const totalGolsOdds: { value: number, odds: [number, number] }[] = []

      const select = await element.$(".sov_opt_dd")
      const options = await select?.$$("option")!
      try {
        for (const option of options) {
          select?.selectOption(option)
          await page.waitForTimeout(200)

          odds = await element.$$eval(".ev_sel_odd .odd:visible", (odds) => odds.map((odd) => Number(odd.textContent)))
          if (!odds.some((odd) => isNaN(odd))) {
            totalGolsOdds.push({
              value: Number(await option.innerText()),
              odds: [odds[8], odds[9]]
            })
          }
        }
      } catch {}

      const id = getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}`)

      await prisma.jogo.upsert({
        where: {
          id
        },
        create: {
          id,
          time1: team1!,
          time2: team2!,
          data: datetime,
          casa: "f12bet",
          apostas: {
            create: [
              {
                tipo: "RESULTADO",
                id: getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}Resultado`),
                odds: resultado
              },
              {
                tipo: "AMBAS_MARCAM",
                id: getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}AmbasMarcam`),
                odds: ambasMarcam
              },
              ...totalGolsOdds.map((odd) => ({
                tipo: "TOTAL_GOLS",
                id: getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}TotalGols${odd.value}`),
                odds: odd.odds,
                info: {
                  value: odd.value,
                  times: "x"
                }
              } as Prisma.ApostaCreateWithoutJogoInput))
            ]
          }
        },
        update: {
          apostas: {
            upsert: [
              {
                where: {
                  id: getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}Resultado`)
                },
                create: {
                  tipo: "RESULTADO",
                  id: getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}Resultado`),
                  odds: resultado
                },
                update: {
                  odds: resultado
                }
              },
              {
                where: {
                  id: getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}AmbasMarcam`)
                },
                create: {
                  tipo: "AMBAS_MARCAM",
                  id: getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}AmbasMarcam`),
                  odds: ambasMarcam
                },
                update: {
                  odds: ambasMarcam
                }
              },
              ...totalGolsOdds.map((odd) => ({
                where: {
                  id: getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}TotalGols${odd.value}`)
                },
                create: {
                  tipo: "TOTAL_GOLS",
                  id: getHash(`f12bet${team1}${team2}${datetime.toLocaleString()}TotalGols${odd.value}`),
                  odds: odd.odds,
                  info: {
                    value: odd.value,
                    times: "x"
                  }
                },
                update: {
                  odds: odd.odds
                }
              } as Prisma.ApostaUpsertWithWhereUniqueWithoutJogoInput))
            ]
          }
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  await browser.close()
}

main()
  .then(() => process.exit(0))
