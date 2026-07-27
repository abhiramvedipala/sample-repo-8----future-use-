import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

// Matches any URL that isn't one of the routes defined in App.tsx (see the
// path="*" route there). Every real app needs this — otherwise an unknown
// URL just renders a blank page with no explanation.
export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        There's nothing at this URL.
      </p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  )
}
