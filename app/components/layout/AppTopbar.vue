<template>
  <header class="topbar">
    <button type="button" class="topbar__menu" aria-label="Menyu" @click="toggleSidebar">
      <i class="bi bi-list" />
    </button>

    <div class="topbar__user">
      <button
        v-if="rebuildEnabled && can('content')"
        type="button"
        class="btn btn--light btn--sm"
        :disabled="rebuilding"
        title="GitHub Pages-dəki saytı yeni məlumatla yenidən yığır (2-3 dəqiqə)"
        @click="rebuild"
      >
        <i class="bi" :class="rebuilding ? 'bi-hourglass-split' : 'bi-arrow-repeat'" />
        Saytı yenilə
      </button>
      <div class="topbar__avatar">{{ initials }}</div>
      <div class="topbar__info">
        <b>{{ admin?.name }}</b>
        <span>{{ admin?.email }}</span>
      </div>
      <button type="button" class="btn btn--light btn--sm" @click="signOut">
        <i class="bi bi-box-arrow-right" />
        Çıxış
      </button>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'
import { useUiStore } from '~/stores/ui'
import { apiError } from '~/utils/format'

export default defineComponent({
  name: 'AppTopbar',

  data() {
    return { rebuildEnabled: false, rebuilding: false }
  },

  computed: {
    ...mapState(useAuthStore, ['admin', 'initials', 'can']),
  },

  async mounted() {
    try {
      const result = await this.$api<{ enabled: boolean }>('/rebuild')
      this.rebuildEnabled = result.enabled
    } catch {
      this.rebuildEnabled = false
    }
  },

  methods: {
    ...mapActions(useUiStore, ['toggleSidebar']),
    ...mapActions(useAuthStore, ['logout']),

    async rebuild() {
      this.rebuilding = true
      try {
        await this.$api('/rebuild', { method: 'POST' })
        useToastStore().show('Sayt yenilənir, 2-3 dəqiqəyə hazır olacaq')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.rebuilding = false
    },

    signOut() {
      this.logout()
      this.$router.push('/login')
    },
  },
})
</script>

<style lang="scss" scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: $topbar;
  padding: 0 16px;
  background: rgba($surface, 0.9);
  border-bottom: 1px solid $border;
  backdrop-filter: blur(8px);

  @include up(md) {
    padding: 0 32px;
  }

  &__menu {
    width: 40px;
    height: 40px;
    border: 1px solid $border;
    border-radius: $radius;
    background: $surface;
    font-size: 20px;
    cursor: pointer;

    @include up(lg) {
      visibility: hidden;
    }
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__avatar {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-dark;
    font-weight: 600;
  }

  &__info {
    display: none;
    flex-direction: column;
    line-height: 1.3;

    span {
      color: $muted;
      font-size: 12px;
    }

    @include up(md) {
      display: flex;
    }
  }
}
</style>
