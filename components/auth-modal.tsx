"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from "react-simple-captcha"

const supabase = createClient()

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [verificationStep, setVerificationStep] = useState<"none" | "otp" | "success">("none")
  const [otp, setOtp] = useState("")

  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        loadCaptchaEnginge(6, "upper")
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  const resetForm = () => {
    setError("")
    setSuccessMessage("")
    setCaptchaInput("")
    setVerificationStep("none")
    setOtp("")
    setSignInEmail("")
    setSignInPassword("")
    setSignUpEmail("")
    setSignUpPassword("")
    setSignUpConfirmPassword("")
    setAcceptedTerms(false)
  }

  // ================= SIGN IN =================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateCaptcha(captchaInput)) {
      setError("Invalid captcha. Please try again.")
      setCaptchaInput("")
      loadCaptchaEnginge(6)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      })
      if (error) throw error
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  // ================= SIGN UP (fixed — uses signUp not signInWithOtp) =================
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (signUpPassword !== signUpConfirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!acceptedTerms) {
      setError("Please accept the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      // ✅ Use standard signUp instead of signInWithOtp
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) throw error

      // Check if user already exists
      if (data?.user?.identities?.length === 0) {
        setError("An account with this email already exists. Please sign in.")
        return
      }

      // ✅ Show OTP input — Supabase sends 6-digit code to email
      setVerificationStep("otp")
      setSuccessMessage(`A 6-digit verification code has been sent to ${signUpEmail}`)

    } catch (err: any) {
      // ✅ Better error messages
      if (err.message?.includes("rate limit")) {
        setError("Too many attempts. Please wait a few minutes and try again.")
      } else if (err.message?.includes("already registered")) {
        setError("Email already registered. Please sign in instead.")
      } else {
        setError(err.message || "Failed to create account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setError("Please enter the full 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: signUpEmail,
        token: otp,
        // ✅ Use email_change or signup depending on flow
        type: "signup",
      })

      if (error) throw error

      setVerificationStep("success")
      setSuccessMessage("Account created successfully! Redirecting...")
      setTimeout(() => {
        onOpenChange(false)
        resetForm()
      }, 2000)

    } catch (err: any) {
      if (err.message?.includes("expired")) {
        setError("Code has expired. Please go back and try again.")
      } else {
        setError("Invalid code. Please check your email and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) resetForm() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">CryptoVault</DialogTitle>
          <DialogDescription className="text-center">Sign in or create account</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* ================= SIGN IN TAB ================= */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="flex flex-col gap-4 mt-4">
              <Input
                type="email"
                placeholder="Email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
              />
              <div className="flex flex-col items-center gap-3">
                <LoadCanvasTemplate />
                <Input
                  placeholder="Enter captcha text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="text-center"
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* ================= SIGN UP TAB ================= */}
          <TabsContent value="signup">

            {/* Step 1 — Fill form */}
            {verificationStep === "none" && (
              <form onSubmit={handleSignUp} className="flex flex-col gap-4 mt-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  required
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={acceptedTerms}
                    onCheckedChange={(v) => setAcceptedTerms(!!v)}
                  />
                  <Label className="text-sm">I accept the Terms and Conditions</Label>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Create Account"}
                </Button>
              </form>
            )}

            {/* Step 2 — Enter OTP */}
            {verificationStep === "otp" && (
              <div className="flex flex-col gap-4 mt-6">
                {successMessage && (
                  <p className="text-green-500 text-sm text-center">{successMessage}</p>
                )}
                <p className="text-center text-sm text-muted-foreground">
                  Check your inbox at <strong>{signUpEmail}</strong>
                </p>
                <Input
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").trim())}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading ? <Spinner /> : "Verify Code"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setVerificationStep("none"); setError(""); setOtp("") }}
                >
                  Back to Sign Up
                </Button>
              </div>
            )}

            {/* Step 3 — Success */}
            {verificationStep === "success" && (
              <div className="flex flex-col items-center gap-4 mt-6 py-4">
                <div className="text-green-500 text-5xl">✓</div>
                <p className="text-green-500 font-medium text-center">
                  Account created successfully!
                </p>
                <p className="text-muted-foreground text-sm text-center">
                  Redirecting you now...
                </p>
              </div>
            )}

          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}