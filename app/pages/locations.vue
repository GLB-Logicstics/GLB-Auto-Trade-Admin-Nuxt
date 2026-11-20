<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Ölkə və şəhərlər</h1>
        <p>"Hazırda satışda" bölməsinin filtrində və avtomobil formasında görünən şəhərlər</p>
      </div>
      <div class="page-head__actions">
        <button type="button" class="btn" :disabled="saving || !loaded" @click="save">
          <i class="bi" :class="saving ? 'bi-hourglass-split' : 'bi-check-lg'" />
          Yadda saxla
        </button>
      </div>
    </div>

    <div v-if="loaded" class="locations">
      <section v-for="country in countries" :key="country.value" class="card">
        <div class="card__head"><h2>{{ country.label }}</h2></div>
        <div class="card__body">
          <label class="field">
            <span class="field__label">Şəhərlər</span>
            <textarea v-model="texts[country.value]" class="input input--area" />
            <span class="field__help">Hər sətirdə bir şəhər. Tərcüməsi "Tərcümələr" bölməsindədir</span>
          </label>
        </div>
      </section>
    </div>

    <div v-else class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { countries } from '~/config/options'
import { useToastStore } from '~/stores/toast'
import { apiError } from '~/utils/format'
import type { Setting } from '~/types'

export default defineComponent({
  name: 'LocationsPage',

  setup() {
    useHead({ title: 'Şəhərlər — GLB Admin' })
  },

  data() {
    return {
      countries,
      texts: {} as Record<string, string>,
      loaded: false,
      saving: false,
    }
  },

  async mounted() {
    const settings = await this.$api<Setting[]>('/settings')
    const value = (settings.find((setting) => setting.key === 'locations')?.value || {}) as Record<string, string[]>
    for (const country of countries) this.texts[country.value] = (value[country.value] || []).join('\n')
    this.loaded = true
  },

  methods: {
    async save() {
      const value: Record<string, string[]> = {}
      for (const country of countries) {
        value[country.value] = (this.texts[country.value] || '')
          .split('\n')
          .map((city) => city.trim())
          .filter(Boolean)
      }

      this.saving = true
      try {
        await this.$api('/settings/locations', { method: 'PUT', body: { value } })
        useToastStore().show('Şəhərlər yadda saxlandı')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.saving = false
    },
  },
})
</script>

<style lang="scss" scoped>
.locations {
  display: grid;
  gap: 24px;

  @include up(lg) {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
