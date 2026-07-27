import { Navigate, Outlet, useLocation } from 'react-router'
import { useCurrentUser } from '@/features/auth/hooks'

// Wraps a group of routes in App.tsx that should only be reachable while
// logged in (Dashboard, Applications). This is a client-side convenience,
// NOT the actual security boundary — a determined user could edit the JS
// and skip straight past this check. The REAL protection is server-side:
// every applications route requires a valid session cookie (step 4's
// requireAuth middleware) and the server rejects anything else with 401.
// This component exists purely so a logged-out visitor sees a login page
// instead of a broken/empty dashboard.
export function RequireAuth() {
  const { data: user, isPending } = useCurrentUser()
  const location = useLocation()

  // While the very first "am I logged in?" check is still in flight, render
  // nothing conclusive yet. Redirecting immediately here would flash every
  // logged-in user through the login page for a split second on page load.
  if (isPending) {
    return <p className="text-center text-sm text-muted-foreground">Loading…</p>
  }

  if (!user) {
    // `state={{ from: location }}` carries along where the user was TRYING
    // to go, so Login can send them back there after a successful login
    // instead of always dropping them on a generic default page.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
