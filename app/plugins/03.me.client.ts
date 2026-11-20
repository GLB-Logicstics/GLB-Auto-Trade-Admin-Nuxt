import { useAuthStore } from '~/stores/auth'
import type { Admin } from '~/types'

export default defineNuxtPlugin(async (nuxtApp) => {
  const auth = useAuthStore()
  if (!auth.loggedIn) return

  try {
    auth.admin = await nuxtApp.$api<Admin>('/me')
  } catch {
    auth.logout()
  }
})
