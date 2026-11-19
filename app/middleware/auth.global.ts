import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (!auth.loggedIn && to.path !== '/login') return navigateTo('/login')
  if (auth.loggedIn && to.path === '/login') return navigateTo('/')
})
