<template>
  <div class="list-input">
    <div v-for="(item, index) in items" :key="index" class="list-input__row">
      <span class="list-input__number">{{ index + 1 }}</span>
      <textarea
        v-if="multiline"
        class="input input--sm list-input__text"
        rows="2"
        :value="item"
        :placeholder="placeholder"
        @input="update(index, ($event.target as HTMLTextAreaElement).value)"
      />
      <input
        v-else
        class="input input--sm"
        :value="item"
        :placeholder="placeholder"
        @input="update(index, ($event.target as HTMLInputElement).value)"
      />
      <div class="list-input__actions">
        <button type="button" class="btn btn--light btn--icon btn--sm" title="Yuxarı" :disabled="!index" @click="move(index, -1)">
          <i class="bi bi-arrow-up" />
        </button>
        <button type="button" class="btn btn--danger btn--icon btn--sm" title="Sil" @click="remove(index)">
          <i class="bi bi-trash" />
        </button>
      </div>
    </div>

    <button type="button" class="btn btn--light btn--sm" @click="add">
      <i class="bi bi-plus-lg" />
      {{ addLabel }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'ListInput',

  props: {
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
    addLabel: { type: String, default: 'Əlavə et' },
    placeholder: { type: String, default: '' },
    multiline: { type: Boolean, default: false },
  },

  emits: ['update:modelValue'],

  computed: {
    items(): string[] {
      return Array.isArray(this.modelValue) ? this.modelValue : []
    },
  },

  methods: {
    emitList(list: string[]) {
      this.$emit('update:modelValue', list)
    },

    update(index: number, value: string) {
      const list = [...this.items]
      list[index] = value
      this.emitList(list)
    },

    add() {
      this.emitList([...this.items, ''])
    },

    remove(index: number) {
      this.emitList(this.items.filter((_, position) => position !== index))
    },

    move(index: number, step: number) {
      const list = [...this.items]
      const [item] = list.splice(index, 1)
      list.splice(index + step, 0, item as string)
      this.emitList(list)
    },
  },
})
</script>

<style lang="scss" scoped>
.list-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;

  &__row {
    display: grid;
    grid-template-columns: 24px 1fr auto;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  &__number {
    font-size: 13px;
    font-weight: 600;
    color: $muted;
    text-align: right;
  }

  &__text {
    height: auto;
    min-height: 56px;
    padding-top: 8px;
    resize: vertical;
  }

  &__actions {
    display: flex;
    gap: 6px;
  }
}
</style>
