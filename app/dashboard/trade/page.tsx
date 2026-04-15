import { DashboardTradeContent } from "@/app/dashboard/components/DashboardTradeContent"

export default async function DashboardTradePage({
  searchParams,
}: {
  searchParams: Promise<{ coin?: string }>
}) {
  const { coin } = await searchParams

  return <DashboardTradeContent initialCoin={coin?.toUpperCase() ?? "BTC"} />
}
