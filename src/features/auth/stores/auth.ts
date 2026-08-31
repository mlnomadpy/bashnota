import { defineStore } from 'pinia'
import { supabaseAuthService as authService } from '@/features/auth/services/supabaseAuth'
import type { AuthState, LoginCredentials, RegisterCredentials } from '@/features/auth/types/user'
import { toast } from '@/services/toast'

const TAG_PATTERN = /^[a-zA-Z0-9_]{3,30}$/
const authRedirect = (path: string) => new URL(`${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`, window.location.origin).toString()

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isLoading: (state) => state.loading,
    currentUser: (state) => state.user,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,
    isInitialized: (state) => state.initialized,
    // Add isAdmin getter based on a predefined list of admin user IDs
    isAdmin: (state) => {
      if (!state.user) return false;
      
      // This should move to a restricted Supabase role table before admin-only
      // product behavior is added.
      const adminUserIds = [
        'YQBcqDhwkKMtNbh1WmdFp2bFBXk1', // Replace with actual admin UIDs
      ];
      
      return adminUserIds.includes(state.user.uid);
    },
  },

  actions: {
    // Initialize auth state listener
    async init() {
      if (this.initialized) return
      try {
        const initialSession = await authService.currentSession()
        this.user = await authService.mapSessionToProfile(initialSession)
        authService.onAuthStateChange(session => {
          void authService.mapSessionToProfile(session).then(profile => {
            this.user = profile
          }).catch(error => {
            this.user = null
            this.error = error instanceof Error ? error.message : 'Authentication state could not be restored'
          })
        })
      } catch (error) {
        this.user = null
        this.error = error instanceof Error ? error.message : 'Authentication state could not be restored'
      } finally {
        this.initialized = true
      }
    },

    // Login with email and password
    async loginWithEmail(credentials: LoginCredentials) {
      this.loading = true
      this.error = null

      try {
        const session = await authService.loginWithEmail(credentials.email, credentials.password)
        this.user = await authService.mapSessionToProfile(session)
        return this.user
      } catch (error: any) {
        this.error = error.message || 'Login failed'
        return null
      } finally {
        this.loading = false
      }
    },

    // Login with Google
    async loginWithGoogle(redirect = '/') {
      this.loading = true
      this.error = null

      try {
        const callback = new URL(authRedirect('/auth/callback'))
        callback.searchParams.set('redirect', redirect)
        const session = await authService.loginWithGoogle(callback.toString())
        if (session) this.user = await authService.mapSessionToProfile(session)
        return true
      } catch (error: any) {
        this.error = error.message || 'Google login failed'
        return false
      } finally {
        this.loading = false
      }
    },

    // Register with email and password
    async register(credentials: RegisterCredentials) {
      this.loading = true
      this.error = null

      try {
        const session = await authService.register(
          credentials.email,
          credentials.password,
          credentials.displayName,
        )
        this.user = await authService.mapSessionToProfile(session)
        return true
      } catch (error: any) {
        this.error = error.message || 'Registration failed'
        return false
      } finally {
        this.loading = false
      }
    },

    // Generate a user tag for the current user
    async isUserTagAvailable(tag: string) {
      if (!TAG_PATTERN.test(tag)) return false
      if (tag === this.user?.userTag) return true
      return authService.isTagAvailable(tag)
    },

    // Update the user's tag
    async updateUserTag(newTag: string) {
      if (!this.user) return false

      this.loading = true
      this.error = null

      try {
        // Validate the tag first
        if (!TAG_PATTERN.test(newTag)) {
          this.error = 'Tag must be 3–30 letters, numbers, or underscores'
          toast(this.error, {
            description: 'User Tag Error'
          })
          return false
        }
        if (newTag !== this.user.userTag && !(await authService.isTagAvailable(newTag))) {
          this.error = 'This user tag is already taken'
          return false
        }
        await authService.updateUserTag(this.user.uid, newTag)
        
        // Update local user object
        this.user = {
          ...this.user,
          userTag: newTag,
        }
        
        return true
      } catch (error: any) {
        this.error = error.message || 'Failed to update user tag'
        return false
      } finally {
        this.loading = false
      }
    },

    // Logout
    async logout() {
      this.loading = true

      try {
        await authService.logout()
        this.user = null
        // Clear any in-memory user data if needed
        return true
      } catch (error: any) {
        this.error = error.message || 'Logout failed'
        return false
      } finally {
        this.loading = false
      }
    },

    // Reset password
    async resetPassword(email: string) {
      this.loading = true
      this.error = null

      try {
        await authService.resetPassword(email, authRedirect('/auth/reset-password'))
        return true
      } catch (error: any) {
        this.error = error.message || 'Password reset failed'
        return false
      } finally {
        this.loading = false
      }
    },

    async completeOAuthCallback(callbackUrl: string) {
      this.loading = true
      this.error = null
      try {
        const session = await authService.completeOAuthCallback(callbackUrl)
        this.user = await authService.mapSessionToProfile(session)
        return true
      } catch (error: any) {
        this.error = error.message || 'OAuth sign-in failed'
        return false
      } finally {
        this.loading = false
      }
    },

    async updatePassword(password: string) {
      this.loading = true
      this.error = null
      try {
        await authService.updatePassword(password)
        return true
      } catch (error: any) {
        this.error = error.message || 'Password update failed'
        return false
      } finally {
        this.loading = false
      }
    },

    // Clear any auth errors
    clearError() {
      this.error = null
    },
  },
})
