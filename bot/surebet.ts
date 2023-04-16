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
        "if-none-match": "W/\"528b0cb2b026268ce22a511640f27b6a\"",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "_ga=GA1.2.1053142990.1678815356; timezoneOffset=180; order_surebets_index=profit; uu=909bd7e8-82ce-41c0-85b7-920691491a49; cf_clearance=gqnRq.zcEM4dPKJkP6z3KobNZsOK0iVP_qELSk1fixo-1680357954-0-160; sel%3Asurebets=270fff049e4ee5beed1a62a601420b25; ab=977; _gid=GA1.2.1998464321.1681585148; _gat_gtag_UA_1803143_12=1; remember_user_token=BAhbCFsGaQNQ0wNJIhlHQURxZGljY0hMQUFod21EbkRpcwY6BkVUSSIXMTY4MTY3NjI4My40ODU4NTY4BjsARg%3D%3D--7b53ebe14777ace803e59a552309c658ed791903; stoken=28027938-59f218053d681e83b962a3650a3866e3347f0ac8; ref=TVZrbVczOG1aQ0svdEx6bHdFajZKdz09LS1WM01qZmRHMHFaSTdXcXM4RFp5OXp3PT0%3D--21e952f519c78a2f7520810e68ace9cd858068a6; br=MmFsWFp0WUdmSE1LQ1gzL3R0dWVraTZhL2NNdFNnVjlsZ3lveUNsSXB0VUhpbDVkQ0wraDFMQjh1SU53cjVKVzNIbTQyQW5TR091RU9aRUFiWVRibE9YcXJ3eUx6ZmZ6dUZibUR5TURhYjBNU3lmRmM0TzBUam41ZTUzVzh0OTVyUHc0SE9QUGphRk1Ic0JSZTdkditBWmFjOEhBS0FGRnBSYXZueW9UeWxvT2RNUmF2bHB4bUo3UVcxb2d1RE1RTlEvY3FWeXMxaExzbHU0eU5TUTZ5c3diS042NHkxZUh4TGpMNTJ1ekJHb2dZbTFGOVA5d05uRzdyQ0treFJZdS0tb3hWRFZWSi95YnNnS3hPMEtUMWRwZz09--47f3fc80710e75f26af92303ecb648ef58cf9dad; _sp5=UmFXYzE1czh5OEVFcU1sUERpZ2VDTm9xN2VqWGtOcVNhS0NFQ3E2eDVpVXUyRExXeEdackJVMkdDTXQxNWkvNXJyRTdLYWJSWElZOFNyNVFyNUVmT2s2T1IzZUpxUnlxREw5OUlXa0x6R2hPNlAwMkhZamRiWjB0OUlkOENVK2NQM3BjWkZtMWYxd3lzdVU4b0xScEt1Um1iS0ZQajZuTjVXamRyWU1JamVPeThpWlhSZDZ0elhodFZtUTVaUnBRN2dwSysvM3JyYmNmbWZ2eC8rNm90VXdyRzVFaGtkRkswZWVGVGlMZFBiUnhaYjVaVGxMekZjWGoxKzViM25WbTExdjEva21CT1IwUjJtQUNYK3RkQlZpcEVCb09NcEdVaEM2VTM1allteU9jZEVibmRSbDkweWpFcVpJWDhWeDJYQ0lzZFJFOE9YazNFMjFDQXQ5RERJZnlLU0V1N2cza3U1dWhoOWxJd2dyRWtWVjFmZnNwTm8rSENSTWZVa29BLS1iMDI1NzRMQi8wUFpiWnZ6OG0wQVJ3PT0%3D--21603ca4669c79130b9cd63994aa9950627752d5; sstoken=28027938-59f218053d681e83b962a3650a3866e3347f0ac8-28027938-2e7d347d8767336e9faabefb4e9abfb047a42981",
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
