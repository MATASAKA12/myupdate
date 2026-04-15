// components/dashboard/dashboard-navbar.tsx
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

export function DashboardNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Account"

  const overviewActive = pathname === "/dashboard"
  const tradeActive = pathname === "/dashboard/trade"

  const handleLogout = () => {
    void logout().finally(() => {
      router.push("/")
    })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Left - Logo + main links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="text-primary">Crypto</span>
              <span className="text-foreground">Vault</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-foreground/80 ${overviewActive ? "text-foreground" : "text-muted-foreground"}`}
              >
                Overview
              </Link>
              <Link
                href="/dashboard/trade"
                className={`text-sm font-medium transition-colors hover:text-foreground/80 ${tradeActive ? "text-foreground" : "text-muted-foreground"}`}
              >
                Trade
              </Link>
              {/* Add more: Portfolio, Watchlist, etc. later */}
            </div>
          </div>

          {/* Right - User menu */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline-block font-medium">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled className="opacity-100 focus:bg-transparent focus:text-foreground">
                  <User className="mr-2 h-4 w-4" />
                  {user?.email || "Signed in"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
