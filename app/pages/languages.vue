<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Dillər</h1>
        <p>Saytın dil seçimində görünən dillər. Əsas dil silinmir və söndürülmür</p>
      </div>
    </div>

    <div class="layout">
      <section class="card">
        <div v-if="loading" class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Ad</th>
                <th>Sıra</th>
                <th>Aktiv</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.code">
                <td>
                  <b>{{ item.code.toUpperCase() }}</b>
                  <span v-if="item.is_default" class="badge badge--primary">Əsas</span>
                </td>
                <td><input v-model="item.name" class="input input--sm" /></td>
                <td><input v-model.number="item.sort_order" class="input input--sm order" type="number" /></td>
                <td>
                  <label class="switch">
                    <input v-model="item.is_active" type="checkbox" :disabled="item.is_default" />
                    <span class="switch__track" />
                  </label>
                </td>
                <td>
                  <div class="table__actions">
                    <button type="button" class="btn btn--sm" @click="save(item)"><i class="bi bi-check-lg" /></button>
                    <button
                      v-if="!item.is_default"
                      type="button"
                      class="btn btn--danger btn--icon btn--sm"
                      title="Sil"
                      @click="remove(item)"
                    >
                      <i class="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h2>Yeni dil</h2></div>
        <form class="card__body form" @submit.prevent="create">
          <label class="field">
            <span class="field__label">Kod</span>
            <input v-model.trim="form.code" class="input" placeholder="məs. tr" maxlength="5" />
          </label>
          <label class="field">
            <span class="field__label">Ad</span>
            <input v-model.trim="form.name" class="input" placeholder="məs. Türkçe" />
          </label>
          <button type="submit" class="btn btn--block"><i class="bi bi-plus-lg" /> Əlavə et</button>
          <p class="field__help">
            Dil əlavə etdikdən sonra "Tərcümələr" bölməsində mətnləri doldurun. Tərcüməsi olmayan mətn əsas dildə göstərilir.
          </p>
        </form>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToastStore } from '~/stores/toast'
import { apiError } from '~/utils/format'
import type { Language } from '~/types'

export default defineComponent({
  name: 'LanguagesPage',

  setup() {
    useHead({ title: 'Dillər — GLB Admin' })
  },

  data() {
    return {
      items: [] as Language[],
      loading: true,
      form: { code: '', name: '' },
    }
  },

  async mounted() {
    this.items = await this.$api<Language[]>('/languages')
    this.loading = false
  },

  methods: {
    async save(item: Language) {
      try {
        const updated = await this.$api<Language>(`/languages/${item.code}`, {
          method: 'PUT',
          body: { name: item.name, isActive: item.is_active, sortOrder: item.sort_order },
        })
        Object.assign(item, updated)
        useToastStore().show('Yadda saxlandı')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },

    async create() {
      try {
        const item = await this.$api<Language>('/languages', { method: 'POST', body: this.form })
        this.items.push(item)
        this.form = { code: '', name: '' }
        useToastStore().show('Dil əlavə olundu')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },

    async remove(item: Language) {
      if (!confirm(`${item.name} dili və bütün tərcümələri silinsin?`)) return

      try {
        await this.$api(`/languages/${item.code}`, { method: 'DELETE' })
        this.items = this.items.filter((row) => row.code !== item.code)
        useToastStore().show('Silindi')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.layout {
  display: grid;
  gap: 24px;
  align-items: start;

  @include up(xl) {
    grid-template-columns: 1fr 340px;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order {
  max-width: 80px;
}

.badge {
  margin-left: 6px;
}
</style>
