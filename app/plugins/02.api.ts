import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()

  const api = $fetch.create({
    baseURL: `${useRuntimeConfig().public.apiBase}/admin`,

    onRequest({ options }) {
      if (auth.token) options.headers.set('Authorization', `Bearer ${auth.token}`)
    },

    onResponseError({ response }) {
      if (response.status === 401 && auth.token) {
        auth.logout()
        navigateTo('/login')
      }
    },
  })

  return { provide: { api } }
})
