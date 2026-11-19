<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Digər ayarlar</h1>
        <p>Qiymət qrafiki və avtomobil izləmə nümunəsi (JSON formatında)</p>
      </div>
    </div>

    <div v-if="loaded" class="settings">
      <section v-for="item in items" :key="item.key" class="card">
        <div class="card__head">
          <div>
            <h2>{{ item.title }}</h2>
            <p class="muted">{{ item.help }}</p>
          </div>
          <button type="button" class="btn btn--sm" :disabled="item.saving" @click="save(item)">
            <i class="bi bi-check-lg" />
            Yadda saxla
          </button>
        </div>
        <div class="card__body">
          <FieldInput :field="{ key: item.key, label: 'JSON', type: 'json' }" :model-value="item.value" @update:model-value="item.value = $event" />
        </div>
      </section>
    </div>

    <div v-else class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToastStore } from '~/stores/toast'
import { apiError } from '~/utils/format'
import type { Setting } from '~/types'

interface JsonSetting {
  key: string
  title: string
  help: string
  value: unknown
  saving: boolean
}

export default defineComponent({
  name: 'SettingsPage',

  setup() {
    useHead({ title: 'Digər ayarlar — GLB Admin' })
  },

  data() {
    return {
      loaded: false,
      items: [
        {
          key: 'price_history',
          title: 'GLB Helper qiymət qrafiki',
          help: 'Açar: "MARKA MODEL" və ya "MARKA", dəyər: [{ "label": "İyun", "price": 21400 }]',
          value: null,
          saving: false,
        },
        {
          key: 'tracking_sample',
          title: 'Avtomobil izləmə nümunəsi',
          help: '/tracking səhifəsində göstərilən nümunə: code, title, steps',
          value: null,
          saving: false,
        },
      ] as JsonSetting[],
    }
  },

  async mounted() {
    const settings = await this.$api<Setting[]>('/settings')
    for (const item of this.items) {
      item.value = settings.find((setting) => setting.key === item.key)?.value ?? {}
    }
    this.loaded = true
  },

  methods: {
    async save(item: JsonSetting) {
      item.saving = true
      try {
        await this.$api(`/settings/${item.key}`, { method: 'PUT', body: { value: item.value } })
        useToastStore().show(`${item.title} yadda saxlandı`)
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      item.saving = false
    },
  },
})
</script>

<style lang="scss" scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
