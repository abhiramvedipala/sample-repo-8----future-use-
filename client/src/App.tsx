import { Route, Routes } from 'react-router'
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
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        {/* Matches any URL that hit none of the routes above. Must be last
            — React Router checks routes in order and stops at the first
            match. */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
