<template>
  <div>
    <div v-if="sidebarOpen" class="sidebar-backdrop" @click="closeSidebar" />

    <aside class="sidebar" :class="{ 'is-open': sidebarOpen }">
      <NuxtLink to="/" class="sidebar__logo" @click="closeSidebar">
        <img src="/images/logo-dark.png" alt="GLB Logistics" />
        <span>Admin</span>
      </NuxtLink>

      <nav class="sidebar__nav">
        <div v-for="group in groups" :key="group.title" class="sidebar__group">
          <p class="sidebar__title">{{ group.title }}</p>
          <NuxtLink
            v-for="link in group.links"
            :key="link.to"
            :to="link.to"
            class="sidebar__link"
            :class="{ 'is-active': isActive(link.to) }"
            @click="closeSidebar"
          >
            <i class="bi" :class="link.icon" />
            {{ link.label }}
          </NuxtLink>
        </div>
      </nav>

      <a :href="$config.public.siteUrl" target="_blank" class="sidebar__site">
        <i class="bi bi-box-arrow-up-right" />
        Sayta keç
      </a>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'pinia'
import { collections } from '~/config/collections'
import { useUiStore } from '~/stores/ui'

interface SidebarLink {
  label: string
  to: string
  icon: string
}

function collectionLinks(names: string[]): SidebarLink[] {
  return collections
    .filter((collection) => names.includes(collection.name))
    .map((collection) => ({ label: collection.label, to: `/collections/${collection.name}`, icon: collection.icon }))
}

export default defineComponent({
  name: 'AppSidebar',

  data() {
    return {
      groups: [
        {
          title: 'Əsas',
          links: [
            { label: 'İdarə paneli', to: '/', icon: 'bi-grid-1x2' },
            { label: 'Müraciətlər', to: '/requests', icon: 'bi-inbox' },
          ],
        },
        { title: 'Avtomobillər', links: collectionLinks(['lots', 'cars', 'korea_cars', 'parts', 'catalog']) },
        { title: 'Kontent', links: collectionLinks(['services', 'pages', 'news', 'hero_slides', 'brands']) },
        {
          title: 'Kalkulyator',
          links: [
            { label: 'Tariflər və rüsumlar', to: '/tariffs', icon: 'bi-calculator' },
            { label: 'Daşınma qiymətləri', to: '/shipping', icon: 'bi-truck' },
          ],
        },
        {
          title: 'Ayarlar',
          links: [
            { label: 'Sayt məlumatı', to: '/site', icon: 'bi-building' },
            { label: 'Digər ayarlar', to: '/settings', icon: 'bi-sliders' },
          ],
        },
      ],
    }
  },

  computed: {
    ...mapState(useUiStore, ['sidebarOpen']),
  },

  methods: {
    ...mapActions(useUiStore, ['closeSidebar']),

    isActive(to: string): boolean {
      if (to === '/') return this.$route.path === '/'
      return this.$route.path.startsWith(to)
    },
  },
})
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: $sidebar;
  background: $navy;
  color: rgba(#fff, 0.75);
  transform: translateX(-100%);
  transition: transform 0.25s;

  &.is-open {
    transform: translateX(0);
  }

  @include up(lg) {
    transform: none;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    height: $topbar;
    padding: 0 20px;
    border-bottom: 1px solid rgba(#fff, 0.08);

    img {
      height: 34px;
    }

    span {
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba($primary, 0.18);
      color: $primary;
      font-size: 12px;
      font-weight: 600;
    }
  }

  &__nav {
    flex: 1;
    overflow-y: auto;
    padding: 12px 12px 20px;
  }

  &__group {
    margin-top: 14px;
  }

  &__title {
    padding: 0 12px 6px;
    color: rgba(#fff, 0.4);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 12px;
    border-radius: $radius;
    color: inherit;
    transition: background 0.15s, color 0.15s;

    i {
      font-size: 16px;
    }

    &:hover {
      background: rgba(#fff, 0.06);
      color: #fff;
    }

    &.is-active {
      background: $primary;
      color: #fff;
      box-shadow: 0 6px 16px rgba($primary, 0.3);
    }
  }

  &__site {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 12px;
    padding: 10px 12px;
    border: 1px solid rgba(#fff, 0.12);
    border-radius: $radius;
    color: rgba(#fff, 0.75);

    &:hover {
      border-color: $primary;
      color: #fff;
    }
  }
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba($navy, 0.5);

  @include up(lg) {
    display: none;
  }
}
</style>
