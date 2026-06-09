// app/admin/actions.ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'brainbroservice@gmail.com'

// Verify the caller is actually the admin
async function verifyAdmin() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized')
  }
}

export async function updateUserBalance(
  email: string,
  balance: number,
  displayName?: string
) {
  await verifyAdmin()

  const admin = createAdminClient()

  // Find user by email
  const { data: profile, error: findError } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()

  if (findError) throw new Error(findError.message)
  if (!profile) throw new Error(`No profile found for ${email}`)

  // Update with service role — bypasses RLS
  const { error } = await admin
    .from('profiles')
    .update({
      portfolio_balance: balance,
      ...(displayName?.trim() && { display_name: displayName.trim() }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function fetchAllUsers() {
  await verifyAdmin()

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, display_name, portfolio_balance, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function resetAllBalances() {
  await verifyAdmin()

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({
      portfolio_balance: 15000,
      updated_at: new Date().toISOString(),
    })
    .neq('id', '')

  if (error) throw new Error(error.message)
  return { success: true }
}