import TelegramBot from "node-telegram-bot-api"
import { config } from "dotenv"
import { readFile, writeFile } from "fs/promises"
import { PrismaClient } from "@prisma/client"
import sgMail from "@sendgrid/mail"
import { handler } from "./arbitragemesportiva"
import { Consumer } from "sqs-consumer"
import { SQS } from "@aws-sdk/client-sqs"

config()

const sqs = new SQS({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!
  }
})

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const prisma = new PrismaClient()

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

    await bot.sendMessage(chatId, `Para permanecer tendo acesso ao sistema e ao grupo, continue com a assinatura ativa ou será removido de forma automática`)
  } else {
    await bot.sendMessage(chatId, "Código de ativação inválido")
  }
})

handler(async surebets => {
  const usedIds = JSON.parse(await readFile("ids.json", "utf-8"))

  const idsToSave = surebets.map(surebet => surebet.id)

  for (const surebet of surebets) {
    if (usedIds.includes(surebet.id)) continue

    if (surebet.datetime < new Date(Date.now() + 24 * 60 * 60 * 1000)) continue

    idsToSave.push(surebet.id)

    const text = `✅♾ OPERAÇÃO INFINITY GAIN ♾✅

🕐 Data/Hora: ${surebet.datetime.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}

⚽ ${surebet.name}

⚽ ${surebet.legA} 🤑(odd: ${surebet.oddsA})
🍙 Casa de aposta e jogo: [${surebet.siteA}](${surebet.linkA})

⚽ ${surebet.legB} 🤑(odd: ${surebet.oddsB})
🍙 Casa de aposta e jogo: [${surebet.siteB}](${surebet.linkB})

Calculadora: https://sitesdeapostas.bet/calculadora/

💸 LUCRO DE ${surebet.profit.toFixed(2)}% 🤑`

    try {
      await bot.sendMessage(process.env.TELEGRAM_CHAT_ID!, text, {
        parse_mode: "Markdown",
        disable_web_page_preview: true
      })
    } catch (error) {
      console.log(error)
    }
  }

  await writeFile("ids.json", JSON.stringify([...usedIds, ...idsToSave]))
})

const consumer = Consumer.create({
  queueUrl: process.env.SQS_URL!,
  handleMessage: async (message) => {
    const { email, active } = JSON.parse(message.Body!) as { email: string, active: boolean }

    if (active) {
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
  },
  sqs
})

consumer.start()
