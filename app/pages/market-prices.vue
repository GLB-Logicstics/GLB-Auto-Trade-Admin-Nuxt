<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Yerli bazar qiymətləri</h1>
        <p>Saytda "bazar qiymətindən ucuz" yazısı və kataloq müqayisəsi bu qiymətlərdən götürülür</p>
      </div>
    </div>

    <section class="card block">
      <div class="card__head">
        <h2>Avtomatik yeniləmə</h2>
        <label class="switch">
          <input type="checkbox" :checked="sync.enabled" @change="toggle" />
          <span class="switch__track" />
          Gündə bir dəfə
        </label>
      </div>
      <div class="card__body sync">
        <p>
          Sistem kataloqdakı və satışdakı hər avtomobil üçün Azərbaycan və Gürcüstan bazarında orta qiyməti AI ilə tapır: əvvəlcə
          Google axtarışı ilə turbo.az və myauto.ge elanlarına baxır, elan az olsa təxmin edir. "Mənbə" sütununda qiymətin haradan
          gəldiyi yazılır, ağlabatan görünməyən qiyməti silə bilərsiniz.
        </p>
        <p class="muted">
          Son yeniləmə: <b>{{ sync.lastRun ? formatDate(sync.lastRun) : 'hələ olmayıb' }}</b>
          <template v-if="okCount"> · {{ okCount }} qiymət yeniləndi</template>
        </p>
        <div class="sync__buttons">
          <button type="button" class="btn" :disabled="sync.running" @click="start">
            <i class="bi" :class="sync.running ? 'bi-hourglass-split' : 'bi-arrow-repeat'" />
            {{ sync.running ? 'Yenilənir... (bir neçə dəqiqə)' : 'İndi yenilə' }}
          </button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            :class="{ 'is-active': country === tab.value }"
            @click="setCountry(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="search">
          <i class="bi bi-search" />
          <input v-model="search" class="input" placeholder="Marka və ya model" @input="searchLater" />
        </div>
        <span class="muted">{{ rows.length }} qiymət</span>
      </div>

      <div v-if="loading" class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>

      <div v-else-if="rows.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Ölkə</th>
              <th>Avtomobil</th>
              <th>Qiymət</th>
              <th>Mənbə</th>
              <th>Yeniləndi</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td><span class="badge badge--primary">{{ countryLabel(row.country) }}</span></td>
              <td><b>{{ row.make }} {{ row.model }}</b> {{ row.year }}</td>
              <td>{{ formatMoney(row.price) }}</td>
              <td class="muted">{{ row.source || '—' }}</td>
              <td class="muted">{{ formatDate(row.updated_at) }}</td>
              <td>
                <div class="table__actions">
                  <button type="button" class="btn btn--danger btn--icon btn--sm" title="Sil" @click="remove(row)">
                    <i class="bi bi-trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty"><i class="bi bi-graph-up" />Qiymət yoxdur</div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { countries } from '~/config/options'
import { useToastStore } from '~/stores/toast'
import { apiError, formatDate, formatMoney } from '~/utils/format'
import type { MarketPrice } from '~/types'

let timer: ReturnType<typeof setTimeout> | undefined
let poll: ReturnType<typeof setTimeout> | undefined

interface SyncResult {
  source: string
  make: string
  model: string
  year: number
  count: number
  price: number
  error: string
}

interface SyncStatus {
  enabled: boolean
  running: boolean
  lastRun: string
  results: SyncResult[]
}

export default defineComponent({
  name: 'MarketPricesPage',

  setup() {
    useHead({ title: 'Bazar qiymətləri — GLB Admin' })
  },

  data() {
    return {
      rows: [] as MarketPrice[],
      country: '',
      search: '',
      loading: true,
      countries,
      tabs: [{ label: 'Hamısı', value: '' }, ...countries],
      sync: { enabled: true, running: false, lastRun: '', results: [] } as SyncStatus,
    }
  },

  computed: {
    okCount(): number {
      return this.sync.results.filter((item) => !item.error).length
    },
  },

  mounted() {
    this.load()
    this.loadSync()
  },

  beforeUnmount() {
    clearTimeout(poll)
  },

  methods: {
    formatDate,
    formatMoney,

    countryLabel(value: string): string {
      return countries.find((item) => item.value === value)?.label || value
    },

    async load() {
      this.loading = true
      this.rows = await this.$api<MarketPrice[]>('/market-prices', { query: { country: this.country, search: this.search } })
      this.loading = false
    },

    setCountry(value: string) {
      this.country = value
      this.load()
    },

    searchLater() {
      clearTimeout(timer)
      timer = setTimeout(() => this.load(), 300)
    },

    async loadSync() {
      const wasRunning = this.sync.running
      this.sync = await this.$api<SyncStatus>('/market-sync')
      if (wasRunning && !this.sync.running) this.load()
      if (this.sync.running) poll = setTimeout(() => this.loadSync(), 5000)
    },

    async start() {
      try {
        this.sync.running = true
        const result = await this.$api<{ done?: boolean, status?: SyncStatus }>('/market-sync', { method: 'POST' })
        if (result.done && result.status) {
          this.sync = result.status
          this.load()
          useToastStore().show('Bazar qiymətləri yeniləndi')
          return
        }
        useToastStore().show('Yeniləmə başladı')
        poll = setTimeout(() => this.loadSync(), 5000)
      } catch (error) {
        this.sync.running = false
        useToastStore().show(apiError(error), 'error')
      }
    },

    async toggle() {
      this.sync = await this.$api<SyncStatus>('/market-sync', { method: 'PUT', body: { enabled: !this.sync.enabled } })
    },

    async remove(row: MarketPrice) {
      if (!confirm(`${row.make} ${row.model} ${row.year} silinsin?`)) return

      try {
        await this.$api(`/market-prices/${row.id}`, { method: 'DELETE' })
        this.rows = this.rows.filter((item) => item.id !== row.id)
        useToastStore().show('Silindi')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.block {
  margin-bottom: 24px;
}

.sync {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__buttons {
    display: flex;
    gap: 10px;
  }
}
</style>
