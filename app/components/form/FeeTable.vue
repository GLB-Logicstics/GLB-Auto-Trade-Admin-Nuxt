<template>
  <div class="fee-table">
    <table class="table">
      <thead>
        <tr>
          <th>{{ fromLabel }}</th>
          <th>{{ valueLabel }}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in modelValue" :key="index">
          <td>
            <input class="input input--sm" type="number" :value="row[0]" @input="change(index, 0, $event)" />
          </td>
          <td>
            <input class="input input--sm" type="number" step="any" :value="row[1]" @input="change(index, 1, $event)" />
          </td>
          <td class="table__actions">
            <button type="button" class="btn btn--danger btn--icon btn--sm" title="Sil" @click="remove(index)">
              <i class="bi bi-trash" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <button type="button" class="btn btn--light btn--sm fee-table__add" @click="add">
      <i class="bi bi-plus-lg" />
      Sətir əlavə et
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'FeeTable',

  props: {
    modelValue: { type: Array as PropType<number[][]>, default: () => [] },
    fromLabel: { type: String, default: 'Bid-dən ($)' },
    valueLabel: { type: String, default: 'Rüsum ($)' },
  },

  emits: ['update:modelValue'],

  methods: {
    change(index: number, column: number, event: Event) {
      const rows = this.modelValue.map((row) => [...row])
      const row = rows[index] as number[]
      row[column] = Number((event.target as HTMLInputElement).value) || 0
      this.$emit('update:modelValue', rows)
    },

    add() {
      const last = this.modelValue[this.modelValue.length - 1]
      this.$emit('update:modelValue', [...this.modelValue, [last ? (last[0] as number) + 100 : 0, 0]])
    },

    remove(index: number) {
      this.$emit(
        'update:modelValue',
        this.modelValue.filter((_, i) => i !== index),
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.fee-table {
  max-height: 420px;
  overflow-y: auto;

  .table td,
  .table th {
    padding: 6px 10px;
  }

  &__add {
    margin: 10px;
  }
}
</style>
