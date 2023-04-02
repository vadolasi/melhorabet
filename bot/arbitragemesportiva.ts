import { fetch } from "undici"
import { chromium } from "playwright"

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

interface Surebet {
  id: string
  name: string
  datetime: Date
  linkA: string
  linkB: string
  siteA: string
  siteB: string
  oddsA: number
  oddsB: number
  legA: string
  legB: string
  profit: number
}

export const handler = async (callback: (surebets: Surebet[]) => void) => {
  const browser = await chromium.launch({ args })

  const page = await browser.newPage()

  const blockResources = [
    "image",
    "media",
    "font",
    "stylesheet"
  ]

  await page.route("**", async route => {
    if (blockResources.includes(route.request().resourceType())) {
      await route.abort()
    } else {
      await route.continue()

      if (route.request().url().includes("/bet/getlist.php")) {
        const response = await route.request().response()

        if (response) {
          const surebets = (await response.json()).surebets as any[]

          const houses = ["Pinnacle", "Netbet", "Betsson", "Betano", "Betfair", "22bet"]

          const mostProfitable = surebets
            .filter(surebet => houses.includes(surebet.casaA) && houses.includes(surebet.casaB))
            .sort((a, b) => b.lucro - a.lucro)

          const surebetsToSave: Surebet[] = []

          for (const surebet of mostProfitable) {
            const linkA = (await fetch((await fetch(surebet.linkA)).url)).url
            const linkB = (await fetch((await fetch(surebet.linkB)).url)).url

            surebetsToSave.push({
              id: surebet.id,
              name: surebet.nomeA,
              datetime: new Date(surebet.dataA),
              linkA,
              linkB,
              siteA: surebet.casaA,
              siteB: surebet.casaB,
              oddsA: surebet.oddsA,
              oddsB: surebet.oddsB,
              legA: surebet.legA,
              legB: surebet.legB,
              profit: surebet.lucro
            })
          }

          callback(surebetsToSave)
        }
      }
    }
  })
}
