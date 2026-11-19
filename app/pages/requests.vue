<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Müraciətlər</h1>
        <p>Saytdakı formalardan gələn sorğular</p>
      </div>
    </div>

    <section class="card">
      <div class="toolbar">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            :class="{ 'is-active': status === tab.value }"
            @click="setStatus(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>

      <div v-else-if="items.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Tarix</th>
              <th>Müştəri</th>
              <th>Mövzu və mesaj</th>
              <th>Status</th>
              <th>Qeyd</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td class="muted nowrap">{{ formatDate(item.created_at) }}</td>
              <td>
                <b>{{ item.name }}</b>
                <p><a :href="`tel:${item.phone}`">{{ item.phone }}</a></p>
                <p v-if="item.email" class="muted">{{ item.email }}</p>
              </td>
              <td class="message">
                <b>{{ item.subject }}</b>
                <p class="muted">{{ item.message || '—' }}</p>
              </td>
              <td>
                <select class="input input--sm" :value="item.status" @change="update(item, { status: value($event) })">
                  <option v-for="option in statuses" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </td>
              <td>
                <input
                  class="input input--sm"
                  :value="item.note"
                  placeholder="Qeyd yaz"
                  @change="update(item, { note: value($event) })"
                />
              </td>
              <td>
                <div class="table__actions">
                  <a
                    :href="`https://wa.me/${item.phone.replace(/\D/g, '')}`"
                    target="_blank"
                    class="btn btn--light btn--icon btn--sm"
                    title="WhatsApp"
                  >
                    <i class="bi bi-whatsapp" />
                  </a>
                  <button type="button" class="btn btn--danger btn--icon btn--sm" title="Sil" @click="remove(item)">
                    <i class="bi bi-trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty"><i class="bi bi-inbox" />Müraciət yoxdur</div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { requestStatuses } from '~/config/options'
import { useToastStore } from '~/stores/toast'
import { apiError, formatDate } from '~/utils/format'
import type { RequestItem } from '~/types'

export default defineComponent({
  name: 'RequestsPage',

  setup() {
    useHead({ title: 'Müraciətlər — GLB Admin' })
  },

  data() {
    return {
      items: [] as RequestItem[],
      status: '',
      loading: true,
      statuses: requestStatuses,
      tabs: [{ label: 'Hamısı', value: '' }, ...requestStatuses],
    }
  },

  mounted() {
    this.load()
  },

  methods: {
    formatDate,

    value(event: Event): string {
      return (event.target as HTMLInputElement).value
    },

    async load() {
      this.loading = true
      this.items = await this.$api<RequestItem[]>('/requests', { query: { status: this.status } })
      this.loading = false
    },

    setStatus(value: string) {
      this.status = value
      this.load()
    },

    async update(item: RequestItem, changes: Partial<RequestItem>) {
      try {
        const updated = await this.$api<RequestItem>(`/requests/${item.id}`, {
          method: 'PUT',
          body: { status: item.status, note: item.note, ...changes },
        })
        Object.assign(item, updated)
        useToastStore().show('Yeniləndi')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },

    async remove(item: RequestItem) {
      if (!confirm(`${item.name} müraciəti silinsin?`)) return

      try {
        await this.$api(`/requests/${item.id}`, { method: 'DELETE' })
        this.items = this.items.filter((row) => row.id !== item.id)
        useToastStore().show('Silindi')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.nowrap {
  white-space: nowrap;
}

.message {
  min-width: 240px;
  max-width: 380px;
}

.table select,
.table input {
  min-width: 140px;
}
</style>
