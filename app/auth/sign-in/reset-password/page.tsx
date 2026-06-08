'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [linkError, setLinkError] = useState('')

  // Wait for Supabase to pick up the session from the URL hash
  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted && session) setReady(true)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
      }
    )

    checkSession()

    const timer = window.setTimeout(() => {
      if (mounted && !ready) {
        setLinkError('This reset link is invalid or expired. Please request a new reset code.')
      }
    }, 3500)

    return () => {
      mounted = false
      window.clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [ready, supabase.auth])

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          {linkError ? (
            <div className="w-full max-w-sm border border-border rounded-xl p-6 bg-card">
              <h1 className="text-2xl font-bold text-center mb-3">Reset Link Expired</h1>
              <p className="text-sm text-muted-foreground mb-5">{linkError}</p>
              <Button onClick={() => router.push('/?auth=forgot')}>Request New Code</Button>
            </div>
          ) : (
            <>
              <Spinner />
              <p className="text-sm text-muted-foreground mt-4">Verifying your reset link...</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border rounded-xl p-6 bg-card">
        <h1 className="text-2xl font-bold text-center mb-1">New Password</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Choose a strong password for your account
        </p>

        {success ? (
          <div className="text-center space-y-3">
            <div className="text-4xl">✅</div>
            <p className="font-medium text-green-500">Password updated!</p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Update Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
