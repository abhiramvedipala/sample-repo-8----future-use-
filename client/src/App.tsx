import { Route, Routes } from 'react-router'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireGuest } from '@/components/auth/RequireGuest'
import { Layout } from '@/components/layout/Layout'
import { Applications } from '@/pages/Applications'
import { Dashboard } from '@/pages/Dashboard'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'
import { Register } from '@/pages/Register'

// The route table: which URL renders which page. Every <Route> here is
// nested inside the single <Route element={<Layout />}> below, so every
// page shares the same nav bar (Layout's <Outlet /> is where each one
// actually renders) — see src/components/layout/Layout.tsx.
//
// RequireAuth and RequireGuest are "layout routes" with no path of their
// own — they just wrap a group of child routes in a check before rendering
// their <Outlet />. Nesting <Route path="dashboard" /> inside
// <Route element={<RequireAuth />}> is what makes /dashboard require login
// without repeating that check inside the Dashboard component itself.
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        <Route element={<RequireGuest />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
        </Route>

        {/* Matches any URL that hit none of the routes above. Must be last
            — React Router checks routes in order and stops at the first
            match. */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
