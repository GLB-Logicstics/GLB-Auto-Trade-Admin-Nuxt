<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Əməliyyat jurnalı</h1>
        <p>Admin paneldə kim nəyi nə vaxt dəyişib (son 300 qeyd)</p>
      </div>
    </div>

    <section class="card">
      <div class="toolbar">
        <select v-model="entity" class="input input--sm filter" @change="load">
          <option value="">Bütün bölmələr</option>
          <option v-for="item in entities" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <div v-if="loading" class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>

      <div v-else-if="items.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Tarix</th>
              <th>Admin</th>
              <th>Əməliyyat</th>
              <th>Bölmə</th>
              <th>Təfərrüat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td class="muted nowrap">{{ formatDate(item.created_at) }}</td>
              <td>{{ item.admin_name }}</td>
              <td><span class="badge" :class="actionClass(item.action)">{{ actionLabel(item.action) }}</span></td>
              <td>
                {{ item.entity }}
                <span v-if="item.entity_id" class="muted">#{{ item.entity_id }}</span>
              </td>
              <td>{{ item.summary || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty"><i class="bi bi-clock-history" />Qeyd yoxdur</div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatDate } from '~/utils/format'
import type { AuditEntry } from '~/types'

const ACTIONS: Record<string, { label: string; className: string }> = {
  create: { label: 'Əlavə', className: 'badge--success' },
  update: { label: 'Dəyişiklik', className: 'badge--primary' },
  delete: { label: 'Silinmə', className: 'badge--danger' },
  import: { label: 'İmport', className: 'badge--warning' },
}

export default defineComponent({
  name: 'AuditPage',

  setup() {
    useHead({ title: 'Jurnal — GLB Admin' })
  },

  data() {
    return {
      items: [] as AuditEntry[],
      entities: [] as string[],
      entity: '',
      loading: true,
    }
  },

  mounted() {
    this.load()
  },

  methods: {
    formatDate,

    actionLabel(action: string): string {
      return ACTIONS[action]?.label || action
    },

    actionClass(action: string): string {
      return ACTIONS[action]?.className || ''
    },

    async load() {
      this.loading = true
      this.items = await this.$api<AuditEntry[]>('/audit', { query: { entity: this.entity } })
      if (!this.entity) this.entities = [...new Set(this.items.map((item) => item.entity))].sort()
      this.loading = false
    },
  },
})
</script>

<style lang="scss" scoped>
.nowrap {
  white-space: nowrap;
}

.filter {
  max-width: 240px;
}
</style>
