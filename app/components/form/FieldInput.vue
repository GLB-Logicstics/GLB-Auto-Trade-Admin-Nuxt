<template>
  <div class="field" :class="{ 'is-wide': field.wide || isLarge }">
    <label v-if="field.type !== 'checkbox'" class="field__label" :for="id">{{ field.label }}</label>

    <input
      v-if="field.type === 'text'"
      :id="id"
      class="input"
      :value="modelValue"
      @input="emitValue(($event.target as HTMLInputElement).value)"
    />

    <input
      v-else-if="field.type === 'number'"
      :id="id"
      class="input"
      type="number"
      step="any"
      :value="modelValue"
      @input="emitValue(Number(($event.target as HTMLInputElement).value))"
    />

    <textarea
      v-else-if="field.type === 'textarea'"
      :id="id"
      class="input input--area"
      :value="String(modelValue ?? '')"
      @input="emitValue(($event.target as HTMLTextAreaElement).value)"
    />

    <select
      v-else-if="field.type === 'select'"
      :id="id"
      class="input"
      :value="modelValue"
      @change="emitValue(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>

    <label v-else-if="field.type === 'checkbox'" class="switch field__switch">
      <input type="checkbox" :checked="Boolean(modelValue)" @change="emitValue(($event.target as HTMLInputElement).checked)" />
      <span class="switch__track" />
      {{ field.label }}
    </label>

    <ImageInput v-else-if="field.type === 'image'" :model-value="String(modelValue || '')" @update:model-value="emitValue" />

    <ImagesInput
      v-else-if="field.type === 'images'"
      :model-value="Array.isArray(modelValue) ? (modelValue as string[]) : []"
      @update:model-value="emitValue"
    />

    <ListInput
      v-else-if="field.type === 'lines'"
      :model-value="Array.isArray(modelValue) ? (modelValue as string[]) : []"
      :multiline="field.multiline"
      :add-label="field.addLabel || 'Əlavə et'"
      @update:model-value="emitValue"
    />

    <SectionsInput
      v-else-if="field.type === 'sections'"
      :model-value="Array.isArray(modelValue) ? (modelValue as any[]) : []"
      @update:model-value="emitValue"
    />

    <StepsInput
      v-else-if="field.type === 'steps'"
      :model-value="Array.isArray(modelValue) ? (modelValue as any[]) : []"
      @update:model-value="emitValue"
    />

    <p v-if="field.help" class="field__help">{{ field.help }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Field } from '~/types'

export default defineComponent({
  name: 'FieldInput',

  props: {
    field: { type: Object as PropType<Field>, required: true },
    modelValue: { type: null, default: '' },
  },

  emits: ['update:modelValue'],

  computed: {
    id(): string {
      return `field-${this.field.key.replace(/\./g, '-')}`
    },

    isLarge(): boolean {
      return ['images', 'lines', 'sections', 'steps'].includes(this.field.type)
    },
  },

  methods: {
    emitValue(value: unknown) {
      this.$emit('update:modelValue', value)
    },

  },
})
</script>

<style lang="scss" scoped>
.field__switch {
  margin-top: 26px;
}
</style>
