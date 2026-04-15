"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { cryptoData, formatPrice, formatChange } from "@/lib/crypto-data"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { toast } from "sonner"
import { CandlestickChart } from "@/components/candlestick-chart"
import { useLivePrices } from "@/hooks/use-live-prices"

const COINS = cryptoData.map((coin) => coin.symbol)
const DEFAULT_COIN = "BTC"

interface TradingDashboardProps {
  initialCoin?: string
}

function normalizeCoin(coin?: string) {
  const uppercasedCoin = coin?.toUpperCase() || DEFAULT_COIN
  return COINS.includes(uppercasedCoin) ? uppercasedCoin : DEFAULT_COIN
}

export function TradingDashboard({ initialCoin = DEFAULT_COIN }: TradingDashboardProps) {
  const router = useRouter()
  const { portfolioBalance, tradeHistory, executeTrade } = useAuth()
  const { getLiveData } = useLivePrices()

  const [selectedCoin, setSelectedCoin] = useState(() => normalizeCoin(initialCoin))
  const [amount, setAmount] = useState("")

  useEffect(() => {
    setSelectedCoin(normalizeCoin(initialCoin))
  }, [initialCoin])

  const coinData = getLiveData(selectedCoin)
  const isPositive = coinData.change24h >= 0

  const amountNum = parseFloat(amount) || 0
  const totalValue = amountNum * coinData.price

  // 🧠 Holdings calculation
  const holdings = useMemo(() => {
    const map = new Map<string, number>()
    tradeHistory.forEach((trade) => {
      const current = map.get(trade.coin) || 0
      map.set(
        trade.coin,
        trade.type === "buy"
          ? current + trade.amount
          : current - trade.amount
      )
    })
    return map
  }, [tradeHistory])

  const userHolding = holdings.get(selectedCoin) || 0

  // 🔁 Handlers
  const handleCoinChange = (coin: string) => {
    setSelectedCoin(coin)
    router.push(`/dashboard/trade?coin=${coin}`, { scroll: false })
  }

  const handleBuy = async () => {
    if (!amountNum || amountNum <= 0) {
      toast.error("Enter valid amount")
      return
    }

    if (totalValue > portfolioBalance) {
      toast.error("Insufficient balance")
      return
    }

    const success = await executeTrade("buy", selectedCoin, amountNum, coinData.price)
    if (!success) {
      toast.error("Unable to complete the buy order")
      return
    }

    toast.success(`Bought ${amountNum} ${selectedCoin}`)
    setAmount("")
  }

  const handleSell = async () => {
    if (!amountNum || amountNum <= 0) {
      toast.error("Enter valid amount")
      return
    }

    if (amountNum > userHolding) {
      toast.error(`You only own ${userHolding.toFixed(4)} ${selectedCoin}`)
      return
    }

    const success = await executeTrade("sell", selectedCoin, amountNum, coinData.price)
    if (!success) {
      toast.error("Unable to complete the sell order")
      return
    }

    toast.success(`Sold ${amountNum} ${selectedCoin}`)
    setAmount("")
  }

  return (
  <div className="grid lg:grid-cols-12 gap-6">

    {/* 🔹 LEFT: CHART + MARKET INFO */}
    <div className="lg:col-span-8 space-y-4">

      {/* ✅ CHART (TOP PRIORITY) */}
      <CandlestickChart 
        symbol={selectedCoin} 
        name={selectedCoin} 
      />

      {/* Market Info */}
      <Card>
        <CardContent className="p-5 flex justify-between items-center">
          
          {/* Coin Selector */}
          <div className="flex items-center gap-4">
            <Select value={selectedCoin} onValueChange={handleCoinChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COINS.map((coin) => (
                  <SelectItem key={coin} value={coin}>
                    {coin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price */}
            <div>
              <p className="text-2xl font-bold">
                {formatPrice(coinData.price)}
              </p>

              <Badge className={isPositive ? "bg-green-500" : "bg-red-500"}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {formatChange(coinData.change24h)}
              </Badge>
            </div>
          </div>

          {/* Portfolio */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-xl font-bold">${portfolioBalance.toLocaleString()}</p>
          </div>

        </CardContent>
      </Card>

      {/* Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {selectedCoin}:{" "}
            <span className="font-bold">
              {userHolding.toFixed(4)}
            </span>
          </p>
        </CardContent>
      </Card>

    </div>

    {/* 🔹 RIGHT: TRADE PANEL */}
    <div className="lg:col-span-4">
      <Card>
        <CardHeader>
          <CardTitle>Trade {selectedCoin}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <Input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
          />

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAmount((portfolioBalance / coinData.price).toFixed(4))}
            >
              Max
            </Button>
            <Button variant="outline" onClick={() => setAmount("0.1")}>
              0.1
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Total: {formatPrice(totalValue)}
          </p>

          {/* Buy */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleBuy}
            disabled={!amount || totalValue > portfolioBalance}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Buy
          </Button>

          {/* Sell */}
          <Button
            className="w-full"
            variant="destructive"
            onClick={handleSell}
            disabled={!amount || amountNum > userHolding}
          >
            <ArrowDownRight className="mr-2 h-4 w-4" />
            Sell ({userHolding.toFixed(4)})
            </Button>

          </CardContent>
        </Card>
      </div>

    </div>
  )
}
