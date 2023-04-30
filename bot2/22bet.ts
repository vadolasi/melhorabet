import { chromium } from "playwright-extra"
import stealth from "puppeteer-extra-plugin-stealth"
import { Prisma, PrismaClient } from "@prisma/client"
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

  await page.goto("https://22bet.com/pt/line/football", { waitUntil: "networkidle" })
  const ligas = await page.$$("ul.liga_menu a.link")
  ligas.shift()

  liga: for (const liga of ligas) {
    try {
      await liga.click({ force: true })

      await page.waitForSelector("a.link:has(span.gname)")
      const jogos = await page.$$("a.link:has(span.gname)")

      jogo: for (const jogo of jogos) {
        try {
          await jogo.click({ force: true })
          await page.waitForSelector(".g-scoreboard-item__team-name", { timeout: 5000 })

          const [time1, time2] = await Promise.all((await page.$$(".g-scoreboard-item__team-name")).map(async (el) => {
            return await el.innerText()
          }))

          const [date, time] = (await (await page.$(".g-scoreboard-item__wait-time"))?.innerText())?.split(" ") ?? []

          const [day, month] = date.split(".")
          const [hour, minute] = time.replace(".", "").split(":")

          const data = new Date()
          data.setMonth(parseInt(month) - 1)
          data.setDate(parseInt(day))
          data.setHours(parseInt(hour))
          data.setMinutes(parseInt(minute))
          data.setSeconds(0)
          data.setMilliseconds(0)

          const resultadoBlock = await page.$('.bet_group:has-text("1x2")')

          let resultado: [number, number, number] | [] = []

          try {
            resultado = await Promise.all((await resultadoBlock?.$$("span.koeff i"))?.map(async (el) => {
              return Number(await el.innerText())
            })!) as [number, number, number]
          } catch (e) {}

          const ambasMarcamBlock = await page.$('.bet_group:has-text("Ambas as equipas para marcarem")')

          let ambasMarcam: [number, number] | [] = []

          try {
            ambasMarcam = await Promise.all((await ambasMarcamBlock?.$$(".span.koeff i"))?.map(async (el) => {
              return Number(await el.innerText())
            })!) as [number, number]
          } catch (e) {}

          const totalGolsBlock = await page.$('.bet_group:has-text("Total")')

          const totalGolsOdds: { value: number, odds: [number, number] }[] = []

          try {
            const items = await totalGolsBlock?.$$(".market-row__inner") ?? []

            for (let i = 0; i < items.length; i += 2) {
              const item1 = items[i]
              const item2 = items[i + 1]

              const odd1 = await item1.$eval("span.koeff i", (el) => Number(el.textContent))
              const odd2 = await item2.$eval("span.koeff i", (el) => Number(el.textContent))
              const value = Number((await (await item1.$(".bet_type"))?.innerText())?.trim().split(" ")[3])

              totalGolsOdds.push({
                value,
                odds: [odd1, odd2]
              })
            }
          } catch (e) {
            console.log(e)
          }

          const id = getHash(`22bet${time1}${time2}${data.toLocaleString()}`)

          await prisma.jogo.upsert({
            where: {
              id
            },
            create: {
              id,
              time1,
              time2,
              data,
              casa: "22bet",
              apostas: {
                create: [
                  {
                    tipo: "RESULTADO" as const,
                    id: getHash(`22bet${time1}${time2}${data.toLocaleString()}Resultado`),
                    odds: resultado
                  },
                  {
                    tipo: "AMBAS_MARCAM" as const,
                    id: getHash(`22bet${time1}${time2}${data.toLocaleString()}AmbasMarcam`),
                    odds: ambasMarcam
                  },
                  ...totalGolsOdds.map((odd) => ({
                    tipo: "TOTAL_GOLS",
                    id: getHash(`22bet${time1}${time2}${data.toLocaleString()}TotalGols${odd.value}`),
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
                      id: getHash(`22bet${time1}${time2}${data.toLocaleString()}Resultado`)
                    },
                    create: {
                      tipo: "RESULTADO",
                      id: getHash(`22bet${time1}${time2}${data.toLocaleString()}Resultado`),
                      odds: resultado
                    },
                    update: {
                      odds: resultado
                    }
                  },
                  {
                    where: {
                      id: getHash(`22bet${time1}${time2}${data.toLocaleString()}AmbasMarcam`)
                    },
                    create: {
                      tipo: "AMBAS_MARCAM",
                      id: getHash(`22bet${time1}${time2}${data.toLocaleString()}AmbasMarcam`),
                      odds: ambasMarcam
                    },
                    update: {
                      odds: ambasMarcam
                    }
                  },
                  ...totalGolsOdds.map((odd) => ({
                    where: {
                      id: getHash(`f12bet${time1}${time2}${data.toLocaleString()}TotalGols${odd.value}`)
                    },
                    create: {
                      tipo: "TOTAL_GOLS",
                      id: getHash(`f12bet${time1}${time2}${data.toLocaleString()}TotalGols${odd.value}`),
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
          // console.log(e)
          continue jogo
        }
      }

      await liga.click({ force: true })
    } catch (e) {
      // console.log(e)
      continue liga
    }
  }

  await browser.close()
}

main()
