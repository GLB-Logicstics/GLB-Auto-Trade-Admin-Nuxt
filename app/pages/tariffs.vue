<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Tariflər və rüsumlar</h1>
        <p>
          Bütün kalkulyatorlar bu rəqəmlərlə hesablayır
          <span v-if="updatedAt"> · son dəyişiklik: {{ formatDate(updatedAt) }}</span>
        </p>
      </div>
      <div class="page-head__actions">
        <button type="button" class="btn" :disabled="saving || !tariffs" @click="save">
          <i class="bi" :class="saving ? 'bi-hourglass-split' : 'bi-check-lg'" />
          {{ saving ? 'Saxlanılır...' : 'Yadda saxla' }}
        </button>
      </div>
    </div>

    <div v-if="tariffs" class="tariffs">
      <section class="card">
        <div class="card__head"><h2>Məzənnə və sabit xərclər</h2></div>
        <div class="card__body form-grid">
          <label class="field">
            <span class="field__label">1 USD = ? AZN</span>
            <input v-model.number="tariffs.aznRate" class="input" type="number" step="any" />
          </label>
          <label class="field">
            <span class="field__label">1 GEL = ? USD</span>
            <input v-model.number="tariffs.gelToUsd" class="input" type="number" step="any" />
          </label>
          <label class="field">
            <span class="field__label">Poti → Bakı daşınma ($)</span>
            <input v-model.number="tariffs.potiBakuPrice" class="input" type="number" />
          </label>
          <label class="field">
            <span class="field__label">Gürcüstan sabit ödənişləri (GEL)</span>
            <input v-model.number="tariffs.geFixedFees" class="input" type="number" />
          </label>
          <label class="field">
            <span class="field__label">Koreya → Azərbaycan daşınma ($)</span>
            <input v-model.number="tariffs.koreaShipping.az" class="input" type="number" />
          </label>
          <label class="field">
            <span class="field__label">Koreya → Gürcüstan daşınma ($)</span>
            <input v-model.number="tariffs.koreaShipping.ge" class="input" type="number" />
          </label>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h2>Copart rüsumları</h2></div>
        <div class="card__body form-grid">
          <label class="field">
            <span class="field__label">Gate fee — standart sənəd ($)</span>
            <input v-model.number="tariffs.gateFee.clean" class="input" type="number" />
          </label>
          <label class="field">
            <span class="field__label">Gate fee — qeyri-standart ($)</span>
            <input v-model.number="tariffs.gateFee.nonClean" class="input" type="number" />
          </label>
          <label class="field">
            <span class="field__label">FedEx ($)</span>
            <input v-model.number="tariffs.fedexFee" class="input" type="number" />
          </label>
          <label class="field">
            <span class="field__label">Əlavə xidmət haqqı ($)</span>
            <input v-model.number="tariffs.serviceFee" class="input" type="number" />
          </label>
          <label class="field">
            <span class="field__label">Faizlə hesablama bu bid-dən ($)</span>
            <input v-model.number="tariffs.highBidFrom" class="input" type="number" />
          </label>
          <label class="field">
            <span class="field__label">Yüksək bid faizi — standart (0.0575 = 5.75%)</span>
            <input v-model.number="tariffs.copartHighBidPercent.clean" class="input" type="number" step="any" />
          </label>
          <label class="field">
            <span class="field__label">Yüksək bid faizi — qeyri-standart</span>
            <input v-model.number="tariffs.copartHighBidPercent.nonClean" class="input" type="number" step="any" />
          </label>
          <label class="field">
            <span class="field__label">Məlumat yoxdur — faiz</span>
            <input v-model.number="tariffs.unknownDocHighBid.percent" class="input" type="number" step="any" />
          </label>
          <label class="field">
            <span class="field__label">Məlumat yoxdur — sabit əlavə ($)</span>
            <input v-model.number="tariffs.unknownDocHighBid.fixed" class="input" type="number" />
          </label>
        </div>
      </section>

      <div class="tariffs__tables">
        <section v-for="table in tables" :key="table.key" class="card">
          <div class="card__head">
            <h2>{{ table.title }}</h2>
            <span class="badge">{{ tariffs[table.key].length }} sətir</span>
          </div>
          <FeeTable v-model="tariffs[table.key]" />
        </section>
      </div>

      <section class="card">
        <div class="card__head">
          <div>
            <h2>Əlavə xərclər</h2>
            <p class="muted">Kalkulyatorda müştərinin seçə biləcəyi əlavə xidmətlər (sığorta, sənəd və s.)</p>
          </div>
          <button type="button" class="btn btn--light btn--sm" @click="addExtra">
            <i class="bi bi-plus-lg" />
            Əlavə et
          </button>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>Qiymət ($)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in tariffs.extraCosts" :key="index">
                <td><input v-model="item.label" class="input input--sm" /></td>
                <td><input v-model.number="item.price" class="input input--sm" type="number" /></td>
                <td class="table__actions">
                  <button type="button" class="btn btn--danger btn--icon btn--sm" @click="tariffs.extraCosts.splice(index, 1)">
                    <i class="bi bi-trash" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div v-else class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToastStore } from '~/stores/toast'
