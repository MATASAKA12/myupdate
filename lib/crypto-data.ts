export interface CryptoData {
  symbol: string
  name: string
  price: number
  change24h: number
  sparkline: number[]
}

export const cryptoData: CryptoData[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 67234.56,
    change24h: 2.34,
    sparkline: [65000, 65500, 66000, 65800, 66500, 67000, 67234],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3456.78,
    change24h: -1.23,
    sparkline: [3500, 3480, 3450, 3420, 3440, 3460, 3456],
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 178.9,
    change24h: 5.67,
    sparkline: [165, 168, 172, 175, 173, 177, 178],
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 567.12,
    change24h: 0.89,
    sparkline: [560, 562, 565, 563, 566, 568, 567],
  },
  {
    symbol: "XRP",
    name: "XRP",
    price: 0.5234,
    change24h: -2.45,
    sparkline: [0.54, 0.535, 0.53, 0.525, 0.522, 0.524, 0.523],
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: 0.4567,
    change24h: 3.21,
    sparkline: [0.44, 0.445, 0.45, 0.448, 0.452, 0.455, 0.456],
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.1234,
    change24h: 8.9,
    sparkline: [0.11, 0.115, 0.118, 0.12, 0.122, 0.124, 0.123],
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 34.56,
    change24h: -0.56,
    sparkline: [35, 34.8, 34.5, 34.3, 34.4, 34.5, 34.56],
  },
  {
    symbol: "SHIB",
    name: "Shiba Inu",
    price: 0.00002345,
    change24h: 12.34,
    sparkline: [0.00002, 0.000021, 0.000022, 0.0000225, 0.000023, 0.0000232, 0.00002345],
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    price: 14.56,
    change24h: 1.78,
    sparkline: [14, 14.2, 14.3, 14.25, 14.4, 14.5, 14.56],
  },
]

export function getCryptoBySymbol(symbol: string): CryptoData | undefined {
  return cryptoData.find((c) => c.symbol.toLowerCase() === symbol.toLowerCase())
}

export function formatPrice(price: number): string {
  if (price < 0.01) {
    return `$${price.toFixed(8)}`
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`
  }
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : ""
  return `${sign}${change.toFixed(2)}%`
}
