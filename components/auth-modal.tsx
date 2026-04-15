"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { Github, Mail } from "lucide-react"
import { signInWithEmail, signUpWithEmail } from "@/actions/auth-actions"   // ← New import

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "signin" | "signup"
}

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }: AuthModalProps) {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [successMessage, setSuccessMessage] = useState("")
const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccessMessage("");

  if (!signInEmail || !signInPassword) {
    setError("Please fill in all fields");
    return;
  }

  setIsLoading(true);

  try {
    await signInWithEmail(signInEmail, signInPassword);
    onOpenChange(false);     // Close the modal
    // No need for router.push — the server action will handle redirect
  } catch (err: any) {
    setError(err.message || "Login failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

 const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccessMessage("");

  if (!signUpEmail || !signUpPassword) {
    setError("Please fill in all fields");
    return;
  }

  setIsLoading(true);

  try {
    await signUpWithEmail(signUpEmail, signUpPassword);
    onOpenChange(false);     // Close the modal
    // No need for router.push — the server action will handle redirect
  } catch (err: any) {
    setError(err.message || "Signup failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to <span className="text-primary">CryptoVault</span>
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Sign in to your account or create a new one to start trading
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="bg-secondary border-white/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="bg-secondary border-white/10"
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Spinner className="mr-2" /> : null}
                Sign In
              </Button>

              {/* Google & GitHub buttons (you can implement later) */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" className="border-white/10" disabled>
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" type="button" className="border-white/10" disabled>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="bg-secondary border-white/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="bg-secondary border-white/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  className="bg-secondary border-white/10"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}
              {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Spinner className="mr-2" /> : null}
                Create Account
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" className="border-white/10" disabled>
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" type="button" className="border-white/10" disabled>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
