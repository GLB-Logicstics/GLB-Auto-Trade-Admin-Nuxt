<template>
  <div v-if="config">
    <div class="page-head">
      <div>
        <NuxtLink :to="`/collections/${config.name}`" class="back">
          <i class="bi bi-arrow-left" />
          {{ config.label }}
        </NuxtLink>
        <h1>{{ isNew ? `Yeni ${config.single.toLowerCase()}` : title || config.single }}</h1>
      </div>
      <div class="page-head__actions">
        <button v-if="!isNew" type="button" class="btn btn--danger" @click="remove">
          <i class="bi bi-trash" />
          Sil
        </button>
        <button type="button" class="btn" :disabled="saving || !form" @click="save">
          <i class="bi" :class="saving ? 'bi-hourglass-split' : 'bi-check-lg'" />
          {{ saving ? 'Saxlanılır...' : 'Yadda saxla' }}
        </button>
      </div>
    </div>

    <div v-if="form" class="editor">
      <div class="editor__main">
        <section v-for="group in groups" :key="group.title" class="card">
          <div class="card__head"><h2>{{ group.title }}</h2></div>
          <div class="card__body form-grid">
            <FieldInput
              v-for="field in group.fields"
              :key="field.key"
              :field="field"
              :model-value="getPath(form, field.key)"
              @update:model-value="setPath(form, field.key, $event)"
            />
          </div>
        </section>

        <section v-if="translateFields.length && languages.length" class="card">
          <div class="card__head">
            <h2>Tərcümələr</h2>
            <div class="tabs">
              <button
                v-for="language in languages"
                :key="language.code"
                type="button"
                :class="{ 'is-active': lang === language.code }"
                @click="lang = language.code"
              >
                {{ language.name }}
              </button>
            </div>
          </div>
          <div class="card__body form-grid">
            <p class="field__help is-wide">Boş qalan sahədə saytda əsas dildəki mətn göstərilir.</p>
            <FieldInput
              v-for="field in translateFields"
              :key="`${lang}-${field.key}`"
              :field="field"
              :model-value="getPath(form, `i18n.${lang}.${field.key}`)"
              @update:model-value="setPath(form, `i18n.${lang}.${field.key}`, $event)"
            />
          </div>
        </section>
      </div>

      <aside class="editor__aside">
        <section class="card">
          <div class="card__head"><h2>Dərc</h2></div>
          <div class="card__body editor__settings">
            <label class="switch">
              <input v-model="isActive" type="checkbox" />
              <span class="switch__track" />
              Saytda göstər
            </label>

            <label class="field">
              <span class="field__label">Sıra</span>
              <input v-model.number="sortOrder" class="input" type="number" />
              <span class="field__help">Kiçik rəqəm siyahıda yuxarıda olur</span>
            </label>

            <label v-if="config.hasSlug" class="field">
              <span class="field__label">Slug (link)</span>
              <input v-model.trim="form.slug" class="input" placeholder="Boş qalsa addan yaranır" />
              <span v-if="siteLink" class="field__help">
                <a :href="siteLink" target="_blank">Saytda bax <i class="bi bi-box-arrow-up-right" /></a>
              </span>
            </label>

            <p v-if="updatedAt" class="field__help">Son dəyişiklik: {{ formatDate(updatedAt) }}</p>
          </div>
        </section>
      </aside>
    </div>

    <div v-else class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { findCollection } from '~/config/collections'
import { useToastStore } from '~/stores/toast'
import { apiError, formatDate } from '~/utils/format'
import { getPath, setPath } from '~/utils/path'
import type { CollectionConfig, CollectionItem, Field, FieldGroup, Option, Setting } from '~/types'

interface Language {
  code: string
  name: string
  is_default: boolean
}

const SITE_PATHS: Record<string, string> = {
  lots: '/auction-lots/',
  cars: '/cars/',
  services: '/services/',
  pages: '/',
}

