// lib/supabase/types.ts

export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  portfolio_balance: number
  created_at: string
  updated_at: string
}

export type Trade = {
  id: string
  user_id: string
  type: 'buy' | 'sell'
  coin: string
  amount: number
  price: number
  total: number
  status: 'completed' | 'pending'
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
        Relationships: []
      }
      trades: {
        Row: Trade
        Insert: Partial<Trade> & Pick<Trade, 'user_id' | 'type' | 'coin' | 'amount' | 'price' | 'total'>
        Update: Partial<Trade>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
