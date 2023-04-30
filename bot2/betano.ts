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

  await page.goto("https://www.playpix.com/pt/sports/pre-match/event-view/Soccer/", { waitUntil: "networkidle" })
  const countryLinks = await page.$$("div.sp-sub-list-bc.active div.sp-sub-list-bc.active ~ *")

  for (const countryLink of countryLinks) {
    try {
      await page.evaluate((el) => {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
      }, countryLink)
      await countryLink.click({ force: true })
    } catch (error) {}
  }

  const leagueLinks = await page.$$("div.sp-sub-list-bc.active div.sp-sub-list-bc.active div.sp-sub-list-bc")

  country: for (const leagueLink of leagueLinks) {
    try {
      await leagueLink.click({ force: true })

      await page.waitForSelector(".multi-column-teams")
      const games = await page.$$(".multi-column-teams")

      leuage: for (const game of games) {
        try {
          try {
            await game.click({ force: true })
          } catch (error) {
            continue leuage
          }

          try {
            await page.locator(".game-details-c-body-name-bc").waitFor({ state: "hidden", timeout: 1000 })
            await page.locator(".game-details-c-body-name-bc").waitFor({ timeout: 1000 })
          } catch (error) {}

          const dateElement = page.locator(".game-details-c-head-c-row-data-bc time")

          try {
            await dateElement.waitFor({ state: "visible", timeout: 1000 })
          } catch (error) {
            continue leuage
          }

          const [date, time] = (await (dateElement)?.innerText())?.split(", ") ?? []

          const [day, month, year] = date?.split(".") ?? []
          const [hour, minute] = time?.split(":") ?? []

          const datetime = new Date(`${year}-${month}-${day}T${hour}:${minute}:00.000Z`)

          const [team1, team2] = await page.$$eval(".game-d-c-b-r-c-team-name-bc", (elements) =>
            elements.map((el) => el.textContent)
          )

          if (!team1 || !team2) {
            continue
          }

          const resultadoBlock = await page.$("div.sgm-market-g:has(p.sgm-market-g-h-title-bc:text-is('Resultado do Jogo'))")!

          const resultadoOdds = await resultadoBlock?.$$eval(".market-odd-bc", (elements) =>
            elements.map((el) => Number(el.textContent))
          ) as [number, number, number] | undefined

          const ambasMarcamBlock = await page.$("div.sgm-market-g:has(p.sgm-market-g-h-title-bc:text-is('Ambas as Equipas Marcam'))")!

          const ambasMarcamOdds = await ambasMarcamBlock?.$$eval(".market-odd-bc", (elements) =>
            elements.map((el) => Number(el.textContent))
          ) as [number, number] | undefined

          const totalGolsOdds: { value: number, odds: [number, number] }[] = []

          const totalGolsBlock = await page.$("div.sgm-market-g:has(p.sgm-market-g-h-title-bc:text-is('Total de Gols'))")

          const totalGolsOddsValues = await totalGolsBlock?.$$eval(".market-odd-bc", (elements) =>
            elements.map((el) => Number(el.textContent))
          ) as number[]

          const totalGolsValues = await totalGolsBlock?.$$eval(".market-name-bc.ellipsis", (elements) =>
            elements.map((el) => Number(el.textContent))
          ) as number[]

          for (let i = 0; i < totalGolsOddsValues?.length; i += 2) {
            const odd1 = totalGolsOddsValues[i]
            const odd2 = totalGolsOddsValues[i + 1]
            const value = totalGolsValues[i]

            totalGolsOdds.push({
              value,
              odds: [odd1, odd2]
            })
          }

          const id = getHash(`playpix${team1}${team2}${date.toLocaleString()}`)

          await prisma.jogo.upsert({
            where: {
              id
            },
            create: {
              id,
              time1: team1!,
              time2: team2!,
              data: datetime,
              casa: "playpix",
              apostas: {
                create: [
                  {
                    tipo: "RESULTADO" as const,
                    id: getHash(`playpix${team1}${team2}${date.toLocaleString()}Resultado`),
                    odds: resultadoOdds
                  },
                  {
                    tipo: "AMBAS_MARCAM" as const,
                    id: getHash(`playpix${team1}${team2}${date.toLocaleString()}AmbasMarcam`),
                    odds: ambasMarcamOdds
                  },
                  ...totalGolsOdds.map((odd) => ({
                    tipo: "TOTAL_GOLS",
                    id: getHash(`playpix${team1}${team2}${datetime.toLocaleString()}TotalGols${odd.value}`),
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
                      id: getHash(`playpix${team1}${team2}${date.toLocaleString()}Resultado`)
                    },
                    create: {
                      tipo: "RESULTADO",
                      id: getHash(`playpix${team1}${team2}${date.toLocaleString()}Resultado`),
                      odds: resultadoOdds
                    },
                    update: {
                      odds: resultadoOdds
                    }
                  },
                  {
                    where: {
                      id: getHash(`playpix${team1}${team2}${date.toLocaleString()}AmbasMarcam`)
                    },
                    create: {
                      tipo: "AMBAS_MARCAM",
                      id: getHash(`playpix${team1}${team2}${date.toLocaleString()}AmbasMarcam`),
                      odds: ambasMarcamOdds
                    },
                    update: {
                      odds: ambasMarcamOdds
                    }
                  },
                  ...totalGolsOdds.map((odd) => ({
                    where: {
                      id: getHash(`playpix${team1}${team2}${datetime.toLocaleString()}TotalGols${odd.value}`)
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
        } catch (error) {}
      }
    } catch (error) {}
  }

  await prisma.aposta.deleteMany({
    where: {
      odds: {
        equals: []
      }
    }
  })

  await browser.close()
}

main()
