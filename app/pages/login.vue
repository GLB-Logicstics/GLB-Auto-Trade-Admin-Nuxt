<template>
  <form class="login" novalidate @submit.prevent="submit">
    <img src="/images/logo.png" alt="GLB Logistics" class="login__logo" />
    <h1>İdarə panelinə giriş</h1>
    <p class="login__text">Saytın məlumatlarını idarə etmək üçün daxil olun</p>

    <label class="field">
      <span class="field__label">E-poçt</span>
      <input v-model.trim="email" class="input" type="email" autocomplete="username" placeholder="admin@glb.az" />
    </label>

    <label class="field">
      <span class="field__label">Şifrə</span>
      <input v-model="password" class="input" type="password" autocomplete="current-password" placeholder="••••••••" />
    </label>

    <p v-if="error" class="error-text">{{ error }}</p>

    <button type="submit" class="btn btn--block" :disabled="loading">
      <i class="bi" :class="loading ? 'bi-hourglass-split' : 'bi-box-arrow-in-right'" />
      {{ loading ? 'Yoxlanılır...' : 'Daxil ol' }}
    </button>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { apiError } from '~/utils/format'
import type { Admin } from '~/types'

export default defineComponent({
  name: 'LoginPage',

  setup() {
    useHead({ title: 'Giriş — GLB Admin' })
  },

  data() {
    return { email: '', password: '', error: '', loading: false }
  },

  methods: {
    ...mapActions(useAuthStore, ['setSession']),

    async submit() {
      if (!this.email || !this.password) {
        this.error = 'E-poçt və şifrəni yazın'
        return
      }

      this.loading = true
      this.error = ''
      try {
        const result = await this.$api<{ token: string; admin: Admin }>('/login', {
          method: 'POST',
          body: { email: this.email, password: this.password },
        })
        this.setSession(result.token, result.admin)
        this.$router.push('/')
      } catch (error) {
        this.error = apiError(error)
      }
      this.loading = false
    },
  },
})
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
  padding: 36px 32px;
  border-radius: 20px;
  background: $surface;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);

  &__logo {
    height: 56px;
    margin: 0 auto 8px;
  }

  h1 {
    font-size: 20px;
    text-align: center;
  }

  &__text {
    margin-top: -8px;
    color: $muted;
    text-align: center;
  }

  .btn {
    height: 44px;
    margin-top: 8px;
  }
}
</style>
