"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function HeroSection() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handleCoinClick = (symbol: string) => {
    if (isAuthenticated) {
      router.push(`/trade/${symbol}`)
    } else {
      setAuthModalOpen(true)
    }
  }

  return (
  <>
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-black pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">The Future of Crypto Trading</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
                <span className="text-foreground">Trade Smarter.</span>
                <br />
                <span className="text-primary">Invest Faster.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl">
                Experience the next generation of cryptocurrency trading. Secure, fast, and
                intuitive platform designed for both beginners and professional traders.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => setAuthModalOpen(true)} className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20" asChild>
                  <a href="#pricing">View Plans</a>
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Bank-level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Real-time Analytics</span>
                </div>
              </div>
            </div>

            {/* Right Content - Clickable Crypto Logos */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-30" />
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                
                {/* Bitcoin - Main coin */}
                <button
                  onClick={() => handleCoinClick("BTC")}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-orange-500/20 shadow-2xl shadow-amber-500/30 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer group border-2 border-amber-400/30 hover:border-amber-400/60"
                  aria-label="Trade Bitcoin"
                >
                  <div className="w-[70%] h-[70%] relative">
                    <Image
                      src="/assets/coin/bitcoin.png"   // ← Updated local path
                      alt="Bitcoin"
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                  <span className="absolute bottom-4 text-amber-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to Trade
                  </span>
                </button>

                {/* Ethereum */}
                <button
                  onClick={() => handleCoinClick("ETH")}
                  className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-600/20 shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-2 border-blue-400/30 hover:border-blue-400/60"
                  aria-label="Trade Ethereum"
                >
                  <div className="w-14 h-14 relative">
                    <Image
                      src="/assets/coin/ethereum.png"   // ← Updated
                      alt="Ethereum"
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </button>

                {/* Solana */}
                <button
                  onClick={() => handleCoinClick("SOL")}
                  className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400/20 to-purple-600/20 shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-2 border-purple-400/30 hover:border-purple-400/60"
                  aria-label="Trade Solana"
                >
                  <div className="w-10 h-10 relative">
                    <Image
                      src="/assets/coin/solana.png"   // ← Updated
                      alt="Solana"
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </button>

                {/* BNB */}
                <button
                  onClick={() => handleCoinClick("BNB")}
                  className="absolute top-1/4 -left-8 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 shadow-lg shadow-yellow-500/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-2 border-yellow-400/30 hover:border-yellow-400/60"
                  aria-label="Trade BNB"
                >
                  <div className="w-9 h-9 relative">
                    <Image
                      src="/assets/coin/bnb.png"   // ← Updated
                      alt="BNB"
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </button>

                {/* Chainlink */}
                <button
                  onClick={() => handleCoinClick("LINK")}
                  className="absolute bottom-1/4 -right-6 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-2 border-blue-500/30 hover:border-blue-500/60"
                  aria-label="Trade Chainlink"
                >
                  <div className="w-8 h-8 relative">
                    <Image
                      src="/assets/coin/chainlink.png"   // ← Updated (adjust filename if needed)
                      alt="Chainlink"
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultTab="signup" />
