import { fetch } from "undici"
import TelegramBot = require("node-telegram-bot-api")
import { chromium } from "playwright"
import { config } from "dotenv"
import { readFile, writeFile } from "fs/promises"
import express from "express"
import helmet from "helmet"
import { PrismaClient } from "@prisma/client"
import sgMail from "@sendgrid/mail"

config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const prisma = new PrismaClient()

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

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true })

bot.onText(/\/start/, async msg => {
  const chatId = msg.chat.id

  await bot.sendMessage(chatId, "Informe o código de ativação que você recebeu por e-mail")
})

bot.onText(/^[0-9]{6}$/, async msg => {
  const chatId = msg.chat.id
  const otp = Number(msg.text)

  const user = await prisma.user.findFirst({
    where: {
      otp
    }
  })

  if (user) {
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        telegramId: chatId,
        active: true
      }
    })

    // @ts-ignore
    const { invite_link } = await bot.createChatInviteLink(Number(process.env.TELEGRAM_CHAT_ID!), { member_limit: 1 })

    await bot.sendMessage(chatId, `✅ Acesso liberado! ✅

👉🏻 ${invite_link}`)

    await bot.sendMessage(chatId, `Não esquece de manter a assinatura em dia para continuar tendo acesso ao grupo!`)
  } else {
    await bot.sendMessage(chatId, "Código de ativação inválido")
  }
})

async function main() {
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
}

const app = express()
app.use(express.json())
app.use(helmet())

app.post("/", async (req, res) => {
  const email = req.body.Customer.email

  if (req.body.Subscription.status === "active") {
    const user = await prisma.user.findFirst({
      where: {
        email
      }
    })

    if (user) {
      if (!user.active) {
        await prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            active: true
          }
        })

        await bot.unbanChatMember(Number(process.env.TELEGRAM_CHAT_ID!), Number(user.telegramId!))
        // @ts-ignore
        const { invite_link } = await bot.createChatInviteLink(Number(process.env.TELEGRAM_CHAT_ID!), { member_limit: 1 })

        await bot.sendMessage(Number(user.telegramId!), `✅ Acesso reestabelecido! ✅

👉🏻 ${invite_link}`)

        await bot.sendMessage(process.env.TELEGRAM_CHAT_ID!, `Não esquece de manter a assinatura em dia para continuar tendo acesso ao grupo!`)
      }
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000)

      await prisma.user.create({
        data: {
          email,
          otp
        }
      })

      await sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL!,
        subject: "Ativação Infinity Gain",
        html: `Olá, obrigado por se inscrever no Infinity Gain! Para ativar sua assinatura, fale com o <a href="https://t.me/InfinityGainBot">@InfinityGainBot</a> no Telegram e informe o seguinte código: ${otp}`,
        text: `Olá, obrigado por se inscrever no Infinity Gain! Para ativar sua assinatura, fale com o @InfinityGainBot (https://t.me/InfinityGainBot) no Telegram e informe o seguinte código: ${otp}`
      })
    }
  } else {
    const user = await prisma.user.update({
      where: {
        email: email
      },
      data: {
        active: false
      }
    })

    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL!,
      subject: "Assinatura atrazada",
      html: `Olá, sua assinatura no Infinity Gain está atrazada. Para voltar a ter acesso ao grupo, basta renovar sua assinatura.`,
      text: `Olá, sua assinatura no Infinity Gain está atrazada. Para voltar a ter acesso ao grupo, basta renovar sua assinatura.`
    })

    await bot.sendMessage(Number(user.telegramId!), `Assinatura atrazada! Para voltar a ter acesso ao grupo, basta renovar sua assinatura.`)

    await bot.banChatMember(Number(process.env.TELEGRAM_CHAT_ID!), Number(user.telegramId!))
  }
  res.sendStatus(200)
})

app.listen(Number(process.env.PORT || 3000), async () => {
  console.log("Server started")
  await main()
  console.log("Bot started")
})
