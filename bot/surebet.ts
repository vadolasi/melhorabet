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
        "if-none-match": "W/\"49cfa3b6cd277a71ef29fbd3aba41a10\"",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "_ga=GA1.2.1053142990.1678815356; timezoneOffset=180; order_surebets_index=profit; uu=909bd7e8-82ce-41c0-85b7-920691491a49; cf_clearance=gqnRq.zcEM4dPKJkP6z3KobNZsOK0iVP_qELSk1fixo-1680357954-0-160; sel%3Asurebets=270fff049e4ee5beed1a62a601420b25; ab=977; _gid=GA1.2.870864846.1682507906; remember_user_token=BAhbCFsGaQNQ0wNJIhlHQURxZGljY0hMQUFod21EbkRpcwY6BkVUSSIXMTY4MjU0OTM3Ny40MDIzMjEzBjsARg%3D%3D--c61417cc15b4c50ec5e97db4bfa36417d62b02e4; stoken=28042489-595da51dfeb9522bfcd35375ff618a9c3ed1353b; ref=a1BDemMrNUxDK29RbWRPSmxlaEgxdz09LS1FWkF5MVhOWU1uTDl6TnpYQXkrVTFRPT0%3D--ba7d900866c6a4a8314862344313d121d6534a8f; br=SkVWMCtwaWVBUVo5WUdSVmxnbDBFd2tINXQ5QlNHVDJSMVdlblZldHFweFBINTNMMDk5SzRwTWNlUHlkRmlXdGsvZkp4OVI4Y3ovSnNYQ0dZRFJLVG9ERzYrbllzSzBjOWUvaldLYktkZDdpZzF1TURGWTJ1QXZ3TkpUbUs2dmZES2RncjdrdlFtR0Y3bE1zN3RXWGlTV0Fnd2ZaMmVjU1BrcnoxeFNaai9wbHlCTDlCYTJ4T3hTaU5Kdnkvc09oOXk2TlJRS1JzSjc0S0p5ZTdVYW83M0IwQXpyaFFoUElFUzBrR1JWKzM1MFR4YjNtQzRsSFFKRW9Sak84ZEJnci0tT1NEaUgya2JJcHM0dHEveTF4cUZ6dz09--5fea6650db3b3a583ddaca206a3a67b13626d869; _sp5=a24zaWo0aXVqQklLWDFQZXRDM2lZenVGejlxOGl6L0grWjJ5MS9CT05kUlZ3alhnVTZjTndYNHFBbUNLNnFRV2JqT3JHTDY0SUR5MVVJc3Rpa09hT3JBQlIxb0FHTmRsMmtIa1VDSVRpdXkwdTBObytJbGpHTElqYk5GNndnWXRueDNpdVZaMXVKaHBTYUtjc2svVXdjYzN6d2dKTnVMQ3YrZ21wNzlzOWxZbEs3b2VwU1QyZm9YVWdSSlROVDFqUDNrWDkzcU5jMHc0cTNQQ2FsUUE4TkZrTzN1YUZIYjJ2ZXdMSUcyMlJKQ0Jrd3o2czQ2Z0oxOWN4N014b0VDaHB5U3JLQjlKV2JOaTVUTm9DNWhQZnhoaUowbVRvcFBhOFJvV1Q4WTl2UDJBbkFRZlAxSTd0YlZSRGhnVnRsTUdzNFJ1Qjl0aXczOU1UbVRJbDJrZEpxQ3RpM1JuYy94UzFGM3p6ajBMM2Q2NDlSZnVjQnpnc3JlV3pPN1h4WFVELS1kbVBKaVJUK2lJNzRrcXhJL3BFWHNnPT0%3D--e76b46db1f09fa7251cf8515e607ef63b6850845; sstoken=28042489-595da51dfeb9522bfcd35375ff618a9c3ed1353b-28042513-91d2ac482b061c12a067ed6294f0885f434b2a40",
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
