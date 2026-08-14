<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/features/auth/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function safeInternalRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/'
  if (value.includes('\\') || /%5c/i.test(value)) return '/'
  const resolved = new URL(value, window.location.origin)
  if (resolved.origin !== window.location.origin) return '/'
  return `${resolved.pathname}${resolved.search}${resolved.hash}`
}

const errorMessage = computed(() => authStore.errorMessage)

onMounted(async () => {
  const completed = await authStore.completeOAuthCallback(window.location.href)
  if (completed) await router.replace(safeInternalRedirect(route.query.redirect))
})
</script>

<template>
  <main class="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4" aria-live="polite">
    <div class="max-w-md text-center">
      <Loader2 v-if="!errorMessage" class="mx-auto mb-4 h-8 w-8 animate-spin" aria-hidden="true" />
      <h1 class="text-xl font-semibold">{{ errorMessage ? 'Sign-in could not be completed' : 'Completing sign-in…' }}</h1>
      <p v-if="errorMessage" class="mt-2 text-sm text-destructive">{{ errorMessage }}</p>
    </div>
  </main>
</template>
