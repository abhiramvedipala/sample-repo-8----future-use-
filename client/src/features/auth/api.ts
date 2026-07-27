import { api, ApiError } from '@/lib/api'

export interface User {
  id: string
  email: string
}

export interface Credentials {
  email: string
  password: string
}

export function registerUser(input: Credentials) {
  return api.post<User>('/api/auth/register', input)
}

export function loginUser(input: Credentials) {
  return api.post<User>('/api/auth/login', input)
}

export function logoutUser() {
  return api.post<{ message: string }>('/api/auth/logout')
}

// Returns the logged-in user, or null if there isn't one — NOT an error.
// "Nobody is logged in" is an expected, valid state (every visitor starts
// here), so a 401 from GET /api/auth/me is translated into a normal `null`
// result instead of being thrown. Any OTHER failure (the API being
// unreachable, a 500) still throws, because those genuinely are errors.
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await api.get<User>('/api/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}
