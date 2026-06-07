// lib/supabase/types.ts

export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  portfolio_balance: number
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
      }
    }
  }
}