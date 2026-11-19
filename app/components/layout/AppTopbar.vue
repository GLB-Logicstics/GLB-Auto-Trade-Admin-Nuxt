<template>
  <header class="topbar">
    <button type="button" class="topbar__menu" aria-label="Menyu" @click="toggleSidebar">
      <i class="bi bi-list" />
    </button>

    <div class="topbar__user">
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
import { useUiStore } from '~/stores/ui'

export default defineComponent({
  name: 'AppTopbar',

  computed: {
    ...mapState(useAuthStore, ['admin', 'initials']),
  },

  methods: {
    ...mapActions(useUiStore, ['toggleSidebar']),
    ...mapActions(useAuthStore, ['logout']),

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
