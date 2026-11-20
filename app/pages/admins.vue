<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Adminlər və rollar</h1>
        <p>Komanda üzvləri və onların icazələri</p>
      </div>
    </div>

    <div class="layout">
      <section class="card">
        <div v-if="loading" class="empty"><i class="bi bi-hourglass-split" />Yüklənir...</div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>Rol</th>
                <th>Aktiv</th>
                <th>Yeni şifrə</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>
                  <input v-model="item.name" class="input input--sm" />
                  <p class="muted">{{ item.email }}</p>
                </td>
                <td>
                  <select v-model="item.role" class="input input--sm" :disabled="item.id === me">
                    <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
                  </select>
                </td>
                <td>
                  <label class="switch">
                    <input v-model="item.is_active" type="checkbox" :disabled="item.id === me" />
                    <span class="switch__track" />
                  </label>
                </td>
                <td>
                  <input v-model="passwords[item.id]" class="input input--sm" type="password" placeholder="Dəyişmək üçün yazın" />
                </td>
                <td>
                  <div class="table__actions">
                    <button type="button" class="btn btn--sm" @click="save(item)"><i class="bi bi-check-lg" /></button>
                    <button
                      v-if="item.id !== me"
                      type="button"
                      class="btn btn--danger btn--icon btn--sm"
                      title="Sil"
                      @click="remove(item)"
                    >
                      <i class="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="aside">
        <section class="card">
          <div class="card__head"><h2>Yeni admin</h2></div>
          <form class="card__body form" @submit.prevent="create">
            <label class="field">
              <span class="field__label">Ad</span>
              <input v-model.trim="form.name" class="input" />
            </label>
            <label class="field">
              <span class="field__label">E-poçt</span>
              <input v-model.trim="form.email" class="input" type="email" />
            </label>
            <label class="field">
              <span class="field__label">Şifrə</span>
              <input v-model="form.password" class="input" type="password" />
            </label>
            <label class="field">
              <span class="field__label">Rol</span>
              <select v-model="form.role" class="input">
                <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
              </select>
            </label>
            <button type="submit" class="btn btn--block" :disabled="creating">
              <i class="bi bi-person-plus" />
              Əlavə et
            </button>
          </form>
        </section>

        <section class="card">
          <div class="card__head"><h2>Rolların icazələri</h2></div>
          <div class="card__body">
            <div v-for="role in roles" :key="role.value" class="role">
              <b>{{ role.label }}</b>
              <p class="muted">{{ role.text }}</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'
import { apiError } from '~/utils/format'
import type { StaffMember } from '~/types'

export default defineComponent({
  name: 'AdminsPage',

  setup() {
    useHead({ title: 'Adminlər — GLB Admin' })
  },

  data() {
    return {
      items: [] as StaffMember[],
      passwords: {} as Record<number, string>,
      loading: true,
      creating: false,
      form: { name: '', email: '', password: '', role: 'editor' },
      roles: [
        { value: 'admin', label: 'Admin', text: 'Hər şey: komanda, rollar, jurnal, tərcümələr, qiymətlər və kontent' },
        { value: 'manager', label: 'Menecer', text: 'Müraciətlər, istifadəçilər və dilerlər, kontent, qiymətlər' },
        { value: 'editor', label: 'Redaktor', text: 'Kontent, sayt ayarları, menyular, tərcümələr' },
      ],
    }
  },

  computed: {
    me(): number {
      return useAuthStore().admin?.id || 0
    },
  },

  mounted() {
    this.load()
  },

  methods: {
    async load() {
      this.loading = true
      this.items = await this.$api<StaffMember[]>('/admins')
      this.loading = false
    },

    async save(item: StaffMember) {
      try {
        const updated = await this.$api<StaffMember>(`/admins/${item.id}`, {
          method: 'PUT',
          body: { name: item.name, role: item.role, isActive: item.is_active, password: this.passwords[item.id] || '' },
        })
        Object.assign(item, updated)
        this.passwords[item.id] = ''
        useToastStore().show('Yadda saxlandı')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },

    async create() {
      this.creating = true
      try {
        const item = await this.$api<StaffMember>('/admins', { method: 'POST', body: this.form })
        this.items.push(item)
        this.form = { name: '', email: '', password: '', role: 'editor' }
        useToastStore().show('Admin əlavə olundu')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.creating = false
    },

    async remove(item: StaffMember) {
      if (!confirm(`${item.email} silinsin?`)) return

      try {
        await this.$api(`/admins/${item.id}`, { method: 'DELETE' })
        this.items = this.items.filter((row) => row.id !== item.id)
        useToastStore().show('Silindi')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.layout {
  display: grid;
  gap: 24px;
  align-items: start;

  @include up(xl) {
    grid-template-columns: 1fr 340px;
  }
}

.aside {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.role {
  padding: 10px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: 0;
  }
}

.table input,
.table select {
  min-width: 140px;
}
</style>
