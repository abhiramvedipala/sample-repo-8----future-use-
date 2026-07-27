import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Placeholder — step 7 makes this a PROTECTED route (redirect to /login if
// not authenticated), step 9 fills it with real counts-per-status and
// applications-per-week stats pulled from the API.
export function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>
          Coming in step 9 — counts per status and applications per week.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This route exists so navigation works end to end. Step 7 will make it
        require login first.
      </CardContent>
    </Card>
  )
}
