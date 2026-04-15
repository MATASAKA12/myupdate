// CoinGecko API service for real-time crypto data
const COINGECKO_API = "https://api.coingecko.com/api/v3"

export interface CoinMarketData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  sparkline_in_7d?: {
    price: number[]
  }
}

export interface OHLCData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
}

// Map of coin symbols to CoinGecko IDs
export const coinIdMap: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  SHIB: "shiba-inu",
  LINK: "chainlink",
}

// Real logo URLs from CoinGecko
export const coinLogos: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  BNB: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  XRP: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  ADA: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
  SHIB: "https://assets.coingecko.com/coins/images/11939/large/shiba.png",
  LINK: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
}

export async function fetchMarketData(): Promise<CoinMarketData[]> {
  const ids = Object.values(coinIdMap).join(",")
  const response = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`,
    { next: { revalidate: 60 } } // Cache for 60 seconds
  )

  if (!response.ok) {
    throw new Error("Failed to fetch market data")
  }

  return response.json()
}

export async function fetchOHLCData(coinId: string, days: number = 7): Promise<OHLCData[]> {
  const response = await fetch(
    `${COINGECKO_API}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
    { next: { revalidate: 60 } }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch OHLC data")
  }

  const data: number[][] = await response.json()

  return data.map((item) => ({
    timestamp: item[0],
    open: item[1],
    high: item[2],
    low: item[3],
    close: item[4],
  }))
}

export async function fetchCoinPrice(coinId: string): Promise<{ price: number; change24h: number }> {
  const response = await fetch(
    `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
    { next: { revalidate: 30 } }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch coin price")
  }

  const data = await response.json()
  return {
    price: data[coinId]?.usd || 0,
    change24h: data[coinId]?.usd_24h_change || 0,
  }
}
