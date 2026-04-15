"use client"

import { useState, useEffect } from "react"
import { cryptoData } from "@/lib/crypto-data" // your existing static data

// CoinGecko ID mapping (add more coins here as needed)
const symbolToId: Record<string, string> = {
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

interface LivePrice {
  price: number
  change24h: number
}

export function useLivePrices() {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({})
  const [loading, setLoading] = useState(true)

  const fetchPrices = async () => {
    const ids = Object.values(symbolToId).join(",")
    if (!ids) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/prices?ids=${encodeURIComponent(ids)}`, {
        cache: "no-store",
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const errorMessage =
          typeof data?.details === "string"
            ? data.details
            : typeof data?.message === "string"
              ? data.message
              : typeof data?.error === "string"
                ? data.error
                : `Request failed with status ${res.status}`

        throw new Error(errorMessage)
      }

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Live prices response was invalid")
      }

      const newPrices: Record<string, LivePrice> = {}

      Object.keys(symbolToId).forEach((symbol) => {
        const id = symbolToId[symbol]
        const priceData = data[id]

        if (priceData && typeof priceData.usd === "number") {
          newPrices[symbol] = {
            price: priceData.usd,
            change24h: typeof priceData.usd_24h_change === "number" ? priceData.usd_24h_change : 0,
          }
        }
      })

      if (Object.keys(newPrices).length > 0) {
        setPrices(newPrices)
      } else {
        throw new Error("Live prices payload did not include any usable markets")
      }
    } catch (error) {
      console.warn("Failed to fetch live prices, falling back to static data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices() // initial fetch

    const interval = setInterval(fetchPrices, 30_000) // every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Helper to get live data for a symbol (falls back to your static data)
  const getLiveData = (symbol: string) => {
    const staticCoin = cryptoData.find((c) => c.symbol === symbol) || cryptoData[0]
    const live = prices[symbol]

    return live
      ? {
          ...staticCoin,
          price: live.price,
          change24h: live.change24h,
        }
      : staticCoin
  }

  return { getLiveData, loading }
}
