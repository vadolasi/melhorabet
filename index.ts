import { fetch } from "undici"
import TelegramBot = require("node-telegram-bot-api")
import { chromium } from "playwright"
import { config } from "dotenv"
import { readFile, writeFile } from "fs/promises"

config()

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

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!)

;(async () => {
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

          const alredyUsedIds = JSON.parse(await readFile("ids.json", "utf-8"))

          const mostProfitable = surebets
            .filter(surebet => surebet.lucro >= 2 && !alredyUsedIds.includes(surebet.id) && houses.includes(surebet.casaA) && houses.includes(surebet.casaB))
            .sort((a, b) => b.lucro - a.lucro)

          await writeFile("ids.json", JSON.stringify([...alredyUsedIds, ...mostProfitable.map(surebet => surebet.id)]))

          for (const surebet of mostProfitable) {
            const linkA = (await fetch(surebet.linkA)).url
            const linkB = (await fetch(surebet.linkB)).url

            const text = `✅♾ OPERAÇÃO INFINITY GAIN ♾✅

  🕐 Data/Hora: ${surebet.dataA}

  ⚽ ${surebet.nomeA}

  ⚽ ${surebet.legA.split("-")[0]} 🤑(odd: ${surebet.oddsA})
  🍙 Casa de aposta e jogo: [${surebet.casaA}](${linkA})

  ⚽ ${surebet.legB.split("-")[0]} 🤑(odd: ${surebet.oddsB})
  🍙 Casa de aposta e jogo: [${surebet.casaB}](${linkB})

  Calculadora: https://sitesdeapostas.bet/calculadora/

  💸 LUCRO DE ${surebet.lucro}% 🤑`

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
    }
  })

  await page.goto("https://arbitragemesportiva.com/dashboard/")

  await page.fill("#user_login", process.env.ARBITRAGEM_USER!)
  await page.fill("#user_pass", process.env.ARBITRAGEM_PASS!)
  await page.click("#rememberme")
  await page.click("input[type=submit]")
})()
