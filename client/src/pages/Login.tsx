import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Placeholder — step 7 replaces this with a real form (email + password,
// wired to POST /api/auth/login) and redirect-if-already-logged-in logic.
export function Login() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Coming in step 7 (Auth UI).</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This route exists so navigation works end to end. The real form
        connects to the register/login/logout/me API built in step 4.
      </CardContent>
    </Card>
  )
}
