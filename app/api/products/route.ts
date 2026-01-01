import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

interface Product {
  categoria: string
  producto: string
  dolares: number
  guaranies: number
  pesos: number
}

export async function GET() {
  try {
    const url = "https://informaticaga.binario.com.py/reportes/rep/verReportes/280"

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error("Failed to fetch data from source")
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const products: Product[] = []

    // Find the table and parse rows
    $("table tr").each((index, element) => {
      // Skip header row
      if (index === 0) return

      const cells = $(element).find("td")
      if (cells.length >= 5) {
        const categoria = $(cells[0]).text().trim()
        const producto = $(cells[1]).text().trim()
        const dolares = Number.parseFloat($(cells[2]).text().replace(",", ".").trim()) || 0
        const guaranies = Number.parseFloat($(cells[3]).text().replace(/\./g, "").replace(",", ".").trim()) || 0
        const pesos = Number.parseFloat($(cells[4]).text().replace(/\./g, "").replace(",", ".").trim()) || 0

        if (categoria && producto) {
          products.push({
            categoria,
            producto,
            dolares,
            guaranies,
            pesos,
          })
        }
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("[v0] Error scraping products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
