<template>
  <div class="sections-input">
    <div v-for="(section, index) in items" :key="index" class="sections-input__card">
      <div class="sections-input__head">
        <b>Bölmə {{ index + 1 }}</b>
        <div class="sections-input__actions">
          <button type="button" class="btn btn--light btn--icon btn--sm" title="Yuxarı" :disabled="!index" @click="move(index, -1)">
            <i class="bi bi-arrow-up" />
          </button>
          <button type="button" class="btn btn--danger btn--icon btn--sm" title="Bölməni sil" @click="remove(index)">
            <i class="bi bi-trash" />
          </button>
        </div>
      </div>

      <label class="field">
        <span class="field__label">Başlıq</span>
        <input class="input" :value="section.title" @input="update(index, { title: ($event.target as HTMLInputElement).value })" />
      </label>

      <div class="field">
        <span class="field__label">Abzaslar</span>
        <ListInput
          :model-value="section.text"
          multiline
          add-label="Abzas əlavə et"
          @update:model-value="update(index, { text: $event })"
        />
      </div>
    </div>

    <button type="button" class="btn btn--sm" @click="add">
      <i class="bi bi-plus-lg" />
      Bölmə əlavə et
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

interface Section {
  title: string
  text: string[]
}

export default defineComponent({
  name: 'SectionsInput',

  props: {
    modelValue: { type: Array as PropType<Section[]>, default: () => [] },
  },

  emits: ['update:modelValue'],

  computed: {
    items(): Section[] {
      return Array.isArray(this.modelValue) ? this.modelValue : []
    },
  },

  methods: {
    emitList(list: Section[]) {
      this.$emit('update:modelValue', list)
    },

    update(index: number, changes: Partial<Section>) {
      this.emitList(this.items.map((section, position) => (position === index ? { ...section, ...changes } : section)))
    },

    add() {
      this.emitList([...this.items, { title: '', text: [''] }])
    },

    remove(index: number) {
      if (!confirm('Bu bölmə silinsin?')) return
      this.emitList(this.items.filter((_, position) => position !== index))
    },

    move(index: number, step: number) {
      const list = [...this.items]
      const [item] = list.splice(index, 1)
      list.splice(index + step, 0, item as Section)
      this.emitList(list)
    },
  },
})
</script>

<style lang="scss" scoped>
.sections-input {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;

  &__card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    padding: 16px;
    background: $bg;
    border: 1px solid $border;
    border-radius: $radius;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__actions {
    display: flex;
    gap: 6px;
  }
}
</style>
