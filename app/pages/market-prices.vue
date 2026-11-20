<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Yerli bazar qiymətləri</h1>
        <p>
          Azərbaycan və Gürcüstan bazarında orta qiymətlər. Saytda "bazar qiymətindən ucuz" və kataloq müqayisəsi bu cədvəldən
          götürülür
        </p>
      </div>
    </div>

    <section class="card block">
      <div class="card__head"><h2>Qiymət əlavə et və ya yenilə</h2></div>
      <form class="card__body add-form" @submit.prevent="add">
        <select v-model="form.country" class="input">
          <option v-for="option in countries" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <input v-model.trim="form.make" class="input" placeholder="Marka" />
        <input v-model.trim="form.model" class="input" placeholder="Model" />
        <input v-model.number="form.year" class="input" type="number" placeholder="İl" />
        <input v-model.number="form.price" class="input" type="number" placeholder="Qiymət ($)" />
        <input v-model.trim="form.source" class="input" placeholder="Mənbə (turbo.az, myauto.ge)" />
        <button type="submit" class="btn"><i class="bi bi-plus-lg" /> Saxla</button>
      </form>
    </section>

    <SheetImport ref="importer" class="block" :columns="importColumns" :busy="importing" @import="importRows">
      <template #help>Ölkə sütununda "aze" / "geo" və ya "Azərbaycan" / "Gürcüstan" yazın.</template>
    </SheetImport>

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
                  <button type="button" class="btn btn--light btn--icon btn--sm" title="Redaktə" @click="edit(row)">
                    <i class="bi bi-pencil" />
                  </button>
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
import type { SheetColumn } from '~/utils/sheet'

let timer: ReturnType<typeof setTimeout> | undefined

function emptyForm() {
  return { country: 'aze', make: '', model: '', year: new Date().getFullYear(), price: 0, source: '' }
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
      importing: false,
      countries,
      form: emptyForm(),
      tabs: [{ label: 'Hamısı', value: '' }, ...countries],
      importColumns: [
        { key: 'country', label: 'Ölkə', names: ['Ölkə', 'Country', 'Olke'], type: 'text', required: true },
        { key: 'make', label: 'Marka', names: ['Marka', 'Make', 'Brand'], type: 'text', required: true },
        { key: 'model', label: 'Model', names: ['Model'], type: 'text', required: true },
        { key: 'year', label: 'İl', names: ['İl', 'Il', 'Year'], type: 'number' },
        { key: 'price', label: 'Qiymət', names: ['Qiymət', 'Qiymet', 'Price', 'USD'], type: 'number' },
        { key: 'source', label: 'Mənbə', names: ['Mənbə', 'Menbe', 'Source'], type: 'text' },
      ] as SheetColumn[],
    }
  },

  mounted() {
    this.load()
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

    edit(row: MarketPrice) {
      this.form = { country: row.country, make: row.make, model: row.model, year: row.year, price: row.price, source: row.source }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    async add() {
      try {
        await this.$api('/market-prices', { method: 'POST', body: this.form })
        useToastStore().show('Qiymət yadda saxlandı')
        this.form = emptyForm()
        this.load()
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },

    async importRows(rows: Record<string, string | number>[]) {
      const country = (value: unknown) => (/^(geo|ge|gür|gur)/i.test(String(value).trim()) ? 'geo' : 'aze')
      this.importing = true
      try {
        const result = await this.$api<{ saved: number; skipped: number }>('/market-prices/import', {
          method: 'POST',
          body: { rows: rows.map((row) => ({ ...row, country: country(row.country) })) },
        })
        const importer = this.$refs.importer as { clear: () => void }
        importer.clear()
        useToastStore().show(`${result.saved} sətir yükləndi${result.skipped ? `, ${result.skipped} keçildi` : ''}`)
        this.load()
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.importing = false
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

.add-form {
  display: grid;
  gap: 12px;

  @include up(lg) {
    grid-template-columns: 140px 1fr 1fr 100px 120px 1fr auto;
  }
}
</style>
