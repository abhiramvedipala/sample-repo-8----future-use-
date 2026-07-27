import { Navigate, Outlet } from 'react-router'
import { useCurrentUser } from '@/features/auth/hooks'

// The mirror image of RequireAuth: wraps routes that only make sense for a
// LOGGED-OUT visitor (Login, Register). Without this, an already-logged-in
// user who navigates to /login would just see a login form again for no
// reason — this sends them straight to their dashboard instead.
export function RequireGuest() {
  const { data: user, isPending } = useCurrentUser()

  if (isPending) {
    return <p className="text-center text-sm text-muted-foreground">Loading…</p>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
