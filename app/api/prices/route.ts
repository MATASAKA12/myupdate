import { NextResponse } from "next/server"

const COINGECKO_API = "https://api.coingecko.com/api/v3"

function normalizeIds(ids: string | null) {
  return ids
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .join(",")
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ids = normalizeIds(searchParams.get("ids"))

  if (!ids) {
    return NextResponse.json({ error: "Missing ids" }, { status: 400 })
  }

  const url = `${COINGECKO_API}/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: "CoinGecko failed", details: text || `Status ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (err: any) {
    return NextResponse.json(
      { error: "Server fetch failed", message: err.message },
      { status: 500 }
    )
  }
}
