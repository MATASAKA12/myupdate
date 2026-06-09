"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cryptoData, formatPrice, formatChange } from "@/lib/crypto-data"
import { CandlestickChart } from "@/components/candlestick-chart"
import { useLivePrices } from "@/hooks/use-live-prices"
import { toast } from "sonner"
import {
  TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight,
  RefreshCw, Wallet
} from "lucide-react"

const COINS = cryptoData.map((c) => c.symbol)
const DEFAULT_COIN = "BTC"

function normalizeCoin(coin?: string) {
  const up = coin?.toUpperCase() || DEFAULT_COIN
  return COINS.includes(up) ? up : DEFAULT_COIN
}

interface TradingDashboardProps {
  initialCoin?: string
}

export function TradingDashboard({ initialCoin = DEFAULT_COIN }: TradingDashboardProps) {
  const router = useRouter()
  const { portfolioBalance, tradeHistory, executeTrade, refreshBalance } = useAuth()
  const { getLiveData } = useLivePrices()

  const [selectedCoin, setSelectedCoin] = useState(() => normalizeCoin(initialCoin))
  const [amount, setAmount] = useState("")
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy")
  const [isExecuting, setIsExecuting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setSelectedCoin(normalizeCoin(initialCoin))
  }, [initialCoin])

  // Refresh balance when component mounts
  useEffect(() => {
    refreshBalance?.()
  }, [refreshBalance])

  const coinData = getLiveData(selectedCoin)
  const isPositive = coinData.change24h >= 0
  const amountNum = parseFloat(amount) || 0
  const totalValue = amountNum * coinData.price

  // Calculate holdings from trade history
  const holdings = useMemo(() => {
    const map = new Map<string, number>()
    tradeHistory.forEach((trade) => {
      const current = map.get(trade.coin) || 0
      map.set(
        trade.coin,
        trade.type === "buy" ? current + trade.amount : current - trade.amount
      )
    })
    return map
  }, [tradeHistory])

  const userHolding = Math.max(0, holdings.get(selectedCoin) || 0)
  const holdingValue = userHolding * coinData.price

  // Validation
  const canBuy = amountNum > 0 && totalValue <= portfolioBalance && portfolioBalance > 0
  const canSell = amountNum > 0 && amountNum <= userHolding

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    await refreshBalance?.()
    setTimeout(() => setIsRefreshing(false), 800)
  }

  const handleCoinChange = (coin: string) => {
    setSelectedCoin(coin)
    setAmount("")
    router.push(`/dashboard/trade?coin=${coin}`, { scroll: false })
  }

  const handleSetMax = () => {
    if (tradeMode === "buy") {
      const maxAmount = portfolioBalance / coinData.price
      setAmount(maxAmount.toFixed(6))
    } else {
      setAmount(userHolding.toFixed(6))
    }
  }

  const handleSetPercent = (pct: number) => {
    if (tradeMode === "buy") {
      const amt = (portfolioBalance * pct) / 100 / coinData.price
      setAmount(amt.toFixed(6))
    } else {
      const amt = (userHolding * pct) / 100
      setAmount(amt.toFixed(6))
    }
  }

  const handleTrade = useCallback(async () => {
    if (tradeMode === "buy" && !canBuy) {
      if (portfolioBalance <= 0) {
        toast.error("Your balance is $0. Contact admin to fund your account.")
      } else {
        toast.error("Insufficient balance for this trade")
      }
      return
    }

    if (tradeMode === "sell" && !canSell) {
      toast.error(`You only hold ${userHolding.toFixed(6)} ${selectedCoin}`)
      return
    }

    setIsExecuting(true)
    try {
      const success = await executeTrade(tradeMode, selectedCoin, amountNum, coinData.price)
      if (success) {
        toast.success(
          tradeMode === "buy"
            ? `Bought ${amountNum} ${selectedCoin} for ${formatPrice(totalValue)}`
            : `Sold ${amountNum} ${selectedCoin} for ${formatPrice(totalValue)}`
        )
        setAmount("")
        await refreshBalance?.()
      } else {
        toast.error("Trade failed. Please try again.")
      }
    } catch {
      toast.error("Trade failed. Please try again.")
    } finally {
      setIsExecuting(false)
    }
  }, [tradeMode, canBuy, canSell, amountNum, selectedCoin, coinData.price, totalValue, userHolding, executeTrade, refreshBalance, portfolioBalance])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trade</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live prices · execute orders instantly
            </p>
          </div>
          <button
            onClick={handleRefreshBalance}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 transition-colors"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            Refresh balance
          </button>
        </div>

        {/* ── Balance Banner ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wallet size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-lg font-bold font-mono">
                ${portfolioBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="col-span-1 bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{selectedCoin} Holdings</p>
            <p className="text-lg font-bold font-mono mt-0.5">{userHolding.toFixed(6)}</p>
            <p className="text-xs text-muted-foreground">≈ {formatPrice(holdingValue)}</p>
          </div>

          <div className="col-span-1 bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{selectedCoin} Price</p>
            <p className="text-lg font-bold font-mono mt-0.5">{formatPrice(coinData.price)}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {formatChange(coinData.change24h)}
            </span>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Chart */}
          <div className="lg:col-span-8">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Coin Tabs */}
              <div className="flex items-center gap-1 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
                {COINS.slice(0, 10).map((coin) => (
                  <button
                    key={coin}
                    onClick={() => handleCoinChange(coin)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCoin === coin
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
              <CandlestickChart symbol={selectedCoin} name={selectedCoin} />
            </div>
          </div>

          {/* Trade Panel */}
          <div className="lg:col-span-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-5 sticky top-6">

              {/* Buy / Sell Toggle */}
              <div className="grid grid-cols-2 gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => { setTradeMode("buy"); setAmount("") }}
                  className={`py-2 rounded-md text-sm font-semibold transition-all ${
                    tradeMode === "buy"
                      ? "bg-green-600 text-white shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => { setTradeMode("sell"); setAmount("") }}
                  className={`py-2 rounded-md text-sm font-semibold transition-all ${
                    tradeMode === "sell"
                      ? "bg-red-600 text-white shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Available info */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Available</span>
                <span className="font-mono font-medium text-foreground">
                  {tradeMode === "buy"
                    ? `$${portfolioBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : `${userHolding.toFixed(6)} ${selectedCoin}`
                  }
                </span>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Amount ({selectedCoin})</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-primary transition-colors pr-16"
                    min="0"
                    step="0.00000001"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    {selectedCoin}
                  </span>
                </div>
              </div>

              {/* Percentage Quick Select */}
              <div className="grid grid-cols-4 gap-1.5">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleSetPercent(pct)}
                    className="py-1.5 text-xs border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                  >
                    {pct === 100 ? "Max" : `${pct}%`}
                  </button>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-mono">{formatPrice(coinData.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono">{amountNum.toFixed(6)} {selectedCoin}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="font-mono">{formatPrice(totalValue)}</span>
                </div>
              </div>

              {/* Balance warning */}
              {portfolioBalance <= 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-600 text-center">
                  Your balance is $0. Contact admin to fund your account.
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={handleTrade}
                disabled={isExecuting || (tradeMode === "buy" ? !canBuy : !canSell)}
                className={`w-full py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  tradeMode === "buy"
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                {isExecuting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : tradeMode === "buy" ? (
                  <><ArrowUpRight size={16} /> Buy {selectedCoin}</>
                ) : (
                  <><ArrowDownRight size={16} /> Sell {selectedCoin}</>
                )}
              </button>

              {/* Trade history summary */}
              {tradeHistory.length > 0 && (
                <div className="border-t border-border pt-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Recent trades</p>
                  {tradeHistory.slice(0, 3).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${trade.type === "buy" ? "text-green-500" : "text-red-500"}`}>
                          {trade.type === "buy" ? "▲" : "▼"} {trade.coin}
                        </span>
                        <span className="text-muted-foreground font-mono">{trade.amount.toFixed(4)}</span>
                      </div>
                      <span className="text-muted-foreground font-mono">
                        {formatPrice(trade.amount * trade.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}