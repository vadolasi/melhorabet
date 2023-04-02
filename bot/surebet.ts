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
    let response = await fetch("https://pt.surebet.com/surebets?utf8=%E2%9C%93&filter%5Bselected%5D%5B%5D=&filter%5Bselected%5D%5B%5D=33891145&filter%5Bsave%5D=&filter%5Bcurrent_id%5D=33891145&selector%5Border%5D=profit&selector%5Boutcomes%5D%5B%5D=&selector%5Boutcomes%5D%5B%5D=2&selector%5Bmin_profit%5D=3.0&selector%5Bmax_profit%5D=15.0&selector%5Bmin_roi%5D=&selector%5Bmax_roi%5D=&selector%5Bsettled_in%5D=172800&selector%5Bbookies_settings%5D=0%3A67%3A%3A%3B0%3A71%3A%3A%3B0%3A66%3A%3A%3B0%3A74%3A%3A%3B0%3A179%3A%3A%3B0%3A73%3A%3A%3B4%3A145%3A%3A%3B0%3A208%3A%3A%3B0%3A70%3A%3A%3B0%3A111%3A%3A%3B0%3A129%3A%3A%3B0%3A222%3A%3A%3B0%3A123%3A%3A%3B0%3A21%3A%3A%3B0%3A243%3A%3A%3B4%3A26%3A%3A%3B0%3A136%3A%3A%3B0%3A147%3A%3A%3B4%3A199%3A%3A%3B0%3A148%3A%3A%3B0%3A23%3A%3A%3B0%3A201%3A%3A%3B0%3A197%3A%3A%3B0%3A200%3A%3A%3B0%3A0%3A%3A%3B0%3A32%3A%3A%3B0%3A65%3A%3A%3B0%3A158%3A%3A%3B0%3A29%3A%3A%3B4%3A10%3A%3A%3B0%3A45%3A%3A%3B0%3A225%3A%3A%3B0%3A58%3A%3A%3B0%3A162%3A%3A%3B0%3A177%3A%3A%3B0%3A205%3A%3A%3B0%3A14%3A%3A%3B0%3A194%3A%3A%3B0%3A11%3A%3A%3B0%3A185%3A%3A%3B4%3A38%3A%3A%3B0%3A144%3A%3A%3B0%3A195%3A%3A%3B0%3A55%3A%3A%3B0%3A184%3A%3A%3B0%3A33%3A%3A%3B0%3A173%3A%3A%3B0%3A122%3A%3A%3B0%3A233%3A%3A%3B0%3A49%3A%3A%3B0%3A212%3A%3A%3B0%3A62%3A%3A%3B0%3A12%3A%3A%3B0%3A190%3A%3A%3B0%3A46%3A%3A%3B0%3A226%3A%3A%3B0%3A207%3A%3A%3B0%3A143%3A%3A%3B0%3A114%3A%3A%3B0%3A132%3A%3A%3B0%3A24%3A%3A%3B0%3A85%3A%3A%3B0%3A72%3A%3A%3B0%3A151%3A%3A%3B0%3A126%3A%3A%3B0%3A211%3A%3A%3B0%3A227%3A%3A%3B0%3A142%3A%3A%3B0%3A133%3A%3A%3B0%3A106%3A%3A%3B0%3A5%3A%3A%3B0%3A6%3A%3A%3B4%3A242%3A%3A%3B0%3A232%3A%3A%3B0%3A172%3A%3A%3B0%3A221%3A%3A%3B0%3A187%3A%3A%3B0%3A4%3A%3A%3B0%3A180%3A%3A%3B0%3A239%3A%3A%3B0%3A210%3A%3A%3B0%3A241%3A%3A%3B0%3A30%3A%3A%3B0%3A15%3A%3A%3B0%3A209%3A%3A%3B0%3A216%3A%3A%3B0%3A125%3A%3A%3B0%3A230%3A%3A%3B0%3A50%3A%3A%3B0%3A9%3A%3A%3B0%3A176%3A%3A%3B0%3A175%3A%3A%3B0%3A41%3A%3A%3B0%3A127%3A%3A%3B0%3A130%3A%3A%3B0%3A3%3A%3A%3B0%3A237%3A%3A%3B0%3A8%3A%3A%3B0%3A115%3A%3A%3B0%3A86%3A%3A%3B0%3A163%3A%3A%3B0%3A121%3A%3A%3B0%3A223%3A%3A%3B0%3A206%3A%3A%3B0%3A164%3A%3A%3B0%3A161%3A%3A%3B0%3A39%3A%3A%3B0%3A171%3A%3A%3B0%3A31%3A%3A%3B0%3A51%3A%3A%3B0%3A178%3A%3A%3B0%3A2%3A%3A%3B0%3A140%3A%3A%3B4%3A7%3A%3A%3B0%3A186%3A%3A%3B0%3A234%3A%3A%3B0%3A47%3A%3A%3B0%3A231%3A%3A%3B0%3A215%3A%3A%3B0%3A120%3A%3A%3B0%3A198%3A%3A%3B0%3A25%3A%3A%3B0%3A69%3A%3A%3B0%3A137%3A%3A%3B0%3A116%3A%3A%3B0%3A16%3A%3A%3B0%3A204%3A%3A%3B0%3A229%3A%3A%3B0%3A220%3A%3A%3B0%3A160%3A%3A%3B0%3A170%3A%3A%3B0%3A188%3A%3A%3B0%3A183%3A%3A%3B0%3A189%3A%3A%3B0%3A43%3A%3A%3B0%3A240%3A%3A%3B0%3A196%3A%3A%3B0%3A181%3A%3A%3B0%3A18%3A%3A%3B0%3A59%3A%3A%3B0%3A213%3A%3A%3B0%3A83%3A%3A%3B0%3A117%3A%3A%3B0%3A202%3A%3A%3B0%3A146%3A%3A%3B0%3A124%3A%3A%3B0%3A17%3A%3A%3B0%3A107%3A%3A%3B0%3A235%3A%3A%3B0%3A236%3A%3A%3B0%3A214%3A%3A%3B0%3A53%3A%3A%3B0%3A152%3A%3A%3B0%3A28%3A%3A%3B0%3A217%3A%3A%3B0%3A219%3A%3A%3B0%3A44%3A%3A%3B0%3A193%3A%3A%3B0%3A224%3A%3A%3B0%3A203%3A%3A%3B0%3A218%3A%3A%3B0%3A27%3A%3A&selector%5Bexclude_sports_ids_str%5D=56+57+0+43+32+1+2+3+4+55+60+7+6+5+28+8+44+9+26+34+10+11+12+39+47+46+48+49+59+14+27+53+54+58+16+30+13+17+18+29+45+19+36+33+31+40+42+41+20+62+61+50+51+21+37+23+22+35+24+38+25&selector%5Bextra_filters%5D=2&commit=Filtrar&narrow=", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        "if-none-match": "W/\"30c725f372c672b3e00135ab59191465\"",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "ab=633; _ga=GA1.2.1053142990.1678815356; timezoneOffset=180; order_surebets_index=profit; sel%3Asurebets=98fc3528738b9b2f1d90b32e556aa0be; uu=909bd7e8-82ce-41c0-85b7-920691491a49; cf_chl_2=3650fbf5ba18d1d; cf_clearance=gqnRq.zcEM4dPKJkP6z3KobNZsOK0iVP_qELSk1fixo-1680357954-0-160; _gid=GA1.2.136463659.1680357957; remember_user_token=BAhbCFsGaQNQ0wNJIhlHQURxZGljY0hMQUFod21EbkRpcwY6BkVUSSIXMTY4MDM1ODE1MS4wNTk5OTgzBjsARg%3D%3D--92fea4e3b5fdd927af937c5005eaf336965e1d2d; stoken=28005969-b9ee1266c16e6a8afdf22803f30c7f1eaa7562bd; _gat_gtag_UA_1803143_12=1; ref=YVFJVVkvR1JqekZFZUNyRWFiSkdJZz09LS05U1loSkZ0MTl5RWlXbE1OVjJEN1VBPT0%3D--5206c7e1f25bd6a8192e24cd443d91a136275e3e; br=ZS8vb2xlNW95MXpIVUFPOVFydXBHWWQ4OVl6d2RQanhNdmRvUG5kUFEyWkZiWU9OYXg2MjFaSTJrcXdQUGwxVzFGMnRuWkd2bjlKaWpvT2tGRllsWVA4U1hDclo0N3BGNXMxWTJ5aFZCdk94Vy9CUkcwRnVRZUROZndiT0hEZkltQUJBUEhpL1QxN0tkWTlTMWQzU0Zjb2lNVldVT1NJMGpwblBNQ01MQmVqeW1ydGpqaSt6b251UE5TMGR0NnQvbjkwRXNxNWhJWWRVcmpJYW8vSCtITGQ0WTdKMU5WQ1Y0S1VvdWg3b2FGWWdBNWl1aFVLV2JFMVQ5RnNTa1V0YS0tampHR2NyN2Q2ZS9ZQW80L0I0QWlSdz09--b6b7b4e05713456b4454db1a55736d8a746b9595; _sp5=N2k5dmF4K0t6ZGlJY040TjNZZnZEWWxFckFhU1QrQVBVSmtPRUxuNGhTVFh0dm1CbXdnMGV1OG5XQWtwbWdTWDR2bWN2b3FxcE9VTlcyYkxwT1BQRUVLbkhYWlQ5eTdKZGo4dEpnVGQ5eFViKy9TZWlsS0R0VmliMlJZZDdXVitQTnl6Q1RmVG5PRk8zZlVld3MrMG5ZYlA5NFJRM3N5MC9pQjB0ZFF2NEwwdTNQYnJ0ZlpzYTVURTFsNTNobTJodllFZ280T0g3SjZheStxTllNc2dsUVRsbWxTcGlvVjA0Q0dmMVVPcTRGSEpTTjl6ZkNlbmF2U29DMUtoVUxtd3dXcmZDTzhvbW1OQVI2YWNoUUFyS1UwL0RWZXhhYU0vc1VzWCtaRXV2UFcrVGNlN0g5UUFId00rYXQ4U0NaMVdrSUFleXNWOTFmL2NXeE03aGZQa3pWVzlxbFdWYTMrdlRxby81OFV2WWtyYlZSb295N2J1NHBBSVBldWI4UGxGLS1tWFJPbkRyNmVaK1dCdDVyUWlUQTVRPT0%3D--7596665ab1f504d1135ec4e4cc7f12c6113bf21e; sstoken=28005969-b9ee1266c16e6a8afdf22803f30c7f1eaa7562bd-28005970-752911b3c6b36f0ff930d68197e6fc87017f7269"
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
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
