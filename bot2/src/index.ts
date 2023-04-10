import { chromium } from "playwright-extra"
import type { BrowserContext, Page } from "playwright"
import stealth from "puppeteer-extra-plugin-stealth"

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

async function setupEstrelabet(context: BrowserContext) {
  const page = await context.newPage()
  await page.route("**/*", (route) => {
    return block_resources.includes(route.request().resourceType())
      ? route.abort()
      : route.continue()
  })
  await page.goto("https://estrelabet.com/ptb/bet/live/", { waitUntil: "networkidle" })

  return page
}

async function setup22bet(context: BrowserContext) {
  const page = await context.newPage()
  await page.route("**/*", (route) => {
    return block_resources.includes(route.request().resourceType())
      ? route.abort()
      : route.continue()
  })
  await page.goto("https://22bet.com/pt/live/football", { waitUntil: "networkidle" })

  return page
}

async function setupPlaypix(context: BrowserContext) {
  const page = await context.newPage()
  await page.route("**/*", (route) => {
    return block_resources.includes(route.request().resourceType())
      ? route.abort()
      : route.continue()
  })
  await page.goto("https://www.playpix.com/pt/sports/live/event-view/Soccer/", { waitUntil: "networkidle" })

  return page
}

async function getEstralabetBets(page: Page) {
  const games = await page.$$(".modul-content")

  const bets: string[] = []

  games.forEach(async (game) => {
    bets.push(await game.innerText())
  })

  return bets
}

async function get22betBets(page: Page) {
  const games = await page.$$(".dashboard .c-events")

  const bets: string[] = []

  games.forEach(async (game) => {
    bets.push(await game.innerText())
  })

  return bets
}

async function getPlaypixBets(page: Page) {
  const games = await page.$$(".sp-sub-list-bc .active")

  const bets: string[] = []

  games.forEach(async (game) => {
    bets.push(await game.innerText())
  })

  return bets
}

async function main() {
  const browser = await chromium.launch({ args, headless: false })
  const context = await browser.newContext()

  const estrelabet = await setupEstrelabet(context)
  const bet22 = await setup22bet(context)
  const playpix = await setupPlaypix(context)

  setInterval(async () => {
    const currentEstralabetBets = await getEstralabetBets(estrelabet)
    const current22betBets = await get22betBets(bet22)
    const currentPlaypixBets = await getPlaypixBets(playpix)

    console.log(currentEstralabetBets)
    console.log(current22betBets)
    console.log(currentPlaypixBets)
  }, 1000)
}

main()
