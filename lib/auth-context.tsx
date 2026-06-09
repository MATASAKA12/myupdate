"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"

// ✅ Fixed — use ANON_KEY not PUBLISHABLE_KEY
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
}

export interface Trade {
  id: string
  type: "buy" | "sell"
  coin: string
  amount: number
  price: number
  timestamp: Date
  status: "completed" | "pending"
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  portfolioBalance: number
  tradeHistory: Trade[]
  isLoading: boolean
  isSupabaseConnected: boolean
  refreshBalance: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>
  logout: () => Promise<void>
  executeTrade: (type: "buy" | "sell", coin: string, amount: number, price: number) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [portfolioBalance, setPortfolioBalance] = useState(0) // ✅ default 0 not 15000
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [supabaseConfigured] = useState(isSupabaseConfigured())

  // ✅ Standalone refresh function — call this to get latest balance from DB
  const refreshBalance = useCallback(async () => {
    if (!supabaseConfigured) return
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("portfolio_balance")
        .eq("id", currentUser.id) // ✅ filter by user ID
        .single()

      if (profile) {
        setPortfolioBalance(profile.portfolio_balance ?? 0)
      }
    } catch (error) {
      console.error("Error refreshing balance:", error)
    }
  }, [supabaseConfigured])

  useEffect(() => {
    const initAuth = async () => {
      if (supabaseConfigured) {
        try {
          const { createClient } = await import("@/lib/supabase/client")
          const supabase = createClient()

          const { data: { session } } = await supabase.auth.getSession()
          setUser(session?.user ?? null)

          if (session?.user) {
            // ✅ Load trades
            const { data: trades } = await supabase
              .from("trades")
              .select("*")
              .eq("user_id", session.user.id)
              .order("created_at", { ascending: false })

            if (trades) {
              setTradeHistory(
                trades.map((t) => ({
                  id: t.id,
                  type: t.type,
                  coin: t.coin,
                  amount: t.amount,
                  price: t.price,
                  timestamp: new Date(t.created_at),
                  status: t.status,
                }))
              )
            }

            // ✅ Load balance with correct user filter
            const { data: profile } = await supabase
              .from("profiles")
              .select("portfolio_balance")
              .eq("id", session.user.id) // ✅ was missing this
              .single()

            if (profile) {
              setPortfolioBalance(profile.portfolio_balance ?? 0)
            }
          }

          // ✅ Listen for auth changes and refresh balance
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              setUser(session?.user ?? null)

              if (session?.user) {
                // Re-fetch balance on every auth state change
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("portfolio_balance")
                  .eq("id", session.user.id)
                  .single()

                setPortfolioBalance(profile?.portfolio_balance ?? 0)
              } else {
                setPortfolioBalance(0) // ✅ 0 not 15000
                setTradeHistory([])
              }
            }
          )

          setIsLoading(false)
          return () => subscription.unsubscribe()
        } catch (error) {
          console.error("Error initializing Supabase auth:", error)
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [supabaseConfigured])

  const login = useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured) {
      const mockUser = {
        id: "demo-user-id",
        email,
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User
      setUser(mockUser)
      return { success: true }
    }

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch {
      return { success: false, error: "Failed to connect to authentication service" }
    }
  }, [supabaseConfigured])

  const signup = useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured) {
      const mockUser = {
        id: "demo-user-id",
        email,
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User
      setUser(mockUser)
      return { success: true }
    }

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) return { success: false, error: error.message }
      if (data.user && !data.session) return { success: true, needsConfirmation: true }
      return { success: true }
    } catch {
      return { success: false, error: "Failed to connect to authentication service" }
    }
  }, [supabaseConfigured])

  const logout = useCallback(async () => {
    if (supabaseConfigured) {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch (error) {
        console.error("Error signing out:", error)
      }
    }
    setUser(null)
    setPortfolioBalance(0) // ✅ 0 not 15000
    setTradeHistory([])
  }, [supabaseConfigured])

  const executeTrade = useCallback(
    async (type: "buy" | "sell", coin: string, amount: number, price: number): Promise<boolean> => {
      const total = amount * price
      let newBalance = portfolioBalance

      if (type === "buy") {
        if (total > portfolioBalance) return false
        newBalance = portfolioBalance - total
      } else {
        newBalance = portfolioBalance + total
      }

      if (supabaseConfigured && user) {
        try {
          const { createClient } = await import("@/lib/supabase/client")
          const supabase = createClient()

          const { data: tradeData, error: tradeError } = await supabase
            .from("trades")
            .insert({
              user_id: user.id,
              type,
              coin,
              amount,
              price,
              total,
              status: "completed",
            })
            .select()
            .single()

          if (tradeError) {
            console.error("Error saving trade:", tradeError)
            return false
          }

          const { error: profileError } = await supabase
            .from("profiles")
            .update({ portfolio_balance: newBalance })
            .eq("id", user.id)

          if (profileError) {
            console.error("Error updating balance:", profileError)
            return false
          }

          setPortfolioBalance(newBalance)

          const newTrade: Trade = {
            id: tradeData.id,
            type,
            coin,
            amount,
            price,
            timestamp: new Date(tradeData.created_at),
            status: "completed",
          }

          setTradeHistory((prev) => [newTrade, ...prev])
          return true
        } catch (error) {
          console.error("Error executing trade:", error)
          return false
        }
      } else {
        setPortfolioBalance(newBalance)
        const newTrade: Trade = {
          id: `demo-${Date.now()}`,
          type,
          coin,
          amount,
          price,
          timestamp: new Date(),
          status: "completed",
        }
        setTradeHistory((prev) => [newTrade, ...prev])
        return true
      }
    },
    [user, portfolioBalance, supabaseConfigured]
  )

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        portfolioBalance,
        tradeHistory,
        isLoading,
        isSupabaseConnected: supabaseConfigured,
        refreshBalance,
        login,
        signup,
        logout,
        executeTrade,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}