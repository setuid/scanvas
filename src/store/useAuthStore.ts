import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  loading: boolean
  syncing: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setSyncing: (syncing: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  syncing: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setSyncing: (syncing) => set({ syncing }),
}))
