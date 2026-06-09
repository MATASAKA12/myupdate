'use client'

import { useState, useEffect } from 'react'
import { updateUserBalance, fetchAllUsers, resetAllBalances } from '@/app/admin/actions'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function AdminPanel() {
  const [users, setUsers] = useState<Profile[]>([])
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState({ msg: '', error: false })
  const [loading, setLoading] = useState(false)

  useEffect(() => { void loadUsers() }, [])

  async function loadUsers() {
    try {
      const data = await fetchAllUsers()
      if (data) setUsers(data)
    } catch (err: any) {
      showToast(err.message, true)
    }
  }

  function showToast(msg: string, error = false) {
    setToast({ msg, error })
    setTimeout(() => setToast({ msg: '', error: false }), 3000)
  }

  async function handleUpdate() {
    if (!email.trim()) return showToast('Email is required', true)
    const bal = parseFloat(amount)
    if (isNaN(bal) || bal < 0) return showToast('Enter a valid amount', true)

    setLoading(true)
    try {
      await updateUserBalance(email, bal, displayName)
      showToast(`✓ Balance updated for ${email}`)
      setEmail(''); setAmount(''); setDisplayName('')
      void loadUsers()
    } catch (err: any) {
      showToast('Error: ' + err.message, true)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!confirm('Reset ALL balances to $15,000?')) return
    setLoading(true)
    try {
      await resetAllBalances()
      showToast('All balances reset to $15,000')
      void loadUsers()
    } catch (err: any) {
      showToast('Error: ' + err.message, true)
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      {toast.msg && (
        <div className={`fixed bottom-5 right-5 px-4 py-2 rounded-lg text-sm z-50 border ${
          toast.error
            ? 'bg-red-950 text-red-400 border-red-800'
            : 'bg-green-900 text-green-300 border-green-700'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Set Balance */}
      <div className="border border-green-900 bg-[#0f1a0f] rounded-xl p-6 mb-6">
        <h2 className="text-green-400 text-xs tracking-widest mb-4">SET USER BALANCE</h2>
        <input
          placeholder="user@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-[#0a120a] border border-green-900 rounded-md px-3 py-2 text-sm text-gray-200 mb-3 outline-none focus:border-green-400"
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            placeholder="Amount (USD)"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="bg-[#0a120a] border border-green-900 rounded-md px-3 py-2 text-sm text-gray-200 outline-none focus:border-green-400"
          />
          <input
            placeholder="Display name (optional)"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="bg-[#0a120a] border border-green-900 rounded-md px-3 py-2 text-sm text-gray-200 outline-none focus:border-green-400"
          />
        </div>
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-green-800 hover:bg-green-700 disabled:opacity-50 text-green-200 px-5 py-2 rounded-md text-sm transition-colors"
        >
          {loading ? 'Updating...' : 'Apply Balance'}
        </button>
      </div>

      {/* Users Table */}
      <div className="border border-green-900 bg-[#0f1a0f] rounded-xl p-6 mb-6">
        <h2 className="text-green-400 text-xs tracking-widest mb-4">USER ACCOUNTS</h2>
        <input
          placeholder="Search by email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#0a120a] border border-green-900 rounded-md px-3 py-2 text-sm text-gray-200 mb-4 outline-none focus:border-green-400"
        />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-green-400 text-xs tracking-wider">
              <th className="text-left pb-3">User</th>
              <th className="text-left pb-3">Balance</th>
              <th className="text-left pb-3">Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-green-950 hover:bg-[#0a150a]">
                <td className="py-3">
                  <div className="text-gray-200">{u.display_name || 'Unnamed'}</div>
                  <div className="text-gray-500 text-xs">{u.email || 'No email'}</div>
                </td>
                <td className="text-green-400 font-medium">
                  ${u.portfolio_balance?.toLocaleString()}
                </td>
                <td className="text-gray-500 text-xs">{u.updated_at?.slice(0, 10)}</td>
                <td>
                  <button
                    onClick={() => {
                      setEmail(u.email || '')
                      setAmount(String(u.portfolio_balance))
                      setDisplayName(u.display_name || '')
                    }}
                    className="border border-green-900 text-gray-500 hover:text-green-400 hover:border-green-400 rounded px-2 py-1 text-xs transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-600 py-8">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-900 bg-[#120a0a] rounded-xl p-6">
        <h2 className="text-red-400 text-xs tracking-widest mb-3">DANGER ZONE</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Reset all balances to default</p>
            <p className="text-xs text-gray-500 mt-1">Sets every user back to $15,000</p>
          </div>
          <button
            onClick={handleReset}
            disabled={loading}
            className="border border-red-900 text-red-400 hover:bg-red-950 disabled:opacity-50 px-4 py-2 rounded-md text-sm transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  )
}
