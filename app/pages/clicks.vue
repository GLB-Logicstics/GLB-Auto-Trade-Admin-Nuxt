<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Diler klikləri</h1>
        <p>Satışdakı avtomobillərin səhifəsində WhatsApp və zəng düymələrinə kliklər</p>
      </div>
    </div>

    <section class="card">
      <div v-if="loading" class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>

      <div v-else-if="items.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Avtomobil</th>
              <th>Əlavə edən</th>
              <th>Son 30 gün</th>
              <th>Cəmi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <NuxtLink :to="`/collections/cars/${item.id}`">{{ item.title }}</NuxtLink>
              </td>
              <td class="muted">{{ item.owner_email || 'Admin' }}</td>
              <td><b>{{ item.clicks_month }}</b></td>
              <td>{{ item.clicks }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty"><i class="bi bi-whatsapp" />Hələ klik yoxdur</div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface ClickRow {
  id: number
  title: string
  owner_email: string | null
  clicks: number
  clicks_month: number
}

export default defineComponent({
  name: 'ClicksPage',

  setup() {
    useHead({ title: 'Diler klikləri — GLB Admin' })
  },

  data() {
    return { items: [] as ClickRow[], loading: true }
  },

  async mounted() {
    this.items = await this.$api<ClickRow[]>('/clicks')
    this.loading = false
  },
})
</script>
