<template>
  <div class="steps-input">
    <div v-for="(step, index) in items" :key="index" class="steps-input__row" :class="{ 'is-done': step.done }">
      <label class="switch" :title="step.done ? 'Tamamlanıb' : 'Gözləyir'">
        <input type="checkbox" :checked="step.done" @change="update(index, { done: ($event.target as HTMLInputElement).checked })" />
        <span class="switch__track" />
      </label>
      <input class="input input--sm" :value="step.title" placeholder="Mərhələ" @input="update(index, { title: value($event) })" />
      <input class="input input--sm" type="date" :value="toInput(step.date)" @input="update(index, { date: fromInput(value($event)) })" />
      <button type="button" class="btn btn--danger btn--icon btn--sm" title="Sil" @click="remove(index)">
        <i class="bi bi-trash" />
      </button>
    </div>

    <div class="steps-input__buttons">
      <button type="button" class="btn btn--light btn--sm" @click="add">
        <i class="bi bi-plus-lg" />
        Mərhələ əlavə et
      </button>
      <button v-if="!items.length" type="button" class="btn btn--sm" @click="emitList(defaults())">
        <i class="bi bi-list-check" />
        Standart mərhələləri doldur
      </button>
    </div>
    <p class="field__help">Keçilən mərhələnin düyməsini yandırın və tarixini seçin. Tarixi olmayan mərhələdə saytda "Gözlənilir" yazılır.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

interface Step {
  title: string
  date: string
  done: boolean
}

const DEFAULT_STEPS = [
  'Hərracda alındı',
  'Meydançadan götürüldü',
  'Konteynerə yükləndi',
  'Dəniz yolunda',
  'Poti limanı',
  'Bakıya çatdırıldı',
]

export default defineComponent({
  name: 'StepsInput',

  props: {
    modelValue: { type: Array as PropType<Step[]>, default: () => [] },
  },

  emits: ['update:modelValue'],

  computed: {
    items(): Step[] {
      return Array.isArray(this.modelValue) ? this.modelValue : []
    },
  },

  methods: {
    value(event: Event): string {
      return (event.target as HTMLInputElement).value
    },

    defaults(): Step[] {
      return DEFAULT_STEPS.map((title) => ({ title, date: 'Gözlənilir', done: false }))
    },

    toInput(date: string): string {
      const match = String(date || '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
      return match ? `${match[3]}-${match[2]}-${match[1]}` : ''
    },

    fromInput(value: string): string {
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      return match ? `${match[3]}.${match[2]}.${match[1]}` : 'Gözlənilir'
    },

    emitList(list: Step[]) {
      this.$emit('update:modelValue', list)
    },

    update(index: number, changes: Partial<Step>) {
      this.emitList(this.items.map((step, position) => (position === index ? { ...step, ...changes } : step)))
    },

    add() {
      this.emitList([...this.items, { title: '', date: 'Gözlənilir', done: false }])
    },

    remove(index: number) {
      this.emitList(this.items.filter((_, position) => position !== index))
    },
  },
})
</script>

<style lang="scss" scoped>
.steps-input {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__row {
    display: grid;
    grid-template-columns: auto 1fr 170px auto;
    gap: 10px;
    align-items: center;
    padding: 6px 10px;
    border-radius: $radius;

    &.is-done {
      background: $primary-soft;
    }
  }

  &__buttons {
    display: flex;
    gap: 8px;
  }
}
</style>
