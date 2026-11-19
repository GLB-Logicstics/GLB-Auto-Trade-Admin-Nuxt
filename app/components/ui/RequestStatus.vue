<template>
  <span class="badge" :class="`badge--${tone}`">{{ label }}</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { requestStatuses } from '~/config/options'

const tones: Record<string, string> = {
  new: 'danger',
  in_progress: 'warning',
  done: 'success',
  cancelled: 'muted',
}

export default defineComponent({
  name: 'RequestStatus',

  props: {
    status: { type: String, required: true },
  },

  computed: {
    label(): string {
      return requestStatuses.find((item) => item.value === this.status)?.label || this.status
    },

    tone(): string {
      return tones[this.status] || 'muted'
    },
  },
})
</script>
