import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentUser } from '@/features/auth/hooks'

// Real stats arrive in step 9 (counts per status, applications per week).
// This route is already protected — see RequireAuth in App.tsx — so by the
// time this component renders, useCurrentUser() is guaranteed to have a
// logged-in user.
export function Dashboard() {
  const { data: user } = useCurrentUser()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>
          Coming in step 9 — counts per status and applications per week.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Logged in as {user?.email}. Only reachable while authenticated — try
        logging out and visiting /dashboard directly.
      </CardContent>
    </Card>
  )
}
