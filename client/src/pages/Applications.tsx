import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// The real list, filters/sort, and create/edit forms arrive in step 8,
// wired to the applications CRUD API built in step 5. This route is already
// protected — see RequireAuth in App.tsx.
export function Applications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
        <CardDescription>
          Coming in step 8 — list, filters, sort, and create/edit forms.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This route is protected — you can only see this because you're
        logged in.
      </CardContent>
    </Card>
  )
}
