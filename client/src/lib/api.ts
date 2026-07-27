// ---------------------------------------------------------------------------
// THE FRONTEND <-> BACKEND SEAM.
//
// Every network call this app makes to the Express API goes through the
// `api` object below. Centralizing it here means the two things that matter
// for every single request — where the server lives, and how the session
// cookie gets attached — are each written exactly once.
// ---------------------------------------------------------------------------

// Read at build/dev time from client/.env's VITE_API_URL (see step 1 — this
// is why the variable needed the VITE_ prefix: without it, Vite refuses to
// expose it to browser code at all).
const API_URL = import.meta.env.VITE_API_URL as string

// Mirrors the shape server/src/middleware/errorHandler.ts actually sends:
// { error: { message } }. Carrying the HTTP status code lets callers tell
// "not logged in" (401) apart from "you don't own this" (404) apart from
// "the server broke" (500) without re-parsing the message text.
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    // Without this, the browser never sends the httpOnly session cookie on
    // a cross-origin request (localhost:5173 -> localhost:4000 counts as
    // cross-origin even though it's the same machine), and the server's
    // cors({ credentials: true }) from step 3 never gets to matter. Both
    // sides have to opt in, or the cookie silently never arrives.
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      message = body.error?.message ?? message
    } catch {
      // Response wasn't JSON (e.g. the API is unreachable and a proxy
      // returned an HTML error page) — fall back to the status text.
    }
    throw new ApiError(res.status, message)
  }

  // DELETE responses are 204 No Content — no body to parse. res.json()
  // would throw on an empty body, so this is checked explicitly rather than
  // relying on a try/catch to paper over it.
  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
