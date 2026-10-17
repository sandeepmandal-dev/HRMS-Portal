import { create } from 'zustand'
import { authApi } from '../api/authApi'
import { employeeApi } from '../api/employeeApi'
import { tokenStorage } from '../api/axiosClient'

export const useAuthStore = create((set, get) => ({
  user: null, // { userId, email, role }
  profile: null, // Employee profile (name, department, etc.) - fetched separately
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
  isBootstrapping: true, // true while we re-validate the session on app load
  isLoading: false,
  error: null,

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authApi.login({ email, password })
      tokenStorage.setTokens(data.accessToken, data.refreshToken)
      set({
        user: { userId: data.userId, email: data.email, role: data.role },
        isAuthenticated: true,
        isLoading: false,
      })
      // Profile fetch is best-effort; a missing Employee row (rare, e.g. a bare admin
      // account) shouldn't block login.
      get().loadProfile()
      return true
    } catch (err) {
      set({ isLoading: false, error: err?.response?.data?.message || 'Invalid email or password' })
      return false
    }
  },

  loadProfile: async () => {
    try {
      const profile = await employeeApi.getMyProfile()
      set({ profile })
    } catch {
      set({ profile: null })
    }
  },

  bootstrap: async () => {
    const token = tokenStorage.getAccessToken()
    if (!token) {
      set({ isBootstrapping: false })
      return
    }
    try {
      const profile = await employeeApi.getMyProfile()
      // We don't have a "whoami" endpoint for the raw User, so we derive identity
      // from the JWT payload stored at login time, falling back to the profile's email.
      const cached = JSON.parse(localStorage.getItem('hrms_user') || 'null')
      set({
        user: cached,
        profile,
        isAuthenticated: true,
        isBootstrapping: false,
      })
    } catch {
      tokenStorage.clear()
      set({ isAuthenticated: false, user: null, profile: null, isBootstrapping: false })
    }
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {
      // Ignore network errors on logout — we clear local state regardless.
    }
    tokenStorage.clear()
    localStorage.removeItem('hrms_user')
    set({ user: null, profile: null, isAuthenticated: false })
  },
}))

// Persist the decoded identity (not the raw token) so a page refresh can restore
// `user` without waiting on a dedicated /me endpoint for the User entity.
useAuthStore.subscribe((state, prevState) => {
  if (state.user && state.user !== prevState.user) {
    localStorage.setItem('hrms_user', JSON.stringify(state.user))
  }
})
