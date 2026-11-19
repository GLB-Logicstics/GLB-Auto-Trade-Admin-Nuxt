<template>
  <NuxtLink :to="to" class="stat">
    <span class="stat__icon" :class="`stat__icon--${tone}`"><i class="bi" :class="icon" /></span>
    <div>
      <p class="stat__label">{{ label }}</p>
      <b class="stat__value">{{ value }}</b>
      <span v-if="note" class="stat__note">{{ note }}</span>
    </div>
  </NuxtLink>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StatCard',

  props: {
    to: { type: String, required: true },
    icon: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    note: { type: String, default: '' },
    tone: { type: String, default: 'primary' },
  },
})
</script>

<style lang="scss" scoped>
.stat {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid $border;
  border-radius: $radius-lg;
  background: $surface;
  color: $text;
  box-shadow: $shadow;
  transition: transform 0.15s, border-color 0.15s;

  &:hover {
    transform: translateY(-2px);
    border-color: $primary;
  }

  &__icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    font-size: 20px;

    &--primary {
      background: $primary-soft;
      color: $primary-dark;
    }

    &--accent {
      background: $accent-soft;
      color: $danger;
    }

    &--success {
      background: $success-soft;
      color: $success;
    }

    &--warning {
      background: $warning-soft;
      color: $warning;
    }
  }

  &__label {
    color: $muted;
    font-size: 13px;
  }

  &__value {
    font-family: $font-heading;
    font-size: 24px;
  }

  &__note {
    margin-left: 8px;
    color: $muted;
    font-size: 12px;
  }
}
</style>
