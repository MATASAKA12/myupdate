"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
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

type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "signin" | "signup" | "forgot"
}

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">(defaultTab)

  // Captcha
  const [captchaInput, setCaptchaInput] = useState("")

  // OTP (Sign Up)
  const [verificationStep, setVerificationStep] = useState<"none" | "otp">("none")
  const [otp, setOtp] = useState("")

  // Sign In
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  // Sign Up
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotStep, setForgotStep] = useState<"email" | "sent">("email")

  const loadSignInCaptcha = useCallback(() => {
    if (!document.getElementById("canv")) return
    loadCaptchaEnginge(6, "white", "black", "upper")
  }, [])

  useEffect(() => {
    if (open) setActiveTab(defaultTab)
  }, [defaultTab, open])

  useEffect(() => {
    if (!open || activeTab !== "signin") return
    const timer = setTimeout(loadSignInCaptcha, 0)
    return () => clearTimeout(timer)
  }, [activeTab, loadSignInCaptcha, open])

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
    setForgotEmail("")
    setForgotStep("email")
  }

  // ================= SIGN IN =================
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateCaptcha(captchaInput, false)) {
      setError("Invalid captcha. Please try again.")
      setCaptchaInput("")
      loadSignInCaptcha()
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      })

      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()

      onOpenChange(false)

      if (user?.email === "brainbroservice@gmail.com") {
        window.location.href = "/admin"
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  // ================= FORGOT PASSWORD =================
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setForgotStep("sent")
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  // ================= SIGN UP =================
  const handleSignUp = async (e: FormEvent) => {
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
      const { error } = await supabase.auth.signInWithOtp({
        email: signUpEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken: undefined,
        },
      })

      if (error) throw error

      setVerificationStep("otp")
      setSuccessMessage(`We've sent an 8-digit verification code to ${signUpEmail}. Please check your inbox and spam folder.`)
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async () => {
    if (otp.length < 8) {
      setError("Please enter the full 8-digit code")
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

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "signin" | "signup" | "forgot")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="forgot">Reset</TabsTrigger>
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

              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary text-right self-end"
                onClick={() => { setActiveTab("forgot"); setError("") }}
              >
                Forgot password?
              </button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* ================= FORGOT PASSWORD TAB ================= */}
          <TabsContent value="forgot">
            {forgotStep === "email" ? (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 mt-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter your email and we'll send you a password reset link.
                </p>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Send Reset Link"}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => { setActiveTab("signin"); setError("") }}
                >
                  ← Back to Sign In
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 mt-6 text-center">
                <div className="text-4xl">📬</div>
                <p className="font-medium">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  We sent a reset link to <strong>{forgotEmail}</strong>.
                  Click the link in the email to set a new password.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-600 text-center">
                  Didn't receive it? Check your <strong>Spam</strong> or{" "}
                  <strong>Junk</strong> folder.
                </div>
                <Button
                  variant="ghost"
                  onClick={() => { setForgotStep("email"); setActiveTab("signin"); setError("") }}
                >
                  ← Back to Sign In
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ================= SIGN UP TAB ================= */}
          <TabsContent value="signup">
            {verificationStep === "none" ? (
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
                  placeholder="Password"
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
                  Enter the 8-digit code sent to <br />
                  <strong>{signUpEmail}</strong>
                </p>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-600 text-center">
                  Did not receive it? Check your <strong>Spam</strong> or
                  <strong> Junk</strong> folder. Mark it as
                  <strong> Not Spam</strong> to receive future emails normally.
                </div>

                <Input
                  placeholder="12345678"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  maxLength={8}
                  className="text-center text-2xl tracking-widest"
                />

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length < 8}>
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