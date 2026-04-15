"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { coinIdMap, type OHLCData } from "@/lib/coingecko"
import { AlertCircle, Loader2 } from "lucide-react"

interface CandlestickChartProps {
  symbol: string
  name: string
}

const TIMEFRAMES = [
  { label: "24H", days: "1", limit: 48 },
  { label: "7D", days: "7", limit: 84 },
  { label: "30D", days: "30", limit: 120 },
  { label: "90D", days: "90", limit: 180 },
] as const

const DEFAULT_TIMEFRAME = TIMEFRAMES[1]
type TimeframeDays = (typeof TIMEFRAMES)[number]["days"]

const fetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown")
    throw new Error(`OHLC failed: ${res.status} - ${errText}`)
  }

  const data = await res.json()

  if (!Array.isArray(data)) {
    throw new Error("OHLC response was not an array")
  }

  return data as OHLCData[]
}

function normalizeCandleData(ohlcData: OHLCData[]) {
  const uniqueCandles = new Map<number, OHLCData>()

  for (const candle of ohlcData) {
    const values = [
      candle.timestamp,
      candle.open,
      candle.high,
      candle.low,
      candle.close,
    ]

    if (values.every((value) => Number.isFinite(value))) {
      uniqueCandles.set(candle.timestamp, candle)
    }
  }

  return Array.from(uniqueCandles.values())
    .sort((left, right) => left.timestamp - right.timestamp)
    .map<CandlestickData>((candle) => ({
      time: Math.floor(candle.timestamp / 1000) as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))
}

export function CandlestickChart({ symbol: rawSymbol, name }: CandlestickChartProps) {
  const symbol = rawSymbol.toUpperCase()
  const displayName = name || symbol || "Unknown"
  const [timeframeDays, setTimeframeDays] = useState<TimeframeDays>(DEFAULT_TIMEFRAME.days)

  const coinId = useMemo(() => {
    return coinIdMap[symbol] || "bitcoin"
  }, [symbol])

  const activeTimeframe = useMemo(() => {
    return (
      TIMEFRAMES.find((timeframe) => timeframe.days === timeframeDays) ||
      DEFAULT_TIMEFRAME
    )
  }, [timeframeDays])

  const apiUrl = useMemo(() => {
    return `/api/ohlc/${coinId}?vs_currency=usd&days=${activeTimeframe.days}&limit=${activeTimeframe.limit}`
  }, [activeTimeframe.days, activeTimeframe.limit, coinId])

  const {
    data: ohlcData,
    error: fetchError,
    isLoading
  } = useSWR<OHLCData[]>(
    apiUrl,
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      keepPreviousData: true
    }
  )

  const chartData = useMemo(() => {
    return normalizeCandleData(ohlcData ?? [])
  }, [ohlcData])

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)

  useEffect(() => {
    const container = chartContainerRef.current

    if (!container) {
      return
    }

    const initialWidth = Math.max(
      Math.floor(container.getBoundingClientRect().width),
      300
    )

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "rgba(255,255,255,0.08)",
      },
      width: initialWidth,
      height: 360,
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    })

    chartRef.current = chart
    seriesRef.current = series

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      const nextWidth = Math.floor(entry?.contentRect.width ?? 0)

      if (nextWidth > 0) {
        chart.applyOptions({ width: nextWidth })
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      seriesRef.current = null
      chartRef.current = null
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current) {
      return
    }

    seriesRef.current.setData(chartData)

    if (chartData.length > 0) {
      chartRef.current?.timeScale().fitContent()
    }
  }, [chartData])

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span>{displayName}/USD Chart</span>
            <span className="text-sm text-muted-foreground">
              showing last {activeTimeframe.limit} candles
            </span>
          </div>

          <div className="flex gap-2">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setTimeframeDays(tf.days)}
                className={`px-3 py-1 text-xs rounded-md border transition ${
                  activeTimeframe.days === tf.days
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent text-muted-foreground border-white/10 hover:border-primary/50"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative h-[360px] w-full">
          <div
            ref={chartContainerRef}
            className="h-full w-full"
          />

          {isLoading && chartData.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/70 backdrop-blur-sm">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading OHLC data...</p>
            </div>
          ) : fetchError || chartData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
              <Alert variant="destructive" className="w-full max-w-md">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Failed to load chart</AlertTitle>
                <AlertDescription className="mt-2 text-sm">
                  {fetchError?.message || "No OHLC data returned for this timeframe."}
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
