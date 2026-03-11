import { useAuthStore } from '@/store/useAuthStore'
import LandingPage from '@/components/LandingPage'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const user = useAuthStore(s => s.user)

  return user ? <Dashboard /> : <LandingPage />
}
