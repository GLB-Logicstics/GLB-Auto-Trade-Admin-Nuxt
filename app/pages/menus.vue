<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Menyular</h1>
        <p>Saytın üst menyusu və footer linkləri. Mətnlərin tərcüməsi "Tərcümələr" bölməsindədir</p>
      </div>
      <div class="page-head__actions">
        <button type="button" class="btn" :disabled="saving || !loaded" @click="save">
          <i class="bi" :class="saving ? 'bi-hourglass-split' : 'bi-check-lg'" />
          Yadda saxla
        </button>
      </div>
    </div>

    <div v-if="loaded" class="menus">
      <section class="card">
        <div class="card__head">
          <h2>Üst menyu</h2>
          <button type="button" class="btn btn--light btn--sm" @click="menus.main.push({ label: '', to: '/' })">
            <i class="bi bi-plus-lg" /> Bənd
          </button>
        </div>
        <div class="card__body">
          <div v-for="(item, index) in menus.main" :key="index" class="item">
            <div class="row">
              <input v-model="item.label" class="input input--sm" placeholder="Ad" />
              <input v-model="item.to" class="input input--sm" placeholder="Link (alt menyu varsa boş)" />
              <div class="row__actions">
                <button type="button" class="btn btn--light btn--icon btn--sm" :disabled="!index" @click="move(menus.main, index, -1)">
                  <i class="bi bi-arrow-up" />
                </button>
                <button type="button" class="btn btn--light btn--icon btn--sm" title="Alt bənd" @click="addChild(item)">
                  <i class="bi bi-diagram-2" />
                </button>
                <button type="button" class="btn btn--danger btn--icon btn--sm" @click="menus.main.splice(index, 1)">
                  <i class="bi bi-trash" />
                </button>
              </div>
            </div>
            <div v-for="(child, childIndex) in item.children || []" :key="childIndex" class="row row--child">
              <input v-model="child.label" class="input input--sm" placeholder="Ad" />
              <input v-model="child.to" class="input input--sm" placeholder="Link" />
              <div class="row__actions">
                <button
                  type="button"
                  class="btn btn--light btn--icon btn--sm"
                  :disabled="!childIndex"
                  @click="move(item.children!, childIndex, -1)"
                >
                  <i class="bi bi-arrow-up" />
                </button>
                <button type="button" class="btn btn--danger btn--icon btn--sm" @click="removeChild(item, childIndex)">
                  <i class="bi bi-trash" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-for="list in lists" :key="list.key" class="card">
        <div class="card__head">
          <h2>{{ list.title }}</h2>
          <button type="button" class="btn btn--light btn--sm" @click="menus[list.key].push({ label: '', to: '/' })">
            <i class="bi bi-plus-lg" /> Link
          </button>
        </div>
        <div class="card__body">
          <div v-for="(link, index) in menus[list.key]" :key="index" class="row">
            <input v-model="link.label" class="input input--sm" placeholder="Ad" />
            <input v-model="link.to" class="input input--sm" placeholder="Link" />
            <div class="row__actions">
              <button type="button" class="btn btn--light btn--icon btn--sm" :disabled="!index" @click="move(menus[list.key], index, -1)">
                <i class="bi bi-arrow-up" />
              </button>
              <button type="button" class="btn btn--danger btn--icon btn--sm" @click="menus[list.key].splice(index, 1)">
                <i class="bi bi-trash" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToastStore } from '~/stores/toast'
import { apiError } from '~/utils/format'
import type { Setting } from '~/types'

interface MenuLink {
  label: string
  to: string
}

interface MenuItem {
  label: string
  to?: string
  children?: MenuLink[]
}

interface Menus {
  main: MenuItem[]
  footer: MenuLink[]
  info: MenuLink[]
}

export default defineComponent({
  name: 'MenusPage',

  setup() {
    useHead({ title: 'Menyular — GLB Admin' })
  },

  data() {
    return {
      menus: { main: [], footer: [], info: [] } as Menus,
      loaded: false,
      saving: false,
      lists: [
        { key: 'footer' as const, title: 'Footer — Faydalı linklər' },
        { key: 'info' as const, title: 'Footer — Məlumat' },
      ],
    }
  },

  async mounted() {
    const settings = await this.$api<Setting[]>('/settings')
    const value = settings.find((setting) => setting.key === 'menus')?.value as Partial<Menus> | undefined
    this.menus = { main: value?.main || [], footer: value?.footer || [], info: value?.info || [] }
    this.loaded = true
  },

  methods: {
    move<T>(list: T[], index: number, step: number) {
      const [item] = list.splice(index, 1)
      list.splice(index + step, 0, item as T)
    },

    addChild(item: MenuItem) {
      item.children = [...(item.children || []), { label: '', to: '/' }]
      item.to = ''
    },

    removeChild(item: MenuItem, index: number) {
      item.children!.splice(index, 1)
      if (!item.children!.length) delete item.children
    },

    clean(): Menus {
      const link = (item: MenuLink) => ({ label: item.label.trim(), to: item.to.trim() })
      return {
        main: this.menus.main
          .filter((item) => item.label.trim())
          .map((item) =>
            item.children && item.children.length
              ? { label: item.label.trim(), children: item.children.filter((child) => child.label.trim()).map(link) }
              : { label: item.label.trim(), to: (item.to || '/').trim() },
          ),
        footer: this.menus.footer.filter((item) => item.label.trim()).map(link),
        info: this.menus.info.filter((item) => item.label.trim()).map(link),
      }
    },

    async save() {
      this.saving = true
      try {
        this.menus = this.clean()
        await this.$api('/settings/menus', { method: 'PUT', body: { value: this.menus } })
        useToastStore().show('Menyular yadda saxlandı')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.saving = false
    },
  },
})
</script>

<style lang="scss" scoped>
.menus {
  display: grid;
  gap: 24px;
  align-items: start;

  @include up(xl) {
    grid-template-columns: 3fr 2fr;

    > :first-child {
      grid-row: span 2;
    }
  }
}

.item {
  padding: 10px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: 0;
  }
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 4px 0;

  &--child {
    padding-left: 28px;
  }

  &__actions {
    display: flex;
    gap: 6px;
  }
}
</style>
