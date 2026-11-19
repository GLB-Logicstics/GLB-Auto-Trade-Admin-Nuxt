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
        <section v-for="group in config.groups" :key="group.title" class="card">
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
import type { CollectionConfig, CollectionItem } from '~/types'

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
    }
  },

  computed: {
    config(): CollectionConfig | undefined {
      return findCollection(String(this.$route.params.name))
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
