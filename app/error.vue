<template>
  <div class="error-page">
    <b>{{ error?.statusCode || 500 }}</b>
    <p>{{ error?.statusCode === 404 ? 'Səhifə tapılmadı' : 'Xəta baş verdi' }}</p>
    <button type="button" class="btn" @click="goHome">
      <i class="bi bi-house" />
      İdarə panelinə qayıt
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { NuxtError } from '#app'

export default defineComponent({
  name: 'ErrorPage',

  props: {
    error: { type: Object as PropType<NuxtError>, default: null },
  },

  methods: {
    goHome() {
      clearError({ redirect: '/' })
    },
  },
})
</script>

<style lang="scss" scoped>
.error-page {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 12px;
  min-height: 100vh;
  text-align: center;

  b {
    font-family: $font-heading;
    font-size: 72px;
    color: $primary;
  }

  p {
    color: $muted;
    font-size: 16px;
  }
}
</style>
