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
        "if-none-match": "W/\"ac4170aa16858fc7673efb172847faad\"",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "_ga=GA1.2.1053142990.1678815356; timezoneOffset=180; order_surebets_index=profit; uu=909bd7e8-82ce-41c0-85b7-920691491a49; cf_clearance=gqnRq.zcEM4dPKJkP6z3KobNZsOK0iVP_qELSk1fixo-1680357954-0-160; sel%3Asurebets=270fff049e4ee5beed1a62a601420b25; ab=977; _gid=GA1.2.1998464321.1681585148; _gat_gtag_UA_1803143_12=1; remember_user_token=BAhbCFsGaQNQ0wNJIhlHQURxZGljY0hMQUFod21EbkRpcwY6BkVUSSIXMTY4MTU4NTE2NC42Mjk3NzkzBjsARg%3D%3D--83036758934d1d29d92e4439a0dab2bd010d9950; stoken=28026419-cb0e1f4d46a9267859124ca643ac5c0ce62c73de; ref=UWFyMkxVeUxDcHozUzlKTmVuWkFudz09LS13bEhmOWhwNlBzNDZsTlVMRFRkWTB3PT0%3D--f57586761d4b1eb7c5fcd64b560fc8e0c4c0b408; br=cEZRMjdFUHhkUnA0UytHSkNXSUZDMDYzVEZIL25yelNkSUJiZWVwNU4zMldDVU4wSEo4YWFSL0s0Wm5qZzlKSkZOeGZvdHdiUlU3TTNDSGF2RzVUcWZrZi9KTnYya1FEMWtKbmxCdnBZYWRuck03NDBDcnRuTDNENzBRRUpmblI1VVFyR3ZWYXJYV0NLZEVnNE9EVkY0a1pYQnpXT1FqaHJaZWxsNjlPYkFqdVVuWGZDSmc2aHlrSW0xTG5NaXFuWVRLWVdaN20wQTBXQ0JKcnZSSnlXbFVTakRxbzdDZ2dNLzJGRXh4V09mVlJQR0pDeEh0QmN6bEg0ak1xTGdFYi0tNHdEcUdPM1B2Zno0SmpFMTJmMnMrZz09--5e49a69520f245419d20f3804d3d60fec1ce2acb; _sp5=MUoyMjliNEtpTEUzUXBnZm5rczN4dE5qZW5NSzBMK3k0RXg3cnM4V2hSMExIbUk1TkhCU0VkbDBDY2RvVjFtYndZd29pVm9ZR0Nub00zOHA3eFhpZmVJZXZUNTJrWnZMYS9uc053cDFoM3VTY1pGWVZBbERCWFVSQ0JEa0hhV3IwMkFXZ0ZldElJTysvalVka21ZOHlCKzM0TDdJMDVRb08zeStKbE1nb3MxYVhFY3p5N0ppTFZRUlRGTnFJQjFwMXc2cng1ZmoyNWluS1BGdjVBTGpjbzlFcHhXSzV4ZmpmTUNaN0dNaXJLMFpnc1dKMzBwTHJCM3U3MVJNVzgvd0k0WGUxbWVOdURrQXFsN2FUT1BMUTVOS3Q3ZTUwaTF3eXQzNXg1d21QOXVxYkNFNkxwbWpWK1o4c2cvYXBjNnZvWGJVaEtEdE42bmdqdkV0ZXc5dlRTVDlVRFBMQXhLcWxRL0dNZkw0NVh1U2VNaGxNVm9Dd0F1Z0R2dXFxNlNHLS03d2RJbkN2MWN6WFBIRko4czdmVEdRPT0%3D--d4e3618ce7d6670a85cb816e72d22005dd878ff9; sstoken=28026419-cb0e1f4d46a9267859124ca643ac5c0ce62c73de-28026419-f99fdb46808caaffe482aa63d24dd8904f458555",
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
