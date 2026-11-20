<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Sayt məlumatı</h1>
        <p>Header, footer və əlaqə bölmələrində görünən məlumatlar</p>
      </div>
      <div class="page-head__actions">
        <button type="button" class="btn" :disabled="saving || !site" @click="save">
          <i class="bi" :class="saving ? 'bi-hourglass-split' : 'bi-check-lg'" />
          {{ saving ? 'Saxlanılır...' : 'Yadda saxla' }}
        </button>
      </div>
    </div>

    <div v-if="site" class="site">
      <section class="card">
        <div class="card__head"><h2>Şirkət</h2></div>
        <div class="card__body form-grid">
          <label class="field">
            <span class="field__label">Ad</span>
            <input v-model="site.name" class="input" />
          </label>
          <label class="field is-wide">
            <span class="field__label">Haqqında (footer)</span>
            <textarea v-model="site.about" class="input input--area" />
          </label>
          <div class="field">
            <span class="field__label">Loqo</span>
            <ImageInput v-model="site.logo" />
          </div>
          <div class="field">
            <span class="field__label">Tünd fon üçün loqo</span>
            <ImageInput v-model="site.logoDark" />
          </div>
          <div class="field is-wide">
            <label class="switch">
              <input v-model="site.registrationOpen" type="checkbox" />
              <span class="switch__track" />
              Saytda hər kəs özü qeydiyyatdan keçə bilsin
            </label>
            <p class="field__help">
              Söndürülübsə, müştəri və diler hesablarını yalnız "İstifadəçilər" bölməsində siz yaradırsınız. Dilerlər heç vaxt özü
              qeydiyyatdan keçmir.
            </p>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h2>Əlaqə</h2></div>
        <div class="card__body form-grid">
          <label class="field">
            <span class="field__label">Telefon (link üçün)</span>
            <input v-model.trim="site.contact.phone" class="input" placeholder="+994773084838" />
          </label>
          <label class="field">
            <span class="field__label">Telefon (görünən)</span>
            <input v-model="site.contact.phoneDisplay" class="input" placeholder="+994 (77) 308 48 38" />
          </label>
          <label class="field">
            <span class="field__label">WhatsApp linki</span>
            <input v-model.trim="site.contact.whatsapp" class="input" placeholder="https://wa.me/994773084838" />
          </label>
          <label class="field">
            <span class="field__label">E-poçt</span>
            <input v-model.trim="site.contact.email" class="input" type="email" />
          </label>
          <label class="field">
            <span class="field__label">Ünvan</span>
            <input v-model="site.contact.address" class="input" />
          </label>
          <label class="field">
            <span class="field__label">İş saatları</span>
            <input v-model="site.contact.workingHours" class="input" />
          </label>
        </div>
      </section>

      <section v-if="languages.length" class="card">
        <div class="card__head">
          <h2>Tərcümələr</h2>
          <div class="tabs">
            <button
              v-for="language in languages"
              :key="language.code"
              type="button"
              :class="{ 'is-active': lang === language.code }"
              @click="lang = language.code"
            >
              {{ language.name }}
            </button>
          </div>
        </div>
        <div class="card__body form-grid">
          <label class="field is-wide">
            <span class="field__label">Haqqında (footer)</span>
            <textarea
              class="input input--area"
              :value="getPath(site, `i18n.${lang}.about`)"
              :placeholder="site.about"
              @input="setPath(site, `i18n.${lang}.about`, value($event))"
            />
          </label>
          <label class="field">
            <span class="field__label">Ünvan</span>
            <input
              class="input"
              :value="getPath(site, `contact.i18n.${lang}.address`)"
              :placeholder="site.contact.address"
              @input="setPath(site, `contact.i18n.${lang}.address`, value($event))"
            />
          </label>
          <label class="field">
            <span class="field__label">İş saatları</span>
            <input
              class="input"
              :value="getPath(site, `contact.i18n.${lang}.workingHours`)"
              :placeholder="site.contact.workingHours"
              @input="setPath(site, `contact.i18n.${lang}.workingHours`, value($event))"
            />
          </label>
        </div>
      </section>

      <section class="card">
        <div class="card__head">
          <h2>Sosial şəbəkələr</h2>
          <button type="button" class="btn btn--light btn--sm" @click="addSocial">
            <i class="bi bi-plus-lg" />
            Əlavə et
          </button>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>İkon</th>
                <th>Link</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in site.socialLinks" :key="index">
                <td><input v-model="item.label" class="input input--sm" /></td>
                <td>
                  <div class="icon-cell">
                    <i class="bi" :class="item.icon" />
                    <input v-model.trim="item.icon" class="input input--sm" placeholder="bi-instagram" />
                  </div>
                </td>
                <td><input v-model.trim="item.href" class="input input--sm" /></td>
                <td class="table__actions">
                  <button type="button" class="btn btn--danger btn--icon btn--sm" @click="site.socialLinks.splice(index, 1)">
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
import { apiError } from '~/utils/format'
import { getPath, setPath } from '~/utils/path'
import type { Language, Setting } from '~/types'

interface SiteSettings {
  name: string
  logo: string
  logoDark: string
  about: string
  registrationOpen?: boolean
  contact: {
    phone: string
    phoneDisplay: string
    whatsapp: string
    email: string
    address: string
    workingHours: string
  }
  socialLinks: { name: string; label: string; icon: string; href: string }[]
}

export default defineComponent({
  name: 'SitePage',

  setup() {
    useHead({ title: 'Sayt məlumatı — GLB Admin' })
  },

  data() {
    return { site: null as SiteSettings | null, saving: false, languages: [] as Language[], lang: '' }
  },

  async mounted() {
    const settings = await this.$api<Setting[]>('/settings')
    this.site = settings.find((item) => item.key === 'site')?.value as SiteSettings
    const languages = await this.$api<Language[]>('/languages')
    this.languages = languages.filter((language) => !language.is_default)
    this.lang = this.languages[0]?.code || ''
  },

  methods: {
    getPath,
    setPath,

    value(event: Event): string {
      return (event.target as HTMLInputElement).value
    },

    addSocial() {
      this.site?.socialLinks.push({ name: `link-${Date.now()}`, label: '', icon: 'bi-link-45deg', href: '' })
    },

    async save() {
      if (!this.site) return

      this.saving = true
      try {
        await this.$api('/settings/site', { method: 'PUT', body: { value: this.site } })
        useToastStore().show('Sayt məlumatı yadda saxlandı')
      } catch (error) {
        useToastStore().show(apiError(error), 'error')
      }
      this.saving = false
    },
  },
})
</script>

<style lang="scss" scoped>
.site {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.icon-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  i {
    font-size: 18px;
    color: $primary-dark;
  }
}
</style>
