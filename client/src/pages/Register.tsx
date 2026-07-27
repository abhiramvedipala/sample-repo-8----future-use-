import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Placeholder — step 7 replaces this with a real form, wired to
// POST /api/auth/register.
export function Register() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Coming in step 7 (Auth UI).</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This route exists so navigation works end to end. The real form
        connects to the register/login/logout/me API built in step 4.
      </CardContent>
    </Card>
  )
}
