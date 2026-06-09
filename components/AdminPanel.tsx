'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string | null
  display_name: string | null
  portfolio_balance: number
  updated_at: string
}

export default function AdminPanel() {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ msg: '', error: false })

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, display_name, portfolio_balance, updated_at')
      .order('updated_at', { ascending: false })
    if (data) setUsers(data)
  }

  function showToast(msg: string, error = false) {
    setToast({ msg, error })
    setTimeout(() => setToast({ msg: '', error: false }), 3000)
  }

  async function handleUpdate() {
    if (!email) return showToast('Email is required', true)
    const bal = parseFloat(amount)
    if (isNaN(bal) || bal < 0) return showToast('Enter a valid amount', true)

    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        portfolio_balance: bal,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)

    setLoading(false)
    if (error) return showToast('Error: ' + error.message, true)

    showToast(`✓ Balance updated for ${email}`)
    setEmail(''); setAmount('')
    fetchUsers()
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">

      {/* Toast */}
      {toast.msg && (
        <div className={`fixed bottom-5 right-5 px-4 py-2 rounded-lg text-sm z-50 border ${
          toast.error
            ? 'bg-red-950 text-red-400 border-red-800'
            : 'bg-green-950 text-green-400 border-green-800'
        }`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-green-400 text-xs tracking-widest mb-6">
        ⬡ CRYPTO VAULT — ADMIN PANEL
      </h1>

      {/* Set Balance */}
      <div className="border border-green-900 bg-[#0f1a0f] rounded-xl p-6 mb-6">
        <p className="text-green-400 text-xs tracking-widest mb-4">SET USER BALANCE</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            placeholder="user@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="col-span-2 bg-[#0a120a] border border-green-900 rounded-md px-3 py-2 text-sm text-gray-200 outline-none focus:border-green-400"
          />
          <input
            placeholder="Amount e.g. 25000"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="bg-[#0a120a] border border-green-900 rounded-md px-3 py-2 text-sm text-gray-200 outline-none focus:border-green-400"
          />
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-green-800 hover:bg-green-700 disabled:opacity-50 text-green-200 px-5 py-2 rounded-md text-sm transition-colors"
          >
            {loading ? 'Updating...' : 'Apply Balance'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-green-900 bg-[#0f1a0f] rounded-xl p-6">
        <p className="text-green-400 text-xs tracking-widest mb-4">ALL USERS</p>
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
                  <div className="text-gray-200">{u.display_name ?? '—'}</div>
                  <div className="text-gray-500 text-xs">{u.email}</div>
                </td>
                <td className="text-green-400 font-medium">
                  ${u.portfolio_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="text-gray-500 text-xs">{u.updated_at?.slice(0, 10)}</td>
                <td>
                  <button
                    onClick={() => { setEmail(u.email ?? ''); setAmount(String(u.portfolio_balance)) }}
                    className="border border-green-900 text-gray-500 hover:text-green-400 hover:border-green-400 rounded px-2 py-1 text-xs transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center text-gray-600 py-8">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}