"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/crypto-data"

export type Transaction = {
  id: string
  type: "buy" | "sell"
  asset: string
  amount: number
  price: number
  date: string
}

interface TransactionHistoryProps {
  data: Transaction[]
  title?: string
  description?: string
  emptyMessage?: string
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  })
}

export function TransactionHistory({
  data,
  title = "Transaction History",
  description = "A record of recent trading activity.",
  emptyMessage = "No transactions to display yet.",
}: TransactionHistoryProps) {
  return (
    <Card className="border-white/10 bg-card/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Asset</TableHead>
              <TableHead className="text-right text-muted-foreground">Amount</TableHead>
              <TableHead className="text-right text-muted-foreground">Price</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((transaction) => (
                <TableRow key={transaction.id} className="border-white/10">
                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(new Date(transaction.date))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        transaction.type === "buy"
                          ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
                          : "border-rose-500/20 bg-rose-500/15 text-rose-300"
                      }
                    >
                      {transaction.type === "buy" ? "Buy" : "Sell"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {transaction.asset}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {formatPrice(transaction.price)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
