<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Daşınma qiymətləri</h1>
        <p>ABŞ meydançasından Poti limanına daşınma (USD). Kalkulyatorlar bu qiymətləri istifadə edir.</p>
      </div>
    </div>

    <section class="card add-card">
      <div class="card__head"><h2>Yeni meydança əlavə et</h2></div>
      <form class="card__body add-form" @submit.prevent="add">
        <select v-model="newRow.auction" class="input">
          <option v-for="option in auctions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <input v-model.trim="newRow.location" class="input" placeholder="Meydança, məs. TX - DALLAS" />
        <input v-model.number="newRow.price" class="input" type="number" placeholder="Qiymət ($)" />
        <button type="submit" class="btn" :disabled="!newRow.location">
          <i class="bi bi-plus-lg" />
          Əlavə et
        </button>
      </form>
    </section>

    <SheetImport ref="importer" class="add-card" :columns="importColumns" :busy="importing" @import="importRows">
      <select v-model="importAuction" class="input import-auction">
        <option v-for="option in auctions" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
      <template #help>Eyni meydança varsa qiyməti yenilənir, yoxdursa əlavə olunur.</template>
    </SheetImport>

    <section class="card">
      <div class="toolbar">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            :class="{ 'is-active': auction === tab.value }"
            @click="setAuction(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="search">
          <i class="bi bi-search" />
          <input v-model="search" class="input" placeholder="Meydança axtar" @input="searchLater" />
        </div>
        <span class="muted">{{ rows.length }} meydança</span>
      </div>

      <div v-if="loading" class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>

      <div v-else-if="rows.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Auksion</th>
              <th>Meydança</th>
              <th>Qiymət ($)</th>
              <th>Yeniləndi</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td><span class="badge badge--primary">{{ row.auction }}</span></td>
              <td><b>{{ row.location }}</b></td>
              <td>
                <input
                  class="input input--sm price"
                  type="number"
                  step="any"
                  :value="row.price"
                  @change="updatePrice(row, $event)"
                />
              </td>
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

      <div v-else class="empty"><i class="bi bi-truck" />Meydança tapılmadı</div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { auctions } from '~/config/options'
import { useToastStore } from '~/stores/toast'
import { apiError, formatDate } from '~/utils/format'
import type { ShippingRow } from '~/types'
import type { SheetColumn } from '~/utils/sheet'

let timer: ReturnType<typeof setTimeout> | undefined

export default defineComponent({
  name: 'ShippingPage',

  setup() {
    useHead({ title: 'Daşınma qiymətləri — GLB Admin' })
  },

  data() {
    return {
      rows: [] as ShippingRow[],
      auction: 'Copart',
      search: '',
      loading: true,
      auctions,
      tabs: [...auctions, { label: 'Hamısı', value: '' }],
      newRow: { auction: 'Copart', location: '', price: 0 },
      importAuction: 'Copart',
      importing: false,
      importColumns: [
        { key: 'location', label: 'Meydança', names: ['Meydança', 'Location', 'Yard', 'Ünvan'], type: 'text', required: true },
        { key: 'price', label: 'Qiymət', names: ['Qiymət', 'Price', 'Qiymet', 'USD'], type: 'number' },
      ] as SheetColumn[],
    }
  },

  mounted() {
    this.load()
  },

  methods: {
    formatDate,

    async load() {
      this.loading = true
      this.rows = await this.$api<ShippingRow[]>('/shipping', { query: { auction: this.auction, search: this.search } })
      this.loading = false
    },

    setAuction(value: string) {
      this.auction = value
      this.load()
    },

    searchLater() {
      clearTimeout(timer)
      timer = setTimeout(() => this.load(), 300)
    },

    async updatePrice(row: ShippingRow, event: Event) {
      const price = Number((event.target as HTMLInputElement).value) || 0
      try {
        Object.assign(row, await this.$api<ShippingRow>(`/shipping/${row.id}`, { method: 'PUT', body: { price } }))
        useToastStore().show(`${row.location}: $${row.price}`)
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },

    async importRows(rows: Record<string, string | number>[]) {
      this.importing = true
      try {
        const result = await this.$api<{ saved: number; skipped: number }>('/shipping/import', {
          method: 'POST',
          body: { auction: this.importAuction, rows },
        })
        const importer = this.$refs.importer as { clear: () => void }
        importer.clear()
        useToastStore().show(`${result.saved} sətir yükləndi${result.skipped ? `, ${result.skipped} keçildi` : ''}`)
        this.auction = this.importAuction
        this.load()
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.importing = false
    },

    async add() {
      try {
        await this.$api('/shipping', { method: 'POST', body: this.newRow })
        useToastStore().show('Meydança əlavə olundu')
        this.auction = this.newRow.auction
        this.search = this.newRow.location
        this.newRow = { auction: this.newRow.auction, location: '', price: 0 }
        this.load()
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },

    async remove(row: ShippingRow) {
      if (!confirm(`${row.auction} — ${row.location} silinsin?`)) return

      try {
        await this.$api(`/shipping/${row.id}`, { method: 'DELETE' })
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
.import-auction {
  max-width: 160px;
}

.add-card {
  margin-bottom: 24px;
}

.add-form {
  display: grid;
  gap: 12px;

  @include up(md) {
    grid-template-columns: 160px 1fr 160px auto;
  }
}

.price {
  max-width: 140px;
}
</style>
