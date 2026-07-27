import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Placeholder — step 7 makes this a PROTECTED route, step 8 fills it with
// the real list, filters/sort, and create/edit forms wired to the
// applications CRUD API built in step 5.
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
        This route exists so navigation works end to end. Step 7 will make it
        require login first.
      </CardContent>
    </Card>
  )
}
