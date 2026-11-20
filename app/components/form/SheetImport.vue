<template>
  <section class="card">
    <div class="card__head"><h2>{{ title }}</h2></div>
    <div class="card__body import">
      <p class="field__help">
        Excel (.xlsx) və ya CSV faylı. Birinci sətir başlıqdır, sütunlar:
        <b>{{ columns.map((column) => column.label).join(', ') }}</b>.
        <slot name="help" />
      </p>

      <div class="import__row">
        <slot />
        <label class="btn btn--light">
          <i class="bi bi-file-earmark-spreadsheet" />
          {{ fileName || 'Fayl seçin' }}
          <input type="file" accept=".xlsx,.xls,.csv" class="import__file" @change="read" />
        </label>
        <button type="button" class="btn" :disabled="!rows.length || busy" @click="$emit('import', rows)">
          <i class="bi bi-upload" />
          {{ rows.length }} sətri yüklə
        </button>
      </div>

      <p v-if="reading" class="muted">Fayl oxunur...</p>
      <ul v-if="errors.length" class="import__errors">
        <li v-for="error in errors.slice(0, 10)" :key="error">{{ error }}</li>
        <li v-if="errors.length > 10">... və daha {{ errors.length - 10 }} xəta</li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { readSheet, type SheetColumn } from '~/utils/sheet'

export default defineComponent({
  name: 'SheetImport',

  props: {
    title: { type: String, default: 'Excel-dən import' },
    columns: { type: Array as PropType<SheetColumn[]>, required: true },
    busy: { type: Boolean, default: false },
  },

  emits: ['import'],

  data() {
    return {
      rows: [] as Record<string, string | number>[],
      errors: [] as string[],
      fileName: '',
      reading: false,
    }
  },

  methods: {
    async read(event: Event) {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      input.value = ''
      if (!file) return

      this.fileName = file.name
      this.reading = true
      try {
        const result = await readSheet(file, this.columns)
        this.rows = result.rows
        this.errors = result.errors
      } catch {
        this.rows = []
        this.errors = ['Fayl oxunmadı. Excel və ya CSV faylı seçin']
      }
      this.reading = false
    },

    clear() {
      this.rows = []
      this.errors = []
      this.fileName = ''
    },
  },
})
</script>

<style lang="scss" scoped>
.import {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  &__file {
    display: none;
  }

  &__errors {
    padding: 10px 14px;
    font-size: 13px;
    color: $danger;
    background: $accent-soft;
    border-radius: $radius;
  }
}
</style>
