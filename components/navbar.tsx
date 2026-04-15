"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { User, LogOut, LayoutDashboard, Menu, X, Home, Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Google Translate Component (safe for Next.js)
function GoogleTranslateWidget() {
  useEffect(() => {
    // Define the init function
    const googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',           // ← Change to your site's main language
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          // Optional: Limit languages (e.g., 'fr,es,de,pt,zh-CN')
          // includedLanguages: 'fr,es,de,pt',
        },
        'google_translate_element'
      )
    }

    // Make it available globally
    ;(window as any).googleTranslateElementInit = googleTranslateElementInit

    // Load the Google script if not already loaded
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script')
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div className="google-translate-widget" aria-label="Translate page">
      <div
        id="google_translate_element"
        className="google-translate-element"
      />
    </div>
  )
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated, user, logout, isSupabaseConnected } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Account"

  // ... (your existing useEffect for auth modal remains unchanged)

  const handleLogout = () => {
    void logout().finally(() => {
      router.push("/")
    })
  }

  const openSignIn = () => {
    setAuthModalTab("signin")
    setAuthModalOpen(true)
  }

  const openSignUp = () => {
    setAuthModalTab("signup")
    setAuthModalOpen(true)
  }

  return (
    <>
      {/* Supabase Connection Banner - unchanged */}
      {!isSupabaseConnected && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/90 text-amber-950 text-center py-2 px-4 text-sm">
          <span className="font-medium">Demo Mode:</span> Connect Supabase via Settings (top right) &gt; Settings to enable database persistence
        </div>
      )}

      <nav className={`fixed left-0 right-0 z-50 glass-nav ${!isSupabaseConnected ? 'top-10' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - unchanged */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary">Crypto</span>
                <span className="text-foreground">Vault</span>
              </span>
            </Link>

            {/* Center Navigation - unchanged */}
            <div className="hidden md:flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="text-muted-foreground hover:text-foreground hover:bg-white/10"
                aria-label="Go to homepage"
              >
                <Home className="h-5 w-5" />
              </Button>

              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right Section - Added Google Translate */}
            <div className="hidden md:flex shrink-0 items-center gap-3">
              {/* Google Translate Widget */}
              <div className="flex shrink-0 items-center gap-2">
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <GoogleTranslateWidget />
              </div>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-foreground">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 glass border-white/10">
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="outline" onClick={openSignIn} className="border-white/20">
                    Login
                  </Button>
                  <Button onClick={openSignUp}>Get Started</Button>
                </>
              )}
            </div>

            {/* Mobile menu button - unchanged */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu - Added Google Translate here too */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/10">
            <div className="px-4 py-4 flex flex-col gap-4">
              {/* Home */}
              <button
                onClick={() => {
                  router.push("/")
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 text-foreground py-2 hover:text-primary transition-colors"
              >
                <Home className="h-5 w-5" />
                Home
              </button>

              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="text-foreground py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              {/* Google Translate in Mobile */}
              <div className="py-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Globe className="h-4 w-4" />
                  <span>Translate</span>
                </div>
                <GoogleTranslateWidget />
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{displayName}</span>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => {
                      openSignIn()
                      setMobileMenuOpen(false)
                    }}
                    className="border-white/20"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      openSignUp()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
    </>
  )
}
