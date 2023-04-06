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
        "if-none-match": "W/\"d666a9e09d8601a82895d878f2129d7d\"",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "ab=633; _ga=GA1.2.1053142990.1678815356; timezoneOffset=180; order_surebets_index=profit; sel%3Asurebets=98fc3528738b9b2f1d90b32e556aa0be; uu=909bd7e8-82ce-41c0-85b7-920691491a49; cf_clearance=gqnRq.zcEM4dPKJkP6z3KobNZsOK0iVP_qELSk1fixo-1680357954-0-160; _gid=GA1.2.833553259.1680821599; _gat_gtag_UA_1803143_12=1; remember_user_token=BAhbCFsGaQNQ0wNJIhlHQURxZGljY0hMQUFod21EbkRpcwY6BkVUSSIXMTY4MDgyMTYwOC40Mzc4MzM4BjsARg%3D%3D--4bfe0c7221e33b0c4d36e043d897a11d118f9305; stoken=28013693-e8cfc966df68d2e002f1d5bf62277e4994fb48c8; ref=eEsrUGpiZXd0Y3FhUVNmdTV4eXhOdz09LS1uK0g2ZElOaFhLWVp4UUNRbzdRZU9RPT0%3D--185bf3e6cd5ca664de41920b2be38c7853d56ec4; br=NS9tdEtQdHBMTW03NUE4ZS9pa0dSZVpJWXpQRzVCTVQzUmgzVHdRN1FpQ1RYK2s2Y2o0OXlmc29rUTB4YWpQVmU2amY1YUFtc3ozNDNTeWorU3dBVFNmWjRBQ1NqbFh5ajlOWFhrREU0UnkxalZCakYxMGNhdVBwcThnSzR5ZFVWc29ERHBxbUNWcFBzdThhSGZ4U3FVbWo1dUVySk1JZUs2bmRtK0IwVE54Z1JEZmNLOVYwUHFrZ0l3NkdGbUc3RXEwV29ocFB2Q1dPRVQyWXpkSGxVekFTVWwyaHJBYzRDYUEveUdWWTFQcDFLeUJRRjVGeGNXNG9ad1BZdkRlVC0tdk1rdERVeGhiVnhPaElPMHRLY3EwQT09--e0b816eec1104b83e605d25da42d9002e450c021; _sp5=RVVzWTAyUmpDNDhFYVU4MGtFRS9WTEppMzh4YVZxYzR5elBPZnNWZUcrczd2TTV0SitWQlRZWVlOME1rc3RuV3NuUDMyaHNhVjJnMzZ1UUlwZFRPUEY3ZmxPbDN4Q21GbXZyUDVuYUN6c3NsQ1lHK3F1c2YvMHVCUStiNjRpZnBYb1RTcnQvdlNxWk93bEZtZ0V5NHVka2t6M2lzOEh4eGtsZTNxN0RPVW5TdGo5TWdoVzdHdkQxdE1hSHRpOG9IMUZ1bktBc1FhckQ5c1NVVXdIWGJILytabU5TWGxOQVpaS3RvdGZOUng1KzFNTm1jcEtBUkppNXVpL0xjL1FBL0ovbmo1RktGaS85M1JaZ3Z4ZUVhZ2oxVHRJeUM5Qzd3bEpUUUhuenNka25zYWNGbHNkSlNlMGs0cSs3WGRKaTA2NXRsUUl0VU0zY241N2hKZW5tRzNlUWYrTEcwVW93anVRSU9jN0V5dnIvZDlIQXFGdVVzM0t6YUZoOUVsdGN6LS1KS2hyWFN0K25nNGdaRjdtU0pKZDB3PT0%3D--e93d726086906745b0a185b043af58ec30aa1886; sstoken=28013693-e8cfc966df68d2e002f1d5bf62277e4994fb48c8-28013693-5128b8b36c0c4d7a7b8b1142e1bf7687bb5c5fa8",
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
