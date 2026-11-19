<template>
  <div class="images-input">
    <div v-if="modelValue.length" class="images-input__grid">
      <div v-for="(image, index) in modelValue" :key="`${index}-${image}`" class="images-input__item">
        <img :src="imageUrl(image, $config.public.siteUrl)" alt="" />
        <span v-if="index === 0" class="images-input__main">Əsas</span>
        <div class="images-input__actions">
          <button type="button" title="Əvvələ" :disabled="index === 0" @click="move(index, -1)">
            <i class="bi bi-arrow-left" />
          </button>
          <button type="button" title="Sonra" :disabled="index === modelValue.length - 1" @click="move(index, 1)">
            <i class="bi bi-arrow-right" />
          </button>
          <button type="button" title="Sil" @click="remove(index)"><i class="bi bi-trash" /></button>
        </div>
      </div>
    </div>
    <p v-else class="muted">Hələ şəkil yoxdur</p>

    <div class="images-input__add">
      <input v-model.trim="url" class="input" placeholder="Şəkil linki" @keydown.enter.prevent="addUrl" />
      <button type="button" class="btn btn--light" :disabled="!url" @click="addUrl">
        <i class="bi bi-plus-lg" />
        Əlavə et
      </button>
      <label class="btn btn--light">
        <i class="bi" :class="uploading ? 'bi-hourglass-split' : 'bi-upload'" />
        {{ uploading ? 'Yüklənir...' : 'Yüklə' }}
        <input type="file" accept="image/*" multiple hidden :disabled="uploading" @change="upload" />
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useToastStore } from '~/stores/toast'
import { apiError, imageUrl, readFileAsDataUrl } from '~/utils/format'

export default defineComponent({
  name: 'ImagesInput',

  props: {
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
  },

  emits: ['update:modelValue'],

  data() {
    return { url: '', uploading: false }
  },

  methods: {
    imageUrl,

    update(images: string[]) {
      this.$emit('update:modelValue', images)
    },

    addUrl() {
      if (!this.url) return
      this.update([...this.modelValue, this.url])
      this.url = ''
    },

    remove(index: number) {
      this.update(this.modelValue.filter((_, i) => i !== index))
    },

    move(index: number, step: number) {
      const images = [...this.modelValue]
      const [image] = images.splice(index, 1)
      images.splice(index + step, 0, image as string)
      this.update(images)
    },

    async upload(event: Event) {
      const input = event.target as HTMLInputElement
      const files = [...(input.files || [])]
      if (!files.length) return

      this.uploading = true
      const urls: string[] = []
      try {
        for (const file of files) {
          const data = await readFileAsDataUrl(file)
          const result = await this.$api<{ url: string }>('/upload', { method: 'POST', body: { name: file.name, data } })
          urls.push(result.url)
        }
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.update([...this.modelValue, ...urls])
      this.uploading = false
      input.value = ''
    },
  },
})
</script>

<style lang="scss" scoped>
.images-input {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  &__item {
    position: relative;
    overflow: hidden;
    border: 1px solid $border;
    border-radius: $radius;
    background: $bg;

    img {
      width: 100%;
      height: 100px;
      object-fit: cover;
    }
  }

  &__main {
    position: absolute;
    top: 6px;
    left: 6px;
    padding: 1px 8px;
    border-radius: 6px;
    background: $primary;
    color: #fff;
    font-size: 11px;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    padding: 4px;

    button {
      width: 30px;
      height: 28px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: $muted;
      cursor: pointer;

      &:hover:not(:disabled) {
        background: $surface;
        color: $primary-dark;
      }

      &:disabled {
        opacity: 0.3;
        cursor: default;
      }

      &:last-child:hover {
        color: $danger;
      }
    }
  }

  &__add {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .input {
      flex: 1;
      min-width: 200px;
    }
  }
}
</style>
