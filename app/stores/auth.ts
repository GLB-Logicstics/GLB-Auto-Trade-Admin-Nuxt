import { defineStore } from 'pinia'
import type { Admin } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    admin: null as Admin | null,
  }),

  getters: {
    loggedIn: (state) => !!state.token,
    initials: (state) => (state.admin ? state.admin.name.slice(0, 1).toUpperCase() : 'A'),
  },

  actions: {
    setSession(token: string, admin: Admin) {
      this.token = token
      this.admin = admin
    },

    logout() {
      this.token = ''
      this.admin = null
    },
  },
})
