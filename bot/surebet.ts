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
    let response = await fetch("https://pt.surebet.com/surebets?utf8=%E2%9C%93&filter%5Bselected%5D%5B%5D=&filter%5Bselected%5D%5B%5D=33891145&filter%5Bsave%5D=&filter%5Bcurrent_id%5D=33891145&selector%5Border%5D=profit&selector%5Boutcomes%5D%5B%5D=&selector%5Boutcomes%5D%5B%5D=2&selector%5Bmin_profit%5D=3.0&selector%5Bmax_profit%5D=15.0&selector%5Bmin_roi%5D=&selector%5Bmax_roi%5D=&selector%5Bsettled_in%5D=0&selector%5Bbookies_settings%5D=0%3A67%3A%3A%3B0%3A71%3A%3A%3B0%3A66%3A%3A%3B0%3A74%3A%3A%3B0%3A179%3A%3A%3B0%3A73%3A%3A%3B4%3A145%3A%3A%3B0%3A208%3A%3A%3B0%3A70%3A%3A%3B0%3A111%3A%3A%3B0%3A129%3A%3A%3B0%3A222%3A%3A%3B0%3A123%3A%3A%3B0%3A21%3A%3A%3B0%3A243%3A%3A%3B4%3A26%3A%3A%3B0%3A136%3A%3A%3B0%3A147%3A%3A%3B4%3A199%3A%3A%3B0%3A148%3A%3A%3B0%3A23%3A%3A%3B0%3A201%3A%3A%3B0%3A197%3A%3A%3B0%3A200%3A%3A%3B0%3A0%3A%3A%3B0%3A32%3A%3A%3B0%3A65%3A%3A%3B0%3A158%3A%3A%3B0%3A29%3A%3A%3B4%3A10%3A%3A%3B0%3A45%3A%3A%3B0%3A225%3A%3A%3B0%3A58%3A%3A%3B0%3A250%3A%3A%3B0%3A162%3A%3A%3B0%3A177%3A%3A%3B0%3A205%3A%3A%3B0%3A14%3A%3A%3B0%3A194%3A%3A%3B0%3A11%3A%3A%3B0%3A185%3A%3A%3B4%3A38%3A%3A%3B0%3A144%3A%3A%3B0%3A195%3A%3A%3B0%3A55%3A%3A%3B0%3A184%3A%3A%3B0%3A33%3A%3A%3B0%3A173%3A%3A%3B0%3A122%3A%3A%3B4%3A245%3A%3A%3B0%3A233%3A%3A%3B0%3A49%3A%3A%3B0%3A212%3A%3A%3B0%3A62%3A%3A%3B0%3A12%3A%3A%3B0%3A190%3A%3A%3B0%3A46%3A%3A%3B0%3A226%3A%3A%3B0%3A207%3A%3A%3B0%3A143%3A%3A%3B0%3A114%3A%3A%3B0%3A132%3A%3A%3B0%3A24%3A%3A%3B0%3A85%3A%3A%3B0%3A72%3A%3A%3B0%3A255%3A%3A%3B0%3A151%3A%3A%3B0%3A126%3A%3A%3B0%3A211%3A%3A%3B0%3A227%3A%3A%3B0%3A142%3A%3A%3B0%3A133%3A%3A%3B0%3A106%3A%3A%3B0%3A254%3A%3A%3B0%3A5%3A%3A%3B0%3A6%3A%3A%3B4%3A242%3A%3A%3B0%3A232%3A%3A%3B0%3A172%3A%3A%3B0%3A221%3A%3A%3B0%3A187%3A%3A%3B0%3A4%3A%3A%3B0%3A180%3A%3A%3B0%3A239%3A%3A%3B0%3A210%3A%3A%3B0%3A241%3A%3A%3B0%3A30%3A%3A%3B0%3A15%3A%3A%3B0%3A209%3A%3A%3B0%3A216%3A%3A%3B0%3A125%3A%3A%3B0%3A230%3A%3A%3B0%3A50%3A%3A%3B0%3A9%3A%3A%3B0%3A176%3A%3A%3B0%3A256%3A%3A%3B0%3A175%3A%3A%3B0%3A127%3A%3A%3B0%3A130%3A%3A%3B4%3A244%3A%3A%3B0%3A3%3A%3A%3B0%3A237%3A%3A%3B0%3A8%3A%3A%3B0%3A115%3A%3A%3B0%3A86%3A%3A%3B0%3A163%3A%3A%3B0%3A121%3A%3A%3B0%3A223%3A%3A%3B0%3A206%3A%3A%3B0%3A164%3A%3A%3B0%3A161%3A%3A%3B4%3A246%3A%3A%3B0%3A39%3A%3A%3B0%3A171%3A%3A%3B0%3A31%3A%3A%3B0%3A51%3A%3A%3B0%3A178%3A%3A%3B0%3A2%3A%3A%3B0%3A140%3A%3A%3B4%3A7%3A%3A%3B0%3A186%3A%3A%3B0%3A234%3A%3A%3B0%3A47%3A%3A%3B0%3A231%3A%3A%3B0%3A248%3A%3A%3B0%3A215%3A%3A%3B0%3A120%3A%3A%3B0%3A198%3A%3A%3B0%3A251%3A%3A%3B0%3A25%3A%3A%3B0%3A69%3A%3A%3B0%3A137%3A%3A%3B0%3A116%3A%3A%3B0%3A16%3A%3A%3B0%3A204%3A%3A%3B0%3A229%3A%3A%3B0%3A220%3A%3A%3B0%3A160%3A%3A%3B0%3A253%3A%3A%3B0%3A170%3A%3A%3B0%3A188%3A%3A%3B0%3A183%3A%3A%3B0%3A189%3A%3A%3B0%3A43%3A%3A%3B0%3A240%3A%3A%3B0%3A196%3A%3A%3B0%3A181%3A%3A%3B0%3A18%3A%3A%3B0%3A59%3A%3A%3B0%3A213%3A%3A%3B0%3A83%3A%3A%3B0%3A117%3A%3A%3B0%3A202%3A%3A%3B0%3A146%3A%3A%3B0%3A124%3A%3A%3B0%3A17%3A%3A%3B0%3A107%3A%3A%3B0%3A235%3A%3A%3B0%3A236%3A%3A%3B0%3A214%3A%3A%3B0%3A53%3A%3A%3B0%3A152%3A%3A%3B0%3A28%3A%3A%3B0%3A217%3A%3A%3B0%3A219%3A%3A%3B0%3A247%3A%3A%3B0%3A249%3A%3A%3B0%3A44%3A%3A%3B0%3A193%3A%3A%3B0%3A224%3A%3A%3B0%3A203%3A%3A%3B0%3A218%3A%3A%3B0%3A27%3A%3A&selector%5Bexclude_sports_ids_str%5D=56+57+0+43+32+1+2+3+55+60+7+6+5+28+8+44+9+26+34+10+11+12+39+47+46+48+49+59+14+27+53+54+58+16+30+13+17+18+29+45+19+36+33+31+40+42+41+20+62+61+50+51+63+21+37+23+22+35+24+38+25&selector%5Bextra_filters%5D=&commit=Filtrar&narrow=", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        "if-none-match": "W/\"e1029b7627b2d788e6971cd9b2895e0a\"",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "_ga=GA1.2.1053142990.1678815356; timezoneOffset=180; order_surebets_index=profit; uu=909bd7e8-82ce-41c0-85b7-920691491a49; cf_clearance=gqnRq.zcEM4dPKJkP6z3KobNZsOK0iVP_qELSk1fixo-1680357954-0-160; sel%3Asurebets=270fff049e4ee5beed1a62a601420b25; ab=977; _gid=GA1.2.870864846.1682507906; remember_user_token=BAhbCFsGaQNQ0wNJIhlHQURxZGljY0hMQUFod21EbkRpcwY6BkVUSSIXMTY4MjU1MDk4Ni43MzUxMTE3BjsARg%3D%3D--f40013d9ef0307d55afbcc8aa76753713405fd31; stoken=28042516-2c2f8b138a1f08c80e3edabab7cb3c3e33071806; ref=Rnd3MUhKS05rWDZaTHgrbWZjL01tZz09LS0xUE5sNUk4clZ6SGliUkl2a004YkRnPT0%3D--cbca10a7a40c4b20416e947e97b145db53e7976b; br=TC93WVR2T3FLUjZzU1ptaE5pZitFTTlCK1RVbWZSVHBFSWJVLytZblVJQldYODNNOTlkYkpPZERoUHQ5anJpRlRqZWN1bVlOdVVEbFdBeFN0S3RPaEE0Q1hDVnZoRTU1N1VLdFU1S1o2N1RIRnVQM1VYNCtUUmJMM0htTWl4N2lDVUcvQnpYeVBFNWhpdGpLWldlOElsY1JsdEVhQmtPSWJIaC8rc0lHeVBHVlhJVmdIQ1MrcE5tdnpXVVpxNFVlLzFnZmJHOGFuaHVCdVVzSWdNM3BmZ09LZkYrc1pHQkgxNjE1UmpSRDdrM1FodHIvWWF1MklzdnZSZ0VIUm5qSC0ta0FoWkU1YTZpOHpmRVJYcWJuK2RpZz09--0aaeb40712c9790cab5ac4df56b4ffb2b5f10d47; _sp5=RnQyTlg0LzJubmhmQjJIbjNPb1NSdFRKcHh5N24zWTBWVEpYeDZrWUM1ME91U3lMOFZ0RVB5YWdSbkJXR3kwY29ud2dib2lKSjRRdXF4UG01V2ZvOFl2SDFKaWlZcVVZM1BCSkFTeitFUU53dzNpazdic1N4TXQ2RE5xVVFhd0RKSDM3aTNiU1pUYlF4MEs3TWU4UUtxTWZpaHBTckVjR0tWTERTa3M0QWxOUjUyVzdEaXBUbnRmTUs3UHp4M0JydnllaVZpd1FZVURLZUxxNExBMzBGWFZRamt1eERJbkg4dVAwV1lBVWFNNXpnQ3lvUzR1cGhoYzNxWDlNd1hjcTlxQzhKMmZ6L01keXpDYTgrWGxnV203eUY5MTRiWFdta3JvRUNsSmcwWWJPK0o0UGkwdldhWmN0ZE9UKzFBc3lFYlJPN1JwRXZ6MmJZYXgvaENyT3JBYTJ1QjVCaEhFcWtOZmNDMkVzcmFXa1FqbXQ5RlJ1KzBSVExxVEI4MzVBLS1VdGZQd0dFU1E3NUtDTHZnWTBDZzl3PT0%3D--95ed4d3f6ca1418ee4e508f63ef7cbc29a714475; sstoken=28042516-2c2f8b138a1f08c80e3edabab7cb3c3e33071806-28042517-941e54fbba25803db40e899827d279586026043d; _gat_gtag_UA_1803143_12=1"
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
