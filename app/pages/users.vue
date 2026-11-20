<template>
  <div>
    <div class="page-head">
      <div>
        <h1>İstifadəçilər və dilerlər</h1>
        <p>Saytda qeydiyyatdan keçənlər, diler müraciətləri və onların sorğuları</p>
      </div>
    </div>

    <section class="card">
      <div class="toolbar">
        <div class="search">
          <i class="bi bi-search" />
          <input v-model="search" class="input" placeholder="Ad, e-poçt, telefon və ya şirkət" @input="searchLater" />
        </div>
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            :class="{ 'is-active': role === tab.value }"
            @click="setRole(tab.value)"
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
              <th>Qeydiyyat</th>
              <th>İstifadəçi</th>
              <th>Növ</th>
              <th>Diler statusu</th>
              <th>Müraciət</th>
              <th>Avtomobil</th>
              <th>Blok</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <template v-for="user in items" :key="user.id">
              <tr>
                <td class="muted nowrap">{{ formatDate(user.created_at) }}</td>
                <td>
                  <b>{{ user.name }}</b>
                  <p class="muted">{{ user.email }}</p>
                  <p v-if="user.phone"><a :href="`tel:${user.phone}`">{{ user.phone }}</a></p>
                  <p v-if="user.company" class="muted"><i class="bi bi-building" /> {{ user.company }}</p>
                </td>
                <td>
                  <select class="input input--sm" :value="user.role" @change="update(user, { role: value($event) })">
                    <option value="user">İstifadəçi</option>
                    <option value="dealer">Diler</option>
                  </select>
                </td>
                <td>
                  <template v-if="user.role === 'dealer'">
                    <span class="badge" :class="statusClass(user.dealer_status)">{{ statusLabel(user.dealer_status) }}</span>
                    <div v-if="user.dealer_status !== 'approved'" class="actions">
                      <button type="button" class="btn btn--sm" @click="update(user, { dealerStatus: 'approved' })">Təsdiqlə</button>
                      <button
                        v-if="user.dealer_status !== 'rejected'"
                        type="button"
                        class="btn btn--light btn--sm"
                        @click="update(user, { dealerStatus: 'rejected' })"
                      >
                        Rədd et
                      </button>
                    </div>
                    <button v-else type="button" class="btn btn--light btn--sm actions" @click="update(user, { dealerStatus: 'pending' })">
                      Təsdiqi ləğv et
                    </button>
                  </template>
                  <span v-else class="muted">—</span>
                </td>
                <td>
                  <button type="button" class="btn btn--light btn--sm" :disabled="!user.requests" @click="toggleRequests(user)">
                    <i class="bi bi-inbox" /> {{ user.requests }}
                  </button>
                </td>
                <td>
                  <NuxtLink v-if="user.cars" to="/collections/cars" class="btn btn--light btn--sm">
                    <i class="bi bi-car-front" /> {{ user.cars }}
                  </NuxtLink>
                  <span v-else class="muted">0</span>
                </td>
                <td>
                  <label class="switch">
                    <input type="checkbox" :checked="user.is_blocked" @change="update(user, { isBlocked: !user.is_blocked })" />
                    <span class="switch__track" />
                  </label>
                </td>
                <td>
                  <div class="table__actions">
                    <button type="button" class="btn btn--danger btn--icon btn--sm" title="Sil" @click="remove(user)">
                      <i class="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="openId === user.id" class="requests-row">
                <td colspan="8">
                  <div v-if="!userRequests.length" class="muted">Yüklənir...</div>
                  <ul v-else class="requests">
                    <li v-for="item in userRequests" :key="item.id">
                      <span class="muted">{{ formatDate(item.created_at) }}</span>
                      <b>{{ item.subject }}</b>
                      <span>{{ item.message || '—' }}</span>
                      <span class="badge">{{ requestLabel(item.status) }}</span>
                    </li>
                  </ul>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-else class="empty"><i class="bi bi-people" />İstifadəçi yoxdur</div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { requestStatuses } from '~/config/options'
import { useToastStore } from '~/stores/toast'
import { apiError, formatDate } from '~/utils/format'
import type { RequestItem, SiteUser } from '~/types'

const DEALER_STATUSES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Gözləyir', className: 'badge--warning' },
  approved: { label: 'Təsdiqlənib', className: 'badge--success' },
  rejected: { label: 'Rədd edilib', className: 'badge--danger' },
}

let timer: ReturnType<typeof setTimeout> | undefined

export default defineComponent({
  name: 'UsersPage',

  setup() {
    useHead({ title: 'İstifadəçilər — GLB Admin' })
  },

  data() {
    return {
      items: [] as SiteUser[],
      search: '',
      role: String(this.$route.query.role || ''),
      loading: true,
      openId: 0,
      userRequests: [] as RequestItem[],
      tabs: [
        { label: 'Hamısı', value: '' },
        { label: 'İstifadəçilər', value: 'user' },
        { label: 'Dilerlər', value: 'dealer' },
        { label: 'Təsdiq gözləyənlər', value: 'pending' },
      ],
    }
  },

  mounted() {
    this.load()
  },

  methods: {
    formatDate,

    value(event: Event): string {
      return (event.target as HTMLSelectElement).value
    },

    statusLabel(status: string): string {
      return DEALER_STATUSES[status]?.label || 'Gözləyir'
    },

    statusClass(status: string): string {
      return DEALER_STATUSES[status]?.className || 'badge--warning'
    },

    requestLabel(status: string): string {
      return requestStatuses.find((item) => item.value === status)?.label || status
    },

    async load() {
      this.loading = true
      this.items = await this.$api<SiteUser[]>('/users', { query: { search: this.search, role: this.role } })
      this.loading = false
    },

    searchLater() {
      clearTimeout(timer)
      timer = setTimeout(() => this.load(), 300)
    },

    setRole(value: string) {
      this.role = value
      this.load()
    },

    async update(user: SiteUser, changes: { role?: string; dealerStatus?: string; isBlocked?: boolean }) {
      try {
        const updated = await this.$api<SiteUser>(`/users/${user.id}`, {
          method: 'PUT',
          body: {
            role: changes.role ?? user.role,
            dealerStatus: changes.dealerStatus ?? user.dealer_status,
            isBlocked: changes.isBlocked ?? user.is_blocked,
          },
        })
        Object.assign(user, updated)
        useToastStore().show('Yeniləndi')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },

    async toggleRequests(user: SiteUser) {
      if (this.openId === user.id) {
        this.openId = 0
        return
      }
      this.openId = user.id
      this.userRequests = []
      this.userRequests = await this.$api<RequestItem[]>(`/users/${user.id}/requests`)
    },

    async remove(user: SiteUser) {
      if (!confirm(`${user.email} silinsin? Müraciətləri saxlanılır, avtomobilləri adminə keçir.`)) return

      try {
        await this.$api(`/users/${user.id}`, { method: 'DELETE' })
        this.items = this.items.filter((row) => row.id !== user.id)
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

.actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.requests-row td {
  background: $bg;
}

.requests li {
  display: grid;
  grid-template-columns: 130px 1fr 2fr auto;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: 0;
  }
}
</style>
