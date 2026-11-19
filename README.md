# GLB Auto Trade ( Admin Panel ) — Nuxt 4

Nuxt 4 (SPA), Options API, Pinia, SCSS. Backend: `GLB-Auto-Trade-Backend`.

```bash
npm install
cp .env.example .env     # NUXT_PUBLIC_API_BASE, NUXT_PUBLIC_SITE_URL
npm run dev              # http://localhost:3001
```

Giriş: backend `.env`-dəki `ADMIN_EMAIL` və `ADMIN_PASSWORD`.

## Bölmələr

| Səhifə | Ünvan | Nə edir |
|---|---|---|
| İdarə paneli | `/` | Rəqəmlər, son müraciətlər |
| Müraciətlər | `/requests` | Status, qeyd, WhatsApp, silmə |
| Kolleksiyalar | `/collections/:name` | Siyahı, axtarış, saytda göstər/gizlət, silmə |
| Redaktə | `/collections/:name/:id` (`new` — yeni) | Forma, şəkil yükləmə, slug, sıra |
| Tariflər | `/tariffs` | Məzənnə, Copart rüsum cədvəlləri, əlavə xərclər |
| Daşınma | `/shipping` | Copart / IAAI / Manheim meydançaları və qiymətləri |
| Sayt məlumatı | `/site` | Əlaqə, loqo, sosial şəbəkələr |
| Digər ayarlar | `/settings` | Qiymət qrafiki və izləmə nümunəsi (JSON) |

## Kod

| Fayl | Nə edir |
|---|---|
| `app/config/collections.ts` | Hər kolleksiyanın sütunları və forma sahələri — yeni sahə əlavə etmək üçün yalnız burada dəyiş |
| `app/config/options.ts` | Seçim siyahıları (auksion, yanacaq, status...) |
| `app/components/form/FieldInput.vue` | Sahə tipinə görə input: text, number, textarea, select, checkbox, image, images, lines, json |
| `app/components/form/ImageInput.vue`, `ImagesInput.vue` | Şəkil linki və ya fayl yükləmə |
| `app/components/form/FeeTable.vue` | Rüsum cədvəli redaktoru |
| `app/plugins/01.auth.ts` | Tokeni cookie-də saxlayır |
| `app/plugins/02.api.ts` | `this.$api(...)` — tokenlə backend-ə sorğu, 401-də çıxış |
| `app/middleware/auth.global.ts` | Giriş etməyəni `/login`-ə yönləndirir |
| `app/stores/` | `auth`, `toast` (bildirişlər), `ui` (mobil menyu) |
| `app/utils/path.ts` | `dealer.name` kimi iç-içə sahələri oxuyur və yazır |
