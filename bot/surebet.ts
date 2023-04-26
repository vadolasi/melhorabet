import * as cheerio from "cheerio"
import { fetch } from "undici"

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
  setInterval(async () => {
    let response = await fetch("https://pt.surebet.com/surebets", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        "if-none-match": "W/\"50af5a302047c82e180f2a6010af5f52\"",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "_ga=GA1.2.1053142990.1678815356; timezoneOffset=180; order_surebets_index=profit; uu=909bd7e8-82ce-41c0-85b7-920691491a49; cf_clearance=gqnRq.zcEM4dPKJkP6z3KobNZsOK0iVP_qELSk1fixo-1680357954-0-160; sel%3Asurebets=270fff049e4ee5beed1a62a601420b25; ab=977; _gid=GA1.2.870864846.1682507906; _gat_gtag_UA_1803143_12=1; remember_user_token=BAhbCFsGaQNQ0wNJIhlHQURxZGljY0hMQUFod21EbkRpcwY6BkVUSSIXMTY4MjU0OTM3Ny40MDIzMjEzBjsARg%3D%3D--c61417cc15b4c50ec5e97db4bfa36417d62b02e4; stoken=28042489-595da51dfeb9522bfcd35375ff618a9c3ed1353b; ref=TTNZSWEvZUFNMlltWWgvaTA1QlJkQT09LS04amd4RTU3WEpIQk9hcEFIdEVtMmp3PT0%3D--d33f513141b2ca4431cb263aa1e791341a888470; br=YkVtaGxmRE5WQnYvdVRsUWpZM0tMMHRlazlzcmppUGduWjFrb2ovN2llQVduVzdtQnh1RzVBQzZlSmk0NHpJcFZtWmFNd2tLeTd4ZVlDNVVDOHhDQUNWaFVVWGNZNDR3Z0hsTFdPVkdwbXhzb2xoNGFFZ2RSRzJ4M1lJcjBHYWdKSFh4Ykk3WFRQNHd6eXBHUjA3L0d0VTRORjFpUi9NSTVDcjZCN0lvY200bWN4bWlaa25xakorM25BYm9Zcm1XdmcyemdCZUtlVlR5c2h3TGtWSU9ZZzNkaTRMRnc1OXA5NnB0SjNSZ1NyZnhuR3dUb1ozMHpIc3JZWXJXQ1c3aS0tQXNkSVhHWlMvV3RZMFdJT044dndEZz09--3639aea8bdac6f3145d53413df6baf682c860802; _sp5=SWI0KzNZbUUxdVltV296eXloTi9YUWpEbWRYN0FqZ2NNWjhVY2ZSZWplOFh2ZmkyWnJISG9IVFVUUUpwcXhHbElVZmtwNFpEMmhOdDRGZytGZWZCWWduSUxBcmRVdGcwMFc4cGZFWXUvMVFEYWRUSGZ3SEFZa3d5R0pWaUJ5OUxNd1RTa3RQb2h1NXVUQXA0RXJrZU5ZTUw3OVc4aFNKbnNpeEJ4ek5uYm1WUldoNzRYeWxBTU55Z2N2ZWpiWXhZOUNYd0RBT3N6enRTSThhV0d4ek5yM0Q4SzJXZUx5eHREOHBxTTdUVWNGM2I5N1B0M3RGdmlWVXFGdzY2MmpoWVhkMU1TT3RpMEEzcW9jcXROMXJyY1hGR0JOa0ZTZzNVLysvNVdLM2J6MGpDODZZSGVWa3BPTnQraTJyVTZja2dGMXpjTkpnOGZ1eEtZOFJXUElnajFVYWtONk8rdXVCdis2VFJNZmxUSEV6WFFvUTFuNFlLVWE1NlZ0WlFEcEVZLS0wemRGUUgzWUlhZWZyeFI1aWM5RjlBPT0%3D--a2675945b18c8e5d92d410b0dcfe90299c2601de; sstoken=28042489-595da51dfeb9522bfcd35375ff618a9c3ed1353b-28042490-99889ff12cafa796d0a5a2c0f2ba5b6680349ccc",
        "Referer": "https://pt.surebet.com/users/sign_in",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    })

    const html = await response.text()

    const $ = cheerio.load(html)

    const records = $(".surebet_record")

    const surebets: Surebet[] = []

    for (const record of records) {
      const $record = $(record)

      const id = $record.attr("id") as string

      const name = $record.find(".event a").first().text().trim()

      const datetime = new Date(Number($record.find(".time").attr("data-utc") as string))

      const [preLinkA, preLinkB] = $record.find(".event a").toArray().map(link => $(link).attr("href") as string)

      response = await fetch(`https://pt.surebet.com${preLinkA}`)
      let data = await response.text()
      let linkA = data.match(/value=\\"(http[s]?:\/\/\S+)\\"/)?.[1] as string || data.match(/action=\\"(http[s]?:\/\/\S+)\\"/)?.[1] as string || ""

      if (!linkA) {
        linkA = `https://pt.surebet.com${preLinkA}`
      }

      response = await fetch(`https://pt.surebet.com${preLinkB}`)
      data = await response.text()
      let linkB = data.match(/value=\\"(http[s]?:\/\/\S+)\\"/)?.[1] as string || data.match(/action=\\"(http[s]?:\/\/\S+)\\"/)?.[1] as string || ""

      if (!linkB) {
        linkB = `https://pt.surebet.com${preLinkB}`
      }

      const [siteA, siteB] = $record.find(".booker a").toArray().map(casa => $(casa).text().trim())

      const [oddsA, oddsB] = $record.find(".value a").toArray().map(odd => Number($(odd).text().split(" ")[0]))

      const [legA, legB] = $record.find(".coeff abbr").toArray().map(leg => $(leg).attr("title") as string)

      const profit = Number($record.find(".profit").attr("data-profit"))

      surebets.push({
        id,
        name,
        datetime,
        linkA,
        linkB,
        siteA,
        siteB,
        oddsA,
        oddsB,
        legA,
        legB,
        profit
      })
    }

    callback(surebets)
  }, 30000)
}
