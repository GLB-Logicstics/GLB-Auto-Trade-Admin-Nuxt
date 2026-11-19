import { defineStore } from 'pinia'

export interface Toast {
  id: number
  text: string
  type: 'success' | 'error'
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [] as Toast[],
  }),

  actions: {
    show(text: string, type: Toast['type'] = 'success') {
      const id = Date.now() + Math.random()
      this.items.push({ id, text, type })
      setTimeout(() => this.remove(id), 3500)
    },

    remove(id: number) {
      this.items = this.items.filter((item) => item.id !== id)
    },
  },
})
