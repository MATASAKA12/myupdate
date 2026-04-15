"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cryptoData, formatPrice, formatChange } from "@/lib/crypto-data"
import { coinLogos } from "@/lib/coingecko"
import { TrendingUp, TrendingDown } from "lucide-react"

function MiniSparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(" ")

  return (
    <svg className="w-20 h-10" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth="3"
        points={points}
      />
    </svg>
  )
}

function CoinIcon({ symbol }: { symbol: string }) {
  const logoUrl = coinLogos[symbol]

  if (logoUrl) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
        <Image
          src={logoUrl}
          alt={symbol}
          width={40}
          height={40}
          className="object-contain"
           style={{ width: "auto", height: "auto" }} 
          crossOrigin="anonymous"
        />
      </div>
    )
  }

  // Fallback for coins without logos
  const colors: Record<string, string> = {
    BTC: "from-amber-400 to-orange-500",
    ETH: "from-blue-400 to-blue-600",
    SOL: "from-purple-400 to-purple-600",
    BNB: "from-yellow-400 to-yellow-600",
    XRP: "from-gray-400 to-gray-600",
    ADA: "from-sky-400 to-sky-600",
    DOGE: "from-amber-300 to-amber-500",
    AVAX: "from-red-400 to-red-600",
    SHIB: "from-orange-400 to-orange-600",
    LINK: "from-blue-500 to-blue-700",
  }

  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[symbol] || "from-gray-400 to-gray-600"} flex items-center justify-center shadow-lg`}>
      <span className="text-xs font-bold text-white">{symbol.slice(0, 2)}</span>
    </div>
  )
}

export function MarketList() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Top 10 Cryptocurrencies
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track real-time prices and market trends. Click any coin to start trading.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cryptoData.map((coin) => {
            const isPositive = coin.change24h >= 0

            return (
              <Link key={coin.symbol} href={`/trade/${coin.symbol}`}>
                <Card className="glass border-white/10 hover:border-primary/50 transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CoinIcon symbol={coin.symbol} />
                        <div>
                          <p className="font-semibold text-foreground">{coin.symbol}</p>
                          <p className="text-xs text-muted-foreground">{coin.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {formatPrice(coin.price)}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`mt-1 ${
                            isPositive
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {formatChange(coin.change24h)}
                        </Badge>
                      </div>

                      <MiniSparkline data={coin.sparkline} isPositive={isPositive} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
