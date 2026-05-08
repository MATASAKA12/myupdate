"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Copy, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const EVM_WALLET_ADDRESS = "0xe656678f4b7196cf83691110f5f43214ee9ab1a5"

export default function DepositPage() {
  const [copied, setCopied] = useState(false)

  const copyAddress = useCallback(async (showToast = true) => {
    if (!navigator.clipboard) {
      if (showToast) {
        toast.error("Clipboard is not available in this browser.")
      }
      return
    }

    try {
      await navigator.clipboard.writeText(EVM_WALLET_ADDRESS)
      setCopied(true)

      if (showToast) {
        toast.success("Wallet address copied.")
      }
    } catch {
      if (showToast) {
        toast.error("Copy failed. Please copy the address manually.")
      }
    }
  }, [])

  useEffect(() => {
    void copyAddress(false)
  }, [copyAddress])

  return (
    <section className="min-h-screen bg-background pb-10 pt-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Deposit Funds</h1>
          <p className="mt-2 text-muted-foreground">
            Send your EVM deposit to the wallet address below.
          </p>
        </div>

        <Card className="border-white/10 bg-card/80">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>EVM Wallet Address</CardTitle>
                <CardDescription>
                  The address is copied automatically when possible.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-background/60 p-4">
              <p className="break-all font-mono text-sm text-foreground sm:text-base">
                {EVM_WALLET_ADDRESS}
              </p>
            </div>

            <Button className="w-full sm:w-auto" onClick={() => copyAddress()}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Wallet Address
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