import { apiError, formatDate } from '~/utils/format'
import type { Setting } from '~/types'

interface Tariffs {
  aznRate: number
  gelToUsd: number
  potiBakuPrice: number
  gateFee: { clean: number; nonClean: number }
  fedexFee: number
  serviceFee: number
  highBidFrom: number
  copartCleanFees: number[][]
  copartNonCleanFees: number[][]
  copartHighBidPercent: { clean: number; nonClean: number }
  liveBidFees: number[][]
  unknownDocFees: number[][]
  unknownDocHighBid: { percent: number; fixed: number }
  geFixedFees: number
  extraCosts: { id: string; label: string; price: number }[]
  koreaShipping: Record<string, number>
}

type TableKey = 'copartCleanFees' | 'copartNonCleanFees' | 'liveBidFees' | 'unknownDocFees'

export default defineComponent({
  name: 'TariffsPage',

  setup() {
    useHead({ title: 'Tariflər — GLB Admin' })
  },

  data() {
    return {
      tariffs: null as Tariffs | null,
      updatedAt: '',
      saving: false,
      tables: [
        { key: 'copartCleanFees', title: 'Secured fee — standart sənəd' },
        { key: 'copartNonCleanFees', title: 'Secured fee — qeyri-standart sənəd' },
        { key: 'liveBidFees', title: 'Live bid fee' },
        { key: 'unknownDocFees', title: 'Sənəd məlumatı yoxdur (autotrader)' },
      ] as { key: TableKey; title: string }[],
    }
  },

  async mounted() {
    const settings = await this.$api<Setting[]>('/settings')
    const setting = settings.find((item) => item.key === 'tariffs')
    this.tariffs = setting?.value as Tariffs
    this.updatedAt = setting?.updated_at || ''
  },

  methods: {
    formatDate,

    addExtra() {
      this.tariffs?.extraCosts.push({ id: `extra-${Date.now()}`, label: '', price: 0 })
    },

    async save() {
      if (!this.tariffs) return

      for (const key of ['copartCleanFees', 'copartNonCleanFees', 'liveBidFees', 'unknownDocFees'] as TableKey[]) {
        this.tariffs[key].sort((a, b) => (a[0] as number) - (b[0] as number))
      }

      this.saving = true
      try {
        const setting = await this.$api<Setting>('/settings/tariffs', { method: 'PUT', body: { value: this.tariffs } })
        this.updatedAt = setting.updated_at
        useToastStore().show('Tariflər yadda saxlandı')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.saving = false
    },
  },
})
</script>

<style lang="scss" scoped>
.tariffs {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__tables {
    display: grid;
    gap: 24px;
    align-items: start;

    @include up(lg) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
