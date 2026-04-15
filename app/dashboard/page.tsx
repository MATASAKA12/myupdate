"use client"

import { PieChart, TrendingUp, Wallet } from "lucide-react"
import { TransactionHistory, type Transaction } from "@/app/dashboard/components/TransactionHistory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/crypto-data"
import { useLivePrices } from "@/hooks/use-live-prices"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

function toTransactionHistoryItem(trade: {
  id: string
  type: "buy" | "sell"
  coin: string
  amount: number
  price: number
  timestamp: Date
}): Transaction {
  return {
    id: trade.id,
    type: trade.type,
    asset: trade.coin,
    amount: trade.amount,
    price: trade.price,
    date: trade.timestamp.toISOString(),
  }
}

export default function DashboardOverviewPage() {
  const { user, portfolioBalance, tradeHistory } = useAuth()
  const { getLiveData } = useLivePrices()

  const holdings: Record<string, number> = {}
  let totalBought = 0
  let totalSold = 0

  for (const trade of tradeHistory) {
    const currentAmount = holdings[trade.coin] ?? 0
    holdings[trade.coin] =
      trade.type === "buy"
        ? currentAmount + trade.amount
        : currentAmount - trade.amount

    if (trade.type === "buy") {
      totalBought += trade.amount * trade.price
    } else {
      totalSold += trade.amount * trade.price
    }
  }

  let positionsValue = 0
  let openPositions = 0

  for (const [coin, amount] of Object.entries(holdings)) {
    if (amount <= 0) {
      continue
    }

    openPositions += 1
    positionsValue += amount * getLiveData(coin).price
  }

  const totalBalance = portfolioBalance + positionsValue
  const profitLoss = positionsValue + totalSold - totalBought
  const recentTransactions = tradeHistory
    .slice(0, 5)
    .map(toTransactionHistoryItem)

  return (
    <section className="min-h-screen bg-background pb-10 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
          <p className="mt-2 text-muted-foreground">
            Portfolio snapshot for {user?.email ?? "your trading account"}.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/10 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Total Balance</CardTitle>
                <CardDescription>Cash plus current market value.</CardDescription>
              </div>
              <Wallet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(totalBalance)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cash: {formatPrice(portfolioBalance)} • Positions: {formatPrice(positionsValue)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Profit/Loss</CardTitle>
                <CardDescription>Based on executed trades and live pricing.</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p
                className={cn(
                  "text-3xl font-bold",
                  profitLoss >= 0 ? "text-emerald-400" : "text-rose-400",
                )}
              >
                {profitLoss >= 0 ? "+" : "-"}
                {formatPrice(Math.abs(profitLoss))}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Bought: {formatPrice(totalBought)} • Sold: {formatPrice(totalSold)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Open Positions</CardTitle>
                <CardDescription>Assets you currently hold above zero.</CardDescription>
              </div>
              <PieChart className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{openPositions}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {tradeHistory.length} total transaction{tradeHistory.length === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <TransactionHistory
            data={recentTransactions}
            title="Recent Transactions"
            description="Your latest completed buys and sells."
            emptyMessage="Recent activity will appear here after your first trade."
          />
        </div>
      </div>
    </section>
  )
}