export default defineComponent({
  name: 'CollectionEditPage',

  setup() {
    const config = findCollection(String(useRoute().params.name))
    if (!config) throw createError({ statusCode: 404, statusMessage: 'Bölmə tapılmadı', fatal: true })
    useHead({ title: `${config.single} — GLB Admin` })
  },

  data() {
    return {
      form: null as Record<string, unknown> | null,
      isActive: true,
      sortOrder: 0,
      title: '',
      updatedAt: '',
      saving: false,
      languages: [] as Language[],
      lang: '',
      locations: {} as Record<string, string[]>,
      partTypes: [] as Option[],
    }
  },

  computed: {
    config(): CollectionConfig | undefined {
      return findCollection(String(this.$route.params.name))
    },

    groups(): FieldGroup[] {
      if (!this.config) return []
      return this.config.groups.map((group) => ({ ...group, fields: group.fields.map((field) => this.resolveField(field)) }))
    },

    translateFields(): Field[] {
      if (!this.config) return []
      return this.config.groups.flatMap((group) => group.fields.filter((field) => field.translate))
    },

    isNew(): boolean {
      return this.$route.params.id === 'new'
    },

    siteLink(): string {
      const path = this.config ? SITE_PATHS[this.config.name] : ''
      if (!path || this.isNew || !this.form?.slug) return ''
      return `${this.$config.public.siteUrl}${path}${this.form.slug}`
    },
  },

  async mounted() {
    if (!this.config) return
    this.loadExtras()

    if (this.isNew) {
      this.form = this.config.empty()
      return
    }

    const item = await this.$api<CollectionItem>(`/collections/${this.config.name}/${this.$route.params.id}`)
    this.fill(item)
  },

  methods: {
    getPath,
    setPath,
    formatDate,

    async loadExtras() {
      const fields = this.config!.groups.flatMap((group) => group.fields)

      if (fields.some((field) => field.translate)) {
        const languages = await this.$api<Language[]>('/languages')
        this.languages = languages.filter((language) => !language.is_default)
        this.lang = this.languages[0]?.code || ''
      }

      if (fields.some((field) => field.optionsFrom === 'cities')) {
        const settings = await this.$api<Setting[]>('/settings')
        this.locations = (settings.find((setting) => setting.key === 'locations')?.value as Record<string, string[]>) || {}
      }

      if (fields.some((field) => field.optionsFrom === 'partTypes')) {
        const items = await this.$api<CollectionItem[]>('/collections/part_types')
        this.partTypes = items.map((item) => ({ label: String(item.data.label), value: String(item.data.value) }))
      }
    },

    resolveField(field: Field): Field {
      let options = field.options || []
      if (field.optionsFrom === 'cities') {
        const country = String((this.form && this.form.country) || 'aze')
        options = (this.locations[country] || []).map((city) => ({ label: city, value: city }))
      }
      if (field.optionsFrom === 'partTypes' && this.partTypes.length) options = this.partTypes

      const current = this.form ? String(getPath(this.form, field.key) ?? '') : ''
      if (field.optionsFrom && current && !options.some((option) => option.value === current)) {
        options = [{ label: current, value: current }, ...options]
      }
      if (field.optionsFrom === 'cities') options = [{ label: '— Seçin —', value: '' }, ...options]
      return field.optionsFrom ? { ...field, options } : field
    },

    fill(item: CollectionItem) {
      this.form = { ...this.config?.empty(), ...item.data }
      if (this.config?.hasSlug) this.form.slug = item.slug || ''
      this.isActive = item.isActive
      this.sortOrder = item.sortOrder
      this.title = item.title
      this.updatedAt = item.updatedAt
    },

    async save() {
      if (!this.config || !this.form) return

      this.saving = true
      try {
        const body = { data: this.form, isActive: this.isActive, sortOrder: this.sortOrder }
        const url = this.isNew ? `/collections/${this.config.name}` : `/collections/${this.config.name}/${this.$route.params.id}`
        const item = await this.$api<CollectionItem>(url, { method: this.isNew ? 'POST' : 'PUT', body })

        useToastStore().show('Yadda saxlandı')
        if (this.isNew) this.$router.replace(`/collections/${this.config.name}/${item.id}`)
        this.fill(item)
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.saving = false
    },

    async remove() {
      if (!this.config || !confirm('Silinsin? Bu əməliyyat geri qaytarılmır.')) return

      try {
        await this.$api(`/collections/${this.config.name}/${this.$route.params.id}`, { method: 'DELETE' })
        useToastStore().show('Silindi')
        this.$router.push(`/collections/${this.config.name}`)
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  color: $muted;
  font-size: 13px;

  &:hover {
    color: $primary-dark;
  }
}

.editor {
  display: grid;
  gap: 24px;
  align-items: start;

  @include up(xl) {
    grid-template-columns: 1fr 300px;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }

  &__aside {
    @include up(xl) {
      position: sticky;
      top: calc(#{$topbar} + 24px);
    }
  }

  &__settings {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
