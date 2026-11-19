<template>
  <div class="image-input">
    <div class="image-input__preview">
      <img v-if="modelValue" :src="imageUrl(modelValue, $config.public.siteUrl)" alt="" />
      <i v-else class="bi bi-image" />
    </div>

    <div class="image-input__controls">
      <input
        class="input"
        placeholder="Şəkil linki və ya yüklə"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <div class="image-input__buttons">
        <label class="btn btn--light btn--sm">
          <i class="bi" :class="uploading ? 'bi-hourglass-split' : 'bi-upload'" />
          {{ uploading ? 'Yüklənir...' : 'Yüklə' }}
          <input type="file" accept="image/*" hidden :disabled="uploading" @change="upload" />
        </label>
        <button v-if="modelValue" type="button" class="btn btn--danger btn--sm" @click="$emit('update:modelValue', '')">
          <i class="bi bi-trash" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToastStore } from '~/stores/toast'
import { apiError, imageUrl, readFileAsDataUrl } from '~/utils/format'

export default defineComponent({
  name: 'ImageInput',

  props: {
    modelValue: { type: String, default: '' },
  },

  emits: ['update:modelValue'],

  data() {
    return { uploading: false }
  },

  methods: {
    imageUrl,

    async upload(event: Event) {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return

      this.uploading = true
      try {
        const data = await readFileAsDataUrl(file)
        const result = await this.$api<{ url: string }>('/upload', { method: 'POST', body: { name: file.name, data } })
        this.$emit('update:modelValue', result.url)
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.uploading = false
      input.value = ''
    },
  },
})
</script>

<style lang="scss" scoped>
.image-input {
  display: flex;
  gap: 16px;

  &__preview {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 120px;
    height: 84px;
    overflow: hidden;
    border: 1px dashed $border;
    border-radius: $radius;
    background: $bg;
    color: $muted;
    font-size: 24px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__controls {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
  }

  &__buttons {
    display: flex;
    gap: 8px;
  }
}
</style>
