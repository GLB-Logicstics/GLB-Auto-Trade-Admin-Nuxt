<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Tərcümələr</h1>
        <p>Saytdakı düymə, başlıq, menyu və digər qısa mətnlər. Açar — Azərbaycan dilindəki mətndir</p>
      </div>
      <div class="page-head__actions">
        <button type="button" class="btn" :disabled="!changedCount || saving" @click="save">
          <i class="bi" :class="saving ? 'bi-hourglass-split' : 'bi-check-lg'" />
          Yadda saxla ({{ changedCount }})
        </button>
      </div>
    </div>

    <section class="card">
      <div class="toolbar">
        <div class="search">
          <i class="bi bi-search" />
          <input v-model="search" class="input" placeholder="Mətn axtar" @input="page = 1" />
        </div>
        <label class="switch">
          <input v-model="onlyMissing" type="checkbox" @change="page = 1" />
          <span class="switch__track" />
          Yalnız tərcüməsi olmayanlar
        </label>
      </div>

      <div v-if="loading" class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>

      <template v-else>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Açar</th>
                <th v-for="language in languages" :key="language.code">{{ language.name }}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in pagedRows" :key="row.key">
                <td class="key">{{ row.key }}</td>
                <td v-for="language in languages" :key="language.code">
                  <textarea
                    class="input input--sm cell"
                    :class="{ 'is-changed': isChanged(row.key, language.code) }"
                    rows="1"
                    :placeholder="language.is_default ? row.key : ''"
                    :value="row.values[language.code] || ''"
                    @input="change(row, language.code, ($event.target as HTMLTextAreaElement).value)"
                  />
                </td>
                <td>
                  <button type="button" class="btn btn--danger btn--icon btn--sm" title="Sil" @click="remove(row)">
                    <i class="bi bi-trash" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pager">
          <span class="muted">{{ filteredRows.length }} mətn</span>
          <div class="pager__buttons">
            <button type="button" class="btn btn--light btn--sm" :disabled="page === 1" @click="page--">
              <i class="bi bi-chevron-left" />
            </button>
            <span>{{ page }} / {{ pageCount }}</span>
            <button type="button" class="btn btn--light btn--sm" :disabled="page === pageCount" @click="page++">
              <i class="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      </template>
    </section>

    <section class="card add">
      <div class="card__head"><h2>Yeni mətn</h2></div>
      <form class="card__body add__form" @submit.prevent="add">
        <input v-model.trim="newKey" class="input" placeholder="Azərbaycan dilində mətn (saytdakı kimi)" />
        <button type="submit" class="btn"><i class="bi bi-plus-lg" /> Əlavə et</button>
      </form>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToastStore } from '~/stores/toast'
import { apiError } from '~/utils/format'
import type { Language } from '~/types'

interface Row {
  key: string
  values: Record<string, string>
}

const PAGE_SIZE = 50

export default defineComponent({
  name: 'TranslationsPage',

  setup() {
    useHead({ title: 'Tərcümələr — GLB Admin' })
  },

  data() {
    return {
      rows: [] as Row[],
      languages: [] as Language[],
      changes: {} as Record<string, { key: string; lang: string; value: string }>,
      search: '',
      onlyMissing: false,
      page: 1,
      newKey: '',
      loading: true,
      saving: false,
    }
  },

  computed: {
    filteredRows(): Row[] {
      const text = this.search.trim().toLowerCase()
      const others = this.languages.filter((language) => !language.is_default)
      return this.rows.filter((row) => {
        if (this.onlyMissing && others.every((language) => row.values[language.code])) return false
        if (!text) return true
        return [row.key, ...Object.values(row.values)].some((value) => value.toLowerCase().includes(text))
      })
    },

    pageCount(): number {
      return Math.max(1, Math.ceil(this.filteredRows.length / PAGE_SIZE))
    },

    pagedRows(): Row[] {
      return this.filteredRows.slice((this.page - 1) * PAGE_SIZE, this.page * PAGE_SIZE)
    },

    changedCount(): number {
      return Object.keys(this.changes).length
    },
  },

  async mounted() {
    const [languages, rows] = await Promise.all([this.$api<Language[]>('/languages'), this.$api<Row[]>('/translations')])
    this.languages = languages
    this.rows = rows
    this.loading = false
  },

  methods: {
    isChanged(key: string, lang: string): boolean {
      return !!this.changes[`${lang}|${key}`]
    },

    change(row: Row, lang: string, value: string) {
      row.values[lang] = value
      this.changes[`${lang}|${row.key}`] = { key: row.key, lang, value }
    },

    async save() {
      this.saving = true
      try {
        await this.$api('/translations', { method: 'PUT', body: { items: Object.values(this.changes) } })
        this.changes = {}
        useToastStore().show('Tərcümələr yadda saxlandı')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.saving = false
    },

    add() {
      if (!this.newKey) return
      if (!this.rows.some((row) => row.key === this.newKey)) this.rows.unshift({ key: this.newKey, values: {} })
      this.search = this.newKey
      this.page = 1
      this.newKey = ''
    },

    async remove(row: Row) {
      if (!confirm(`"${row.key}" bütün dillərdə silinsin?`)) return

      try {
        await this.$api('/translations', { method: 'DELETE', query: { key: row.key } })
      } catch {
        useToastStore().show('Bazada yox idi, siyahıdan çıxarıldı')
      }
      this.rows = this.rows.filter((item) => item.key !== row.key)
      for (const id of Object.keys(this.changes)) {
        if (id.endsWith(`|${row.key}`)) delete this.changes[id]
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.key {
  min-width: 220px;
  max-width: 320px;
  font-weight: 500;
}

.cell {
  min-width: 220px;
  height: auto;
  min-height: 36px;
  padding-top: 8px;
  resize: vertical;

  &.is-changed {
    border-color: $primary;
    background: $primary-soft;
  }
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid $border;

  &__buttons {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.add {
  margin-top: 24px;

  &__form {
    display: flex;
    gap: 12px;
  }
}
</style>
