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
| İdarə paneli | `/` | Rəqəmlər, istifadəçilər, təsdiq gözləyən dilerlər, son müraciətlər |
| Müraciətlər | `/requests` | Status, məsul şəxs, qeyd, "mənə təyin olunanlar", WhatsApp |
| İstifadəçilər | `/users` | Müştəri və diler hesabı yaratmaq, şifrə vermək (WhatsApp ilə göndər), bloklama, müraciətlər |
| Avtomobil izləmə | `/collections/shipments` | VIN/lot üzrə daşınma mərhələləri, düymə və tarix seçimi ilə |
| Diler klikləri | `/clicks` | Hər avtomobilin WhatsApp/zəng klikləri |
| Kolleksiyalar | `/collections/:name` | Siyahı, axtarış, saytda göstər/gizlət, silmə, dilerin əlavə etdiyi avtomobillər |
| Redaktə | `/collections/:name/:id` (`new` — yeni) | Forma, şəkil, slug, sıra, şəhər seçimi, EN/RU tərcümə tabları |
| Hissə kateqoriyaları | `/collections/part_types` | Ehtiyat hissəsi növləri |
| Tariflər | `/tariffs` | Məzənnə, Copart rüsum cədvəlləri, əlavə xərclər, son dəyişiklik tarixi |
| Daşınma | `/shipping` | Meydançalar, qiymətlər, Excel-dən import |
| Bazar qiymətləri | `/market-prices` | turbo.az / myauto.ge-dən avtomatik, "İndi yenilə", tapılmayanlar |
| Sayt məlumatı | `/site` | Əlaqə, loqo, sosial şəbəkələr, tərcümələr |
| Menyular | `/menus` | Üst menyu (alt menyu ilə) və footer linkləri |
| Ölkə və şəhərlər | `/locations` | Filtrdə və formalarda görünən şəhərlər |
| Dillər | `/languages` | Dil əlavə et, söndür, sırala |
| Tərcümələr | `/translations` | Bütün interfeys mətnləri, axtarış, "tərcüməsi olmayanlar" |
| Adminlər | `/admins` | Komanda üzvləri, rollar, şifrə |
| Jurnal | `/audit` | Kim nəyi nə vaxt dəyişib |
| GLB Helper qiymətləri | `/settings` | Lot səhifəsindəki 6 aylıq qrafik, model və ay üzrə |

Menyu yalnız rolun icazəsi olan bölmələri göstərir. Menyular və Dillər yalnız developer üçündür.

Formalarda JSON yoxdur: siyahılar, səhifə bölmələri və daşınma mərhələləri düymələrlə əlavə olunur, silinir və sıralanır (`components/form/ListInput.vue`, `SectionsInput.vue`, `StepsInput.vue`).

Excel importu üçün `xlsx` (SheetJS) paketi `package.json`-dadır, `npm install` onu `cdn.sheetjs.com`-dan yükləyir.

GitHub Pages: `.github/workflows/deploy.yml`. Repo → Settings → Variables: `API_BASE` (məs. `https://glb-api.onrender.com/api`) və `SITE_URL`.

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
| `app/utils/sheet.ts`, `components/form/SheetImport.vue` | Excel/CSV oxuma, sütun yoxlaması, xətalı sətirlər |
| `app/plugins/03.me.client.ts` | Açılanda adminin rol və icazələrini yeniləyir |
