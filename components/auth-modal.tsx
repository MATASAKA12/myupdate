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

  // Sign In — two steps: password check → OTP verify
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInStep, setSignInStep] = useState<"credentials" | "otp">("credentials")
  const [signInOtp, setSignInOtp] = useState("")

  // Sign Up
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [signUpStep, setSignUpStep] = useState<"none" | "otp">("none")
  const [signUpOtp, setSignUpOtp] = useState("")

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "newpassword">("email")
  const [forgotOtp, setForgotOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const loadSignInCaptcha = useCallback(() => {
    if (!document.getElementById("canv")) return
    loadCaptchaEnginge(6, "white", "black", "upper")
  }, [])

  useEffect(() => {
    if (open) setActiveTab(defaultTab)
  }, [defaultTab, open])

  useEffect(() => {
    if (!open || activeTab !== "signin" || signInStep !== "credentials") return
    const timer = setTimeout(loadSignInCaptcha, 0)
    return () => clearTimeout(timer)
  }, [activeTab, loadSignInCaptcha, open, signInStep])

  const resetForm = () => {
    setError("")
    setSuccessMessage("")
    setCaptchaInput("")
    setSignInEmail("")
    setSignInPassword("")
    setSignInStep("credentials")
    setSignInOtp("")
    setSignUpEmail("")
    setSignUpPassword("")
    setSignUpConfirmPassword("")
    setAcceptedTerms(false)
    setSignUpStep("none")
    setSignUpOtp("")
    setForgotEmail("")
    setForgotStep("email")
    setForgotOtp("")
    setNewPassword("")
    setConfirmNewPassword("")
  }

  // =================
  // SIGN IN — Step 1: verify password + captcha, then send OTP
  // =================
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
      // First verify password is correct
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      })
      if (signInError) throw signInError

      // Password correct — sign out immediately and send OTP
      await supabase.auth.signOut()

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: signInEmail,
        options: { shouldCreateUser: false },
      })
      if (otpError) throw otpError

      setSignInStep("otp")
      setSuccessMessage(`A 6-digit code has been sent to ${signInEmail}`)
    } catch (err: any) {
      setError(err.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  // SIGN IN — Step 2: verify the OTP code
  const handleVerifySignInOtp = async () => {
    if (signInOtp.length < 6) {
      setError("Please enter the full 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: signInEmail,
        token: signInOtp,
        type: "email",
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
      setError("Invalid or expired code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // =================
  // SIGN UP — send OTP
  // =================
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
        },
      })
      if (error) throw error

      setSignUpStep("otp")
      setSuccessMessage(`We've sent an 8-digit verification code to ${signUpEmail}.`)
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.")
    } finally {
      setIsLoading(false)
    }
  }

  // SIGN UP — verify OTP
  const handleVerifySignUpOtp = async () => {
    if (signUpOtp.length < 6) {
      setError("Please enter the full code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: signUpEmail,
        token: signUpOtp,
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

  // =================
  // FORGOT PASSWORD — Step 1: send OTP
  // =================
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // signInWithOtp sends a code (not a magic link) when OTP is enabled in Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email: forgotEmail,
        options: { shouldCreateUser: false },
      })
      if (error) throw error

      setForgotStep("otp")
      setSuccessMessage(`A 6-digit reset code has been sent to ${forgotEmail}`)
    } catch (err: any) {
      setError(err.message || "Failed to send reset code")
    } finally {
      setIsLoading(false)
    }
  }

  // FORGOT PASSWORD — Step 2: verify OTP
  const handleVerifyForgotOtp = async () => {
    if (forgotOtp.length < 6) {
      setError("Please enter the full 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: forgotEmail,
        token: forgotOtp,
        type: "email",
      })
      if (error) throw error

      setForgotStep("newpassword")
      setSuccessMessage("")
    } catch (err: any) {
      setError("Invalid or expired code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // FORGOT PASSWORD — Step 3: set new password
  const handleSetNewPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setSuccessMessage("Password updated successfully!")
      setTimeout(() => {
        resetForm()
        setActiveTab("signin")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to update password")
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
          onValueChange={(value) => {
            setActiveTab(value as "signin" | "signup" | "forgot")
            setError("")
            setSuccessMessage("")
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="forgot">Reset</TabsTrigger>
          </TabsList>

          {/* ===== SIGN IN TAB ===== */}
          <TabsContent value="signin">
            {signInStep === "credentials" ? (
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
                  {isLoading ? <Spinner /> : "Continue"}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 mt-6">
                <p className="text-center text-sm text-muted-foreground">
                  Enter the 6-digit code sent to <br />
                  <strong>{signInEmail}</strong>
                </p>
                {successMessage && (
                  <p className="text-green-500 text-sm text-center">{successMessage}</p>
                )}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-600 text-center">
                  Didn't receive it? Check your <strong>Spam</strong> or <strong>Junk</strong> folder.
                </div>
                <Input
                  placeholder="123456"
                  value={signInOtp}
                  onChange={(e) => setSignInOtp(e.target.value.trim())}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button onClick={handleVerifySignInOtp} disabled={isLoading || signInOtp.length < 6}>
                  {isLoading ? <Spinner /> : "Verify & Sign In"}
                </Button>
                <Button variant="ghost" onClick={() => { setSignInStep("credentials"); setError(""); setSignInOtp("") }}>
                  ← Back
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ===== FORGOT PASSWORD TAB ===== */}
          <TabsContent value="forgot">
            {forgotStep === "email" && (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 mt-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter your email and we'll send you a 6-digit reset code.
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
                  {isLoading ? <Spinner /> : "Send Reset Code"}
                </Button>
                <Button variant="ghost" type="button" onClick={() => { setActiveTab("signin"); setError("") }}>
                  ← Back to Sign In
                </Button>
              </form>
            )}

            {forgotStep === "otp" && (
              <div className="flex flex-col gap-4 mt-6">
                <p className="text-center text-sm text-muted-foreground">
                  Enter the 6-digit code sent to <br />
                  <strong>{forgotEmail}</strong>
                </p>
                {successMessage && (
                  <p className="text-green-500 text-sm text-center">{successMessage}</p>
                )}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-600 text-center">
                  Didn't receive it? Check your <strong>Spam</strong> or <strong>Junk</strong> folder.
                </div>
                <Input
                  placeholder="123456"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.trim())}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button onClick={handleVerifyForgotOtp} disabled={isLoading || forgotOtp.length < 6}>
                  {isLoading ? <Spinner /> : "Verify Code"}
                </Button>
                <Button variant="ghost" onClick={() => { setForgotStep("email"); setError(""); setForgotOtp("") }}>
                  ← Back
                </Button>
              </div>
            )}

            {forgotStep === "newpassword" && (
              <form onSubmit={handleSetNewPassword} className="flex flex-col gap-4 mt-4">
                <p className="text-sm text-muted-foreground text-center">
                  Choose a new password for your account.
                </p>
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Update Password"}
                </Button>
              </form>
            )}
          </TabsContent>

          {/* ===== SIGN UP TAB ===== */}
          <TabsContent value="signup">
            {signUpStep === "none" ? (
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
                  Enter the code sent to <br />
                  <strong>{signUpEmail}</strong>
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-600 text-center">
                  Did not receive it? Check your <strong>Spam</strong> or
                  <strong> Junk</strong> folder. Mark it as
                  <strong> Not Spam</strong> to receive future emails normally.
                </div>
                <Input
                  placeholder="123456"
                  value={signUpOtp}
                  onChange={(e) => setSignUpOtp(e.target.value.trim())}
                  maxLength={8}
                  className="text-center text-2xl tracking-widest"
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}
                <Button onClick={handleVerifySignUpOtp} disabled={isLoading || signUpOtp.length < 6}>
                  {isLoading ? <Spinner /> : "Verify Code"}
                </Button>
                <Button variant="ghost" onClick={() => { setSignUpStep("none"); setError(""); setSignUpOtp("") }}>
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