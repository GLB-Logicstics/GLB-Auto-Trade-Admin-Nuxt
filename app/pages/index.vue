<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Salam, {{ admin?.name }} 👋</h1>
        <p>Saytdakı bütün məlumatların qısa xülasəsi</p>
      </div>
      <div class="page-head__actions">
        <NuxtLink to="/collections/lots/new" class="btn">
          <i class="bi bi-plus-lg" />
          Yeni lot
        </NuxtLink>
      </div>
    </div>

    <div v-if="stats" class="dashboard">
      <div class="dashboard__stats">
        <StatCard
          to="/requests"
          icon="bi-inbox"
          tone="accent"
          label="Yeni müraciətlər"
          :value="stats.requests.new"
          :note="`cəmi ${stats.requests.total}`"
        />
        <StatCard
          to="/users"
          icon="bi-people"
          label="İstifadəçilər"
          :value="stats.users.total"
          :note="`${stats.users.dealers} diler`"
        />
        <StatCard
          v-if="stats.users.pending"
          to="/users?role=pending"
          icon="bi-shop"
          tone="accent"
          label="Təsdiq gözləyən dilerlər"
          :value="stats.users.pending"
        />
        <StatCard
          v-for="item in mainCounts"
          :key="item.name"
          :to="`/collections/${item.name}`"
          :icon="iconOf(item.name)"
          :label="item.label"
          :value="item.active"
          :note="item.total !== item.active ? `cəmi ${item.total}` : ''"
        />
        <StatCard
          to="/shipping"
          icon="bi-truck"
          tone="success"
          label="Daşınma meydançaları"
          :value="stats.shipping.total"
        />
      </div>

      <div class="dashboard__grid">
        <section class="card">
          <div class="card__head">
            <h2>Son müraciətlər</h2>
            <NuxtLink to="/requests" class="btn btn--light btn--sm">Hamısı</NuxtLink>
          </div>
          <div v-if="stats.latestRequests.length" class="table-wrap">
            <table class="table">
              <tbody>
                <tr v-for="item in stats.latestRequests" :key="item.id">
                  <td>
                    <b>{{ item.name }}</b>
                    <p class="muted">{{ item.subject }}</p>
                  </td>
                  <td><a :href="`tel:${item.phone}`">{{ item.phone }}</a></td>
                  <td><RequestStatus :status="item.status" /></td>
                  <td class="muted">{{ formatDate(item.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty"><i class="bi bi-inbox" />Hələ müraciət yoxdur</div>
        </section>

        <section class="card">
          <div class="card__head"><h2>Bütün bölmələr</h2></div>
          <ul class="sections">
            <li v-for="item in stats.counts" :key="item.name">
              <NuxtLink :to="`/collections/${item.name}`">
                <i class="bi" :class="iconOf(item.name)" />
                {{ item.label }}
              </NuxtLink>
              <span class="badge badge--primary">{{ item.active }} / {{ item.total }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div v-else class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { findCollection } from '~/config/collections'
import { useAuthStore } from '~/stores/auth'
import { formatDate } from '~/utils/format'
import type { Stats } from '~/types'

export default defineComponent({
  name: 'DashboardPage',

  setup() {
    useHead({ title: 'İdarə paneli — GLB Admin' })
  },

  data() {
    return { stats: null as Stats | null }
  },

  computed: {
    ...mapState(useAuthStore, ['admin']),

    mainCounts(): Stats['counts'] {
      const names = ['lots', 'cars', 'korea_cars']
      return this.stats ? this.stats.counts.filter((item) => names.includes(item.name)) : []
    },
  },

  async mounted() {
    this.stats = await this.$api<Stats>('/stats')
  },

  methods: {
    formatDate,

    iconOf(name: string): string {
      return findCollection(name)?.icon || 'bi-folder'
    },
  },
})
</script>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__stats {
    display: grid;
    gap: 16px;

    @include up(md) {
      grid-template-columns: repeat(2, 1fr);
    }

    @include up(xl) {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  &__grid {
    display: grid;
    gap: 24px;
    align-items: start;

    @include up(xl) {
      grid-template-columns: 2fr 1fr;
    }
  }
}

.sections {
  margin: 0;
  padding: 8px 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 20px;
  }

  a {
    display: flex;
    align-items: center;
    gap: 10px;
    color: $text;

    &:hover {
      color: $primary-dark;
    }

    i {
      color: $primary;
    }
  }
}
</style>
