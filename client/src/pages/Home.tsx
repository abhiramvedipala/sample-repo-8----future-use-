import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const pipeline = ['Applied', 'OA', 'Interview', 'Offer / Rejected']

export function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Track every job application in one place
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Log applications, follow them through each stage, and see your
          progress at a glance.
        </p>
        <div className="flex gap-3 pt-2">
          <Button asChild>
            <Link to="/register">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">I already have an account</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>The pipeline</CardTitle>
          <CardDescription>
            Every application moves through the same stages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {pipeline.map((stage, i) => (
              <span key={stage} className="flex items-center gap-2">
                <span className="rounded-full border border-border px-3 py-1">
                  {stage}
                </span>
                {i < pipeline.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
