import { useAuthStore } from '~/stores/auth'
import type { Admin } from '~/types'

export default defineNuxtPlugin(() => {
  const cookie = useCookie<{ token: string; admin: Admin } | null>('glb_admin', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict',
  })

  const auth = useAuthStore()
  if (cookie.value) auth.setSession(cookie.value.token, cookie.value.admin)

  auth.$subscribe(() => {
    cookie.value = auth.token && auth.admin ? { token: auth.token, admin: auth.admin } : null
  })
})
