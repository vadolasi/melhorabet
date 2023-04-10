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
        "if-none-match": "W/\"cb34ebb5b96aad7ecb47fe8af0e9fee7\"",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "ab=633; _ga=GA1.2.1053142990.1678815356; timezoneOffset=180; order_surebets_index=profit; uu=909bd7e8-82ce-41c0-85b7-920691491a49; cf_clearance=gqnRq.zcEM4dPKJkP6z3KobNZsOK0iVP_qELSk1fixo-1680357954-0-160; _gid=GA1.2.1027739129.1680996904; sel%3Asurebets=270fff049e4ee5beed1a62a601420b25; _gat_gtag_UA_1803143_12=1; remember_user_token=BAhbCFsGaQNQ0wNJIhlHQURxZGljY0hMQUFod21EbkRpcwY6BkVUSSIXMTY4MTEyNzQ4MC4zNDMyODk5BjsARg%3D%3D--bf9bd6452ccab7a776c3cc18fc50cf51735af957; stoken=28018791-3638a15d7af54164d31cbde3364d29d136866088; ref=VjNLbC9HOUJJcldTREZidlFYOUlndz09LS1SbjhrTUdrS1haVTExeXRRU0Z2cmRnPT0%3D--f6fa223625dc8aee5e94af52cf5008d4c1c2305b; br=TnhWZ2djSTJPNHMvR1JlVDNKL1l1bWQvR2p1SFdHNjgwc245SWJNWDcrcm8yajMwRVhtcGxrM0JvbDgyUUx3SWEyQmI4MEEzYWlqRDZBcWszYm40OXlQZjdpNTNXNklZb2dZVHB3YUxZTnBPVTFOYVp1TzZJUzJKazdtREhMRDU0WC9ZSVVBeHNodGxxV1diNW5WUGNsSmxsTVNibzZ0enZUQys4U3dWbi9JNVpIYmJNdzdkMUtrWkt6UzdpaGRWRGtCNE95Z3RpTFVNdDlraGU4Y0RDakxzU2pHR3Q0cnc3WTF6K25kNENtZmdWemdKR1M0cTZ3SXA0Y3BpdnRPRi0tS2NwWk5RckJPSkRZTnM4NnB6TDFUdz09--c78713360a0477597a248a1ba3f3508d5f58f880; _sp5=M0ErTXZaZTYwQnUyQnQ2eE5ENzgwNHJNUFhsN00rYVJyMzJxOC9ZUCtiTkZseWJLVStzZzBBSTJDZWl0T09ESlFoQWExMk5VbWhwRHpyaUcxTnM1cHhjdmZWZHNEYmEyQWJCaXZoOW9uUldkUlVEejJ2OGpzSy9CSlRDbTJ6N3ROSDllNkRxa29yNCtQTWllaGJMbFVlblRySWxTMEZleW5GT1ZGOWFjTEs1Uzk1SGRoTmFScVZRSE9FVXFpdVJWNDM2djBNaGdhQ0hBZ1R1UGRYWVdjNnUwcFMvY01hVkdWaEhlSGtrZDVCeFI0M1A3ZDZSYk1KSnhHbnVDT3NXV3Y0aHRlWU1ZVlZxRkNQWjluYmYyUTdoVlhYVk5vWGNXY21JUk92aWo0WnJSWUZrZlVLRVpoSVRxSU5pWGtlWXBEdWN1Rlh3WDBXZ3NGZ0U5MDRFNXJnK0txNUs1YTVwL05RMjlINFNRb3A5VCtHVGU2dHF6cmF2R2pqTi9Ca2RPLS1FS3d5RHVUSnBJVmFEYnVNQnFIb1hnPT0%3D--b7c2867a3a7343a4530eb14de12f638063399c22; sstoken=28018791-3638a15d7af54164d31cbde3364d29d136866088-28018791-feb3c3d7d0f5e84be9ce1b741eff01cb67d4e0cf",
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
