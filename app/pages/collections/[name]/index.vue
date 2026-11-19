<template>
  <div v-if="config">
    <div class="page-head">
      <div>
        <h1>{{ config.label }}</h1>
        <p>{{ items.length }} qeyd · aktiv olanlar saytda görünür</p>
      </div>
      <div class="page-head__actions">
        <NuxtLink :to="`/collections/${config.name}/new`" class="btn">
          <i class="bi bi-plus-lg" />
          Yeni {{ config.single.toLowerCase() }}
        </NuxtLink>
      </div>
    </div>

    <section class="card">
      <div class="toolbar">
        <div class="search">
          <i class="bi bi-search" />
          <input v-model="search" class="input" placeholder="Ada görə axtar" @input="searchLater" />
        </div>
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            :class="{ 'is-active': filter === tab.value }"
            @click="filter = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>

      <div v-else-if="visibleItems.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th v-for="column in config.columns" :key="column.key">{{ column.label }}</th>
              <th>Saytda</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleItems" :key="item.id">
              <td class="muted">{{ item.id }}</td>
              <td v-for="column in config.columns" :key="column.key">
                <img
                  v-if="column.type === 'image'"
                  :src="imageUrl(getPath(item.data, column.key), $config.public.siteUrl) || placeholder"
                  alt=""
                  class="table__thumb"
                />
                <template v-else>{{ cell(item, column) }}</template>
              </td>
              <td>
                <label class="switch">
                  <input type="checkbox" :checked="item.isActive" @change="toggle(item)" />
                  <span class="switch__track" />
                </label>
              </td>
              <td>
                <div class="table__actions">
                  <NuxtLink :to="`/collections/${config.name}/${item.id}`" class="btn btn--light btn--icon btn--sm" title="Redaktə">
                    <i class="bi bi-pencil" />
                  </NuxtLink>
                  <button type="button" class="btn btn--danger btn--icon btn--sm" title="Sil" @click="remove(item)">
                    <i class="bi bi-trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty">
        <i class="bi bi-folder2-open" />
        Heç nə tapılmadı
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { findCollection } from '~/config/collections'
import { useToastStore } from '~/stores/toast'
import { apiError, formatMoney, imageUrl } from '~/utils/format'
import { getPath } from '~/utils/path'
import type { CollectionConfig, CollectionItem, Column } from '~/types'

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40"%3E%3Crect width="56" height="40" fill="%23f4f7fb"/%3E%3C/svg%3E'

let timer: ReturnType<typeof setTimeout> | undefined

export default defineComponent({
  name: 'CollectionListPage',

  setup() {
    const config = findCollection(String(useRoute().params.name))
    if (!config) throw createError({ statusCode: 404, statusMessage: 'Bölmə tapılmadı', fatal: true })
    useHead({ title: `${config.label} — GLB Admin` })
  },

  data() {
    return {
      items: [] as CollectionItem[],
      search: '',
      filter: 'all',
      loading: true,
      placeholder: PLACEHOLDER,
      tabs: [
        { label: 'Hamısı', value: 'all' },
        { label: 'Aktiv', value: 'active' },
        { label: 'Gizli', value: 'hidden' },
      ],
    }
  },

  computed: {
    config(): CollectionConfig | undefined {
      return findCollection(String(this.$route.params.name))
    },

    visibleItems(): CollectionItem[] {
      if (this.filter === 'active') return this.items.filter((item) => item.isActive)
      if (this.filter === 'hidden') return this.items.filter((item) => !item.isActive)
      return this.items
    },
  },

  watch: {
    '$route.params.name'() {
      this.search = ''
      this.filter = 'all'
      this.load()
    },
  },

  mounted() {
    this.load()
  },

  methods: {
    getPath,
    imageUrl,

    async load() {
      if (!this.config) return
      this.loading = true
      this.items = await this.$api<CollectionItem[]>(`/collections/${this.config.name}`, {
        query: { search: this.search },
      })
      this.loading = false
    },

    searchLater() {
      clearTimeout(timer)
      timer = setTimeout(() => this.load(), 300)
    },

    cell(item: CollectionItem, column: Column): string {
      const value = getPath(item.data, column.key)
      if (column.type === 'money') return formatMoney(value)
      if (column.type === 'option') return column.options?.find((option) => option.value === value)?.label || String(value ?? '')
      return String(value ?? '')
    },

    async toggle(item: CollectionItem) {
      try {
        const updated = await this.$api<CollectionItem>(`/collections/${this.config?.name}/${item.id}`, {
          method: 'PUT',
          body: { ...item, isActive: !item.isActive },
        })
        item.isActive = updated.isActive
        useToastStore().show(updated.isActive ? 'Saytda göstərilir' : 'Saytdan gizlədildi')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },

    async remove(item: CollectionItem) {
      if (!confirm(`"${item.title}" silinsin? Bu əməliyyat geri qaytarılmır.`)) return

      try {
        await this.$api(`/collections/${this.config?.name}/${item.id}`, { method: 'DELETE' })
        this.items = this.items.filter((row) => row.id !== item.id)
        useToastStore().show('Silindi')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },
  },
})
</script>
