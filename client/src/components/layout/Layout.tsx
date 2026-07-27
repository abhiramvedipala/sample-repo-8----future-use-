// ---------------------------------------------------------------------------
// The shared shell around every page: a top nav bar, plus an <Outlet /> where
// React Router renders whichever page matches the current URL.
//
// This is what makes navigation feel like a real app instead of separate
// HTML documents: the nav bar never unmounts when you click a link — only
// the <Outlet /> content swaps. Compare that to a plain <a href="/login">,
// which would reload the entire page (and the browser's network tab would
// show a full document request) instead of just re-rendering a component.
// ---------------------------------------------------------------------------

import { NavLink, Outlet, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { useCurrentUser, useLogout } from '@/features/auth/hooks'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/applications', label: 'Applications' },
]

export function Layout() {
  // Every page shares this ONE call, because TanStack Query caches the
  // result under the shared "auth","me" key — Login, RequireAuth, and this
  // nav bar are all reading the same cached value, not each firing their
  // own request to the server.
  const { data: user, isPending } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/'),
    })
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="font-semibold tracking-tight">
            Job Application Tracker
          </NavLink>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                // NavLink (unlike plain Link) knows whether ITS OWN route is
                // the current one and passes that into className as a
                // render prop — this is what lets "active page" styling
                // exist at all without manually comparing the URL yourself.
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isPending ? null : user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
