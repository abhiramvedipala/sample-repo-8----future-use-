// ---------------------------------------------------------------------------
// TanStack Query hooks for auth. This file is the ONLY place in the app that
// knows the session lives under the query key ["auth", "me"] — every
// component that needs to know "who's logged in" calls useCurrentUser()
// instead of managing its own loading state or re-fetching by hand.
// ---------------------------------------------------------------------------

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/lib/api'
import { type Credentials, type User, fetchCurrentUser, loginUser, logoutUser, registerUser } from './api'

// A "query key" is how TanStack Query names a piece of cached data — every
// component calling useQuery with this same key shares the same cached
// result and the same in-flight request, instead of each firing its own
// fetch.
export const currentUserKey = ['auth', 'me'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: fetchCurrentUser,
    // "Not logged in" (null) is a normal result, not a failure — retrying a
    // failed request makes sense for a flaky network blip, but retrying
    // "you're not logged in" five times before giving up would just make
    // every visitor wait needlessly on their very first page load.
    retry: false,
    // The session doesn't change on its own, so there's no need to
    // re-check it every time a component using this hook re-mounts.
    staleTime: 5 * 60 * 1000,
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation<User, ApiError, Credentials>({
    mutationFn: registerUser,
    onSuccess: (user) => {
      // The register response body already IS the freshly created user —
      // writing it straight into the cache makes useCurrentUser() reflect
      // "logged in" immediately, without a second round trip to /me just to
      // re-fetch the same information the server already just sent back.
      queryClient.setQueryData(currentUserKey, user)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation<User, ApiError, Credentials>({
    mutationFn: loginUser,
    onSuccess: (user) => {
      queryClient.setQueryData(currentUserKey, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, ApiError, void>({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(currentUserKey, null)
    },
  })
}
