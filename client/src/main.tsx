import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App.tsx'
import './index.css'

// One QueryClient for the whole app — it owns the cache every useQuery/
// useMutation call in the app reads from and writes to. Created here, once,
// outside any component, so it survives re-renders (creating a new one
// inside a component would wipe the entire cache on every render).
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* QueryClientProvider makes the cache above reachable from any
        component via useQuery/useMutation, the same way BrowserRouter makes
        routing reachable from any component via useNavigate/useLocation. */}
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter is what actually watches the browser's URL (via the
          History API) and re-renders <Routes> when it changes — App.tsx's
          route table does nothing without something wrapping it to drive it. */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* Dev-only panel showing exactly what's in the query cache and its
          state (loading/fresh/stale) — strips out of the production build
          entirely. Genuinely useful for seeing what "the cache" in the
          explanations above actually looks like. */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
