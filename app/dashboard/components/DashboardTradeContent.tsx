"use client"

import { TransactionHistory, type Transaction } from "@/app/dashboard/components/TransactionHistory"
import { TradingDashboard } from "@/components/dashboard/trading-dashboard"
import { useAuth } from "@/lib/auth-context"

const mockTransactions: Transaction[] = [
  {
    id: "mock-1",
    type: "buy",
    asset: "BTC",
    amount: 0.35,
    price: 67234.56,
    date: "2026-04-05T09:15:00.000Z",
  },
  {
    id: "mock-2",
    type: "sell",
    asset: "ETH",
    amount: 1.2,
    price: 3456.78,
    date: "2026-04-04T13:40:00.000Z",
  },
  {
    id: "mock-3",
    type: "buy",
    asset: "SOL",
    amount: 8,
    price: 178.9,
    date: "2026-04-03T16:05:00.000Z",
  },
]

interface DashboardTradeContentProps {
  initialCoin: string
}

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

export function DashboardTradeContent({ initialCoin }: DashboardTradeContentProps) {
  const { tradeHistory } = useAuth()

  const transactions =
    tradeHistory.length > 0
      ? tradeHistory.map(toTransactionHistoryItem)
      : mockTransactions

  return (
    <section className="min-h-screen bg-background pb-10 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Trade</h1>
          <p className="mt-2 text-muted-foreground">
            Analyze live price action, manage orders, and review transaction history.
          </p>
        </div>

        <TradingDashboard initialCoin={initialCoin} />

        <div className="mt-6">
          <TransactionHistory
            data={transactions}
            description="Completed buys and sells for your account."
          />
        </div>
      </div>
    </section>
  )
}
