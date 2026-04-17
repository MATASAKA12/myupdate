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

// New imports for simple captcha
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from "react-simple-captcha"

const supabase = createClient()

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Captcha state (only for Sign In)
  const [captchaInput, setCaptchaInput] = useState("")

  // OTP State (only for Sign Up)
  const [verificationStep, setVerificationStep] = useState<"none" | "otp">("none")
  const [otp, setOtp] = useState("")

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Load captcha when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        loadCaptchaEnginge(6, "upper")   // 6 characters, uppercase
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

  // ================= SIGN IN (with Simple Captcha) =================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateCaptcha(captchaInput)) {
      setError("Invalid captcha. Please try again.")
      setCaptchaInput("")
      loadCaptchaEnginge(6) // Refresh captcha
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

  // ================= SIGN UP (OTP Only) =================
  // ================= SIGN UP (OTP Only) =================
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setSuccessMessage("")

  if (signUpPassword !== signUpConfirmPassword) {
    setError("Passwords do not match")
    return
  }
  if (!acceptedTerms) {
    setError("Please accept the terms")
    return
  }

  setIsLoading(true)

  try {
    // Use signInWithOtp with shouldCreateUser instead of signUp
    const { error } = await supabase.auth.signInWithOtp({
      email: signUpEmail,
      options: {
        shouldCreateUser: true,           // This creates the user if not exists
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) throw error

    setVerificationStep("otp")
    setSuccessMessage(`A 6-digit code has been sent to ${signUpEmail}`)
  } catch (err: any) {
    setError(err.message || "Failed to send verification code")
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
        type: "signup",
      })

      if (error) throw error

      setSuccessMessage("Account created successfully!")
      setTimeout(() => onOpenChange(false), 1500)
    } catch (err: any) {
      setError("Invalid or expired code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          {/* ================= SIGN IN TAB (with Captcha) ================= */}
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

              {/* Simple Captcha */}
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

          {/* ================= SIGN UP TAB (OTP) ================= */}
          <TabsContent value="signup">
            {verificationStep === "none" ? (
              <form onSubmit={handleSignUp} className="flex flex-col gap-4 mt-4">
                <Input type="email" placeholder="Email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
                <Input type="password" placeholder="Confirm Password" value={signUpConfirmPassword} onChange={(e) => setSignUpConfirmPassword(e.target.value)} required />

                <div className="flex items-center gap-2">
                  <Checkbox checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(!!v)} />
                  <Label className="text-sm">I accept the Terms and Conditions</Label>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Create Account"}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 mt-6">
                <p className="text-center text-sm text-muted-foreground">
                  Enter the 6-digit code sent to <br />
                  <strong>{signUpEmail}</strong>
                </p>

                <Input
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length < 6}>
                  {isLoading ? <Spinner /> : "Verify Code"}
                </Button>

                <Button variant="ghost" onClick={() => setVerificationStep("none")}>
                  ← Back to Sign Up
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}