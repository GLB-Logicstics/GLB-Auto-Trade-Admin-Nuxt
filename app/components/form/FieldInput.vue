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

    <textarea
      v-else-if="field.type === 'lines'"
      :id="id"
      v-model="text"
      class="input input--area"
      @input="emitLines"
    />

    <template v-else-if="field.type === 'json'">
      <textarea :id="id" v-model="text" class="input input--area input--code" spellcheck="false" @input="emitJson" />
      <p v-if="jsonError" class="error-text">JSON səhvdir: {{ jsonError }}</p>
    </template>

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

  data() {
    return {
      text: '',
      jsonError: '',
    }
  },

  computed: {
    id(): string {
      return `field-${this.field.key.replace(/\./g, '-')}`
    },

    isLarge(): boolean {
      return ['images', 'lines', 'json'].includes(this.field.type)
    },
  },

  created() {
    if (this.field.type === 'lines') {
      this.text = Array.isArray(this.modelValue) ? this.modelValue.join('\n') : ''
    }

    if (this.field.type === 'json') {
      this.text = JSON.stringify(this.modelValue ?? null, null, 2)
    }
  },

  methods: {
    emitValue(value: unknown) {
      this.$emit('update:modelValue', value)
    },

    emitLines() {
      const lines = this.text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      this.emitValue(lines)
    },

    emitJson() {
      try {
        this.emitValue(JSON.parse(this.text))
        this.jsonError = ''
      } catch (error) {
        this.jsonError = (error as Error).message
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.field__switch {
  margin-top: 26px;
}
</style>
