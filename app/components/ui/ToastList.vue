<template>
  <div class="toasts">
    <TransitionGroup name="toast">
      <div v-for="item in items" :key="item.id" class="toast" :class="`toast--${item.type}`" @click="remove(item.id)">
        <i class="bi" :class="item.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'" />
        {{ item.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'pinia'
import { useToastStore } from '~/stores/toast'

export default defineComponent({
  name: 'ToastList',

  computed: {
    ...mapState(useToastStore, ['items']),
  },

  methods: {
    ...mapActions(useToastStore, ['remove']),
  },
})
</script>

<style lang="scss" scoped>
.toasts {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 260px;
  padding: 12px 16px;
  border-radius: $radius;
  background: $navy;
  color: #fff;
  box-shadow: 0 10px 30px rgba($navy, 0.25);
  cursor: pointer;

  &--success i {
    color: #5dd47a;
  }

  &--error i {
    color: $accent;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
