import { redirect } from "next/navigation"

export default async function TradePage({ params }: { params: Promise<{ coin: string }> }) {
  const { coin } = await params

  redirect(`/dashboard/trade?coin=${encodeURIComponent(coin.toUpperCase())}`)
}
