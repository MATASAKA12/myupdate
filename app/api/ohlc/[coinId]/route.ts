import { NextResponse } from "next/server"

const COINGECKO_API = "https://api.coingecko.com/api/v3"
const DEFAULT_LIMIT = 120
const MAX_LIMIT = 240

function clampLimit(limit: string | null) {
  const parsedLimit = Number(limit)

  if (!Number.isFinite(parsedLimit)) {
    return DEFAULT_LIMIT
  }

  return Math.min(Math.max(Math.floor(parsedLimit), 10), MAX_LIMIT)
}

export async function GET(
  request: Request,
  context: { params: Promise<{ coinId: string }> } // ✅ params is Promise
) {
  try {
    // ✅ MUST await params
    const { coinId } = await context.params

    if (!coinId) {
      return NextResponse.json(
        { error: "coinId is missing in route" },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = searchParams.get("days") || "7"
    const vsCurrency = searchParams.get("vs_currency") || "usd"
    const limit = clampLimit(searchParams.get("limit"))

    const validDays = ["1", "7", "14", "30", "90", "180", "365", "max"]
    const finalDays = validDays.includes(days) ? days : "7"
    const finalVsCurrency = /^[a-z]+$/i.test(vsCurrency) ? vsCurrency.toLowerCase() : "usd"

    const url = `${COINGECKO_API}/coins/${coinId}/ohlc?vs_currency=${finalVsCurrency}&days=${finalDays}`

    console.log(
      `[OHLC API] Fetching for coin: ${coinId}, days: ${finalDays}, limit: ${limit}`
    )

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("CoinGecko error:", errorText)

      return NextResponse.json(
        { error: "CoinGecko failed", details: errorText },
        { status: response.status }
      )
    }

    const rawData: number[][] = await response.json()

    const formatted = rawData.map((item) => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
    }))

    return NextResponse.json(formatted.slice(-limit))
  } catch (err: any) {
    console.error("Server error:", err)

    return NextResponse.json(
      { error: "Server error", message: err.message },
      { status: 500 }
    )
  }
}
