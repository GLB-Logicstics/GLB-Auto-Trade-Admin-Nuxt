<template>
  <div>
    <div class="page-head">
      <div>
        <h1>GLB Helper qiymətləri</h1>
        <p>Lot səhifəsindəki "son 6 ayda orta satış qiyməti" qrafiki. Model adı lotun marka və modeli ilə eyni olmalıdır (məs. BMW X5)</p>
      </div>
      <div class="page-head__actions">
        <button type="button" class="btn" :disabled="saving || !loaded" @click="save">
          <i class="bi" :class="saving ? 'bi-hourglass-split' : 'bi-check-lg'" />
          Yadda saxla
        </button>
      </div>
    </div>

    <div v-if="loaded" class="models">
      <section v-for="(model, index) in models" :key="index" class="card">
        <div class="card__head">
          <input v-model="model.name" class="input model-name" placeholder="Marka və model, məs. BMW X5" />
          <button type="button" class="btn btn--danger btn--icon btn--sm" title="Modeli sil" @click="removeModel(index)">
            <i class="bi bi-trash" />
          </button>
        </div>
        <div class="card__body">
          <div v-for="(point, pointIndex) in model.points" :key="pointIndex" class="point">
            <input v-model="point.label" class="input input--sm" placeholder="Ay" />
            <div class="point__price">
              <span>$</span>
              <input v-model.number="point.price" class="input input--sm" type="number" min="0" />
            </div>
            <button type="button" class="btn btn--light btn--icon btn--sm" title="Sil" @click="model.points.splice(pointIndex, 1)">
              <i class="bi bi-x-lg" />
            </button>
          </div>
          <button type="button" class="btn btn--light btn--sm" @click="model.points.push({ label: '', price: 0 })">
            <i class="bi bi-plus-lg" /> Ay əlavə et
          </button>
        </div>
      </section>

      <button type="button" class="card add-model" @click="addModel">
        <i class="bi bi-plus-circle" />
        Model əlavə et
      </button>
    </div>

    <div v-else class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToastStore } from '~/stores/toast'
import { apiError } from '~/utils/format'
import type { Setting } from '~/types'

interface Point {
  label: string
  price: number
}

interface Model {
  name: string
  points: Point[]
}

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyun', 'İyul', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']

function lastMonths(): Point[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    return { label: MONTHS[date.getMonth()]!, price: 0 }
  })
}

export default defineComponent({
  name: 'SettingsPage',

  setup() {
    useHead({ title: 'GLB Helper — GLB Admin' })
  },

  data() {
    return {
      models: [] as Model[],
      loaded: false,
      saving: false,
    }
  },

  async mounted() {
    const settings = await this.$api<Setting[]>('/settings')
    const value = (settings.find((item) => item.key === 'price_history')?.value || {}) as Record<string, Point[]>
    this.models = Object.entries(value).map(([name, points]) => ({ name, points: points.map((point) => ({ ...point })) }))
    this.loaded = true
  },

  methods: {
    addModel() {
      this.models.push({ name: '', points: lastMonths() })
    },

    removeModel(index: number) {
      if (!confirm(`${this.models[index]!.name || 'Bu model'} silinsin?`)) return
      this.models.splice(index, 1)
    },

    async save() {
      const value: Record<string, Point[]> = {}
      for (const model of this.models) {
        const name = model.name.trim().toUpperCase()
        if (!name) continue
        value[name] = model.points
          .filter((point) => point.label.trim())
          .map((point) => ({ label: point.label.trim(), price: Number(point.price) || 0 }))
      }

      this.saving = true
      try {
        await this.$api('/settings/price_history', { method: 'PUT', body: { value } })
        useToastStore().show('Yadda saxlandı')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.saving = false
    },
  },
})
</script>

<style lang="scss" scoped>
.models {
  display: grid;
  gap: 24px;
  align-items: start;

  @include up(lg) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include up(xl) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.model-name {
  font-weight: 600;
}

.point {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;

  &__price {
    display: flex;
    gap: 6px;
    align-items: center;
    color: $muted;
  }
}

.add-model {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  font-weight: 600;
  color: $primary;
  border-style: dashed;

  i {
    font-size: 28px;
  }
}
</style>
