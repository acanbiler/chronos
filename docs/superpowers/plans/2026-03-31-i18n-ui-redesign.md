# i18n + UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full English/Turkish bilingual support via a client-side language dropdown, and redesign the UI with a warm stone palette, severity-coloured timeline dots, editorial year markers, pill-toggle category filters, and a searchable country tag-input.

**Architecture:** Translations are embedded at build time as a JSON object on `window.__I18N__`. An Alpine store (`$store.i18n`) holds the current language (persisted in `localStorage`). Static Astro components pre-render both EN and TR content; Alpine `x-show` toggles visibility — no DOM scraping, no runtime fetches. UI strings are looked up via `$store.i18n.t.key`. Category pill-toggles and country tag-input replace the old checkbox/select controls using the existing parent Alpine scope in `index.astro`.

**Tech Stack:** Astro 6 (static output), Tailwind CSS 4 (CSS-first, stone palette), Alpine.js 3.x (CDN), TypeScript strict

**Spec:** `docs/superpowers/specs/2026-03-31-i18n-and-ui-redesign.md`

**Verification commands:**
- Type check: `pnpm astro check`
- Build: `pnpm build`
- Dev: `pnpm dev`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/data/i18n/types.ts` | Create | `Translations` interface |
| `src/data/i18n/en.ts` | Create | All English UI strings |
| `src/data/i18n/tr.ts` | Create | All Turkish UI strings |
| `src/data/categories.ts` | Modify | Add `label_tr` to each entry |
| `src/data/countries.ts` | Modify | Add `name_tr` to each entry |
| `src/content.config.ts` | Modify | Add optional `translations` to Zod schema |
| `src/lib/filter-index.ts` | Modify | Include TR strings in `searchText` |
| `src/content/events/*.yaml` (×15) | Modify | Add `translations.tr` block |
| `src/styles/global.css` | Modify | Add `[x-cloak]` rule |
| `src/layouts/Base.astro` | Modify | i18n store + lang dropdown + stone palette |
| `src/components/CategoryBadge.astro` | Modify | i18n label via `x-text` + stone palette |
| `src/components/CountryFlag.astro` | Modify | i18n name via `x-text` + stone palette |
| `src/components/EventCard.astro` | Modify | EN+TR `x-show` toggle + UI polish + stone palette |
| `src/components/TimelineTrack.astro` | Modify | Editorial year markers + severity-coloured dots + stone palette |
| `src/components/FilterBar.astro` | Modify | Pill-toggle categories + tag-input countries + stone palette |
| `src/pages/index.astro` | Modify | i18n header strings + extra Alpine state for tag-input |
| `src/pages/event/[slug].astro` | Modify | Bilingual content blocks + stone palette |
| `src/pages/category/[slug].astro` | Modify | Stone palette + i18n strings |
| `src/pages/country/[slug].astro` | Modify | Stone palette + i18n strings |

---

## Task 1: Create i18n Types and Translation Files

**Files:**
- Create: `src/data/i18n/types.ts`
- Create: `src/data/i18n/en.ts`
- Create: `src/data/i18n/tr.ts`

- [ ] **Step 1: Create `src/data/i18n/types.ts`**

```typescript
export interface Translations {
  lang: string;
  nav_title: string;
  skip_to_content: string;
  filters: string;
  search_label: string;
  search_placeholder: string;
  categories: string;
  severity: string;
  severity_info: string;
  severity_warning: string;
  severity_severe: string;
  severity_critical: string;
  date_range: string;
  date_from: string;
  date_to: string;
  countries: string;
  country_search_placeholder: string;
  ongoing_only: string;
  reset_filters: string;
  events_count: string;        // "{n} events"
  back_to_timeline: string;
  sources: string;
  related_events: string;
  ongoing_label: string;
  footer_text: string;
  show_filters: string;
  hide_filters: string;
  all_events_count: string;    // "Historical and ongoing events — {n} total"
  body_english_only: string;   // fallback note when TR body is absent
}
```

- [ ] **Step 2: Create `src/data/i18n/en.ts`**

```typescript
import type { Translations } from './types';

export const en: Translations = {
  lang: 'English',
  nav_title: 'World Events Timeline',
  skip_to_content: 'Skip to content',
  filters: 'Filters',
  search_label: 'Search',
  search_placeholder: 'Search events…',
  categories: 'Categories',
  severity: 'Severity',
  severity_info: 'Info',
  severity_warning: 'Warning',
  severity_severe: 'Severe',
  severity_critical: 'Critical',
  date_range: 'Date Range',
  date_from: 'From',
  date_to: 'To',
  countries: 'Countries',
  country_search_placeholder: 'Type to filter countries…',
  ongoing_only: 'Ongoing events only',
  reset_filters: 'Reset Filters',
  events_count: '{n} events',
  back_to_timeline: '← Back to Timeline',
  sources: 'Sources',
  related_events: 'Related Events',
  ongoing_label: 'Ongoing',
  footer_text: 'World Events Timeline — historical data for educational purposes.',
  show_filters: 'Show Filters',
  hide_filters: 'Hide Filters',
  all_events_count: 'Historical and ongoing events — {n} total',
  body_english_only: 'Extended content available in English only.',
};
```

- [ ] **Step 3: Create `src/data/i18n/tr.ts`**

```typescript
import type { Translations } from './types';

export const tr: Translations = {
  lang: 'Türkçe',
  nav_title: 'Dünya Olayları Zaman Tüneli',
  skip_to_content: 'İçeriğe Geç',
  filters: 'Filtreler',
  search_label: 'Ara',
  search_placeholder: 'Olayları ara…',
  categories: 'Kategoriler',
  severity: 'Şiddet Düzeyi',
  severity_info: 'Bilgi',
  severity_warning: 'Uyarı',
  severity_severe: 'Ağır',
  severity_critical: 'Kritik',
  date_range: 'Tarih Aralığı',
  date_from: 'Başlangıç',
  date_to: 'Bitiş',
  countries: 'Ülkeler',
  country_search_placeholder: 'Ülke ara…',
  ongoing_only: 'Yalnızca devam eden olaylar',
  reset_filters: 'Filtreleri Sıfırla',
  events_count: '{n} olay',
  back_to_timeline: '← Zaman Tüneline Dön',
  sources: 'Kaynaklar',
  related_events: 'İlgili Olaylar',
  ongoing_label: 'Devam Ediyor',
  footer_text: 'Dünya Olayları Zaman Tüneli — Eğitim amaçlı tarihsel veriler.',
  show_filters: 'Filtreleri Göster',
  hide_filters: 'Filtreleri Gizle',
  all_events_count: 'Tarihsel ve devam eden olaylar — toplam {n}',
  body_english_only: 'Genişletilmiş içerik yalnızca İngilizce olarak mevcuttur.',
};
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm astro check`
Expected: no errors in new files.

- [ ] **Step 5: Commit**

```bash
git add src/data/i18n/
git commit -m "feat: add i18n types and EN/TR translation files"
```

---

## Task 2: Extend Categories and Countries with Turkish Labels

**Files:**
- Modify: `src/data/categories.ts`
- Modify: `src/data/countries.ts`

- [ ] **Step 1: Update `src/data/categories.ts`** — add `label_tr` to the `Category` interface and each entry:

```typescript
export interface Category {
  slug: string;
  label: string;
  label_tr: string;
  color: string;
}

export const categories: Category[] = [
  { slug: 'genocide',     label: 'Genocide',              label_tr: 'Soykırım',          color: '#7c1d1d' },
  { slug: 'war-conflict', label: 'War & Conflict',        label_tr: 'Savaş ve Çatışma',  color: '#7c3a1d' },
  { slug: 'human-rights', label: 'Human Rights',          label_tr: 'İnsan Hakları',      color: '#1e3a5f' },
  { slug: 'environment',  label: 'Environment & Climate', label_tr: 'Çevre ve İklim',     color: '#14532d' },
  { slug: 'economics',    label: 'Economics & Finance',   label_tr: 'Ekonomi ve Finans',  color: '#3b2f6b' },
  { slug: 'political',    label: 'Political',             label_tr: 'Siyasi',             color: '#4a3000' },
  { slug: 'science-tech', label: 'Science & Technology',  label_tr: 'Bilim ve Teknoloji', color: '#1a3a4a' },
  { slug: 'pandemic',     label: 'Pandemic & Health',     label_tr: 'Salgın ve Sağlık',  color: '#2d1a4a' },
];
```

- [ ] **Step 2: Update `src/data/countries.ts`** — add `name_tr` to the `Country` interface and each entry:

```typescript
export interface Country {
  code: string;
  name: string;
  name_tr: string;
  flag: string;
  region: string;
}

export const countries: Country[] = [
  { code: 'DE', name: 'Germany',                name_tr: 'Almanya',                    flag: '🇩🇪', region: 'Europe' },
  { code: 'PL', name: 'Poland',                 name_tr: 'Polonya',                    flag: '🇵🇱', region: 'Europe' },
  { code: 'JP', name: 'Japan',                  name_tr: 'Japonya',                    flag: '🇯🇵', region: 'East Asia' },
  { code: 'IN', name: 'India',                  name_tr: 'Hindistan',                  flag: '🇮🇳', region: 'South Asia' },
  { code: 'PK', name: 'Pakistan',               name_tr: 'Pakistan',                   flag: '🇵🇰', region: 'South Asia' },
  { code: 'KR', name: 'South Korea',            name_tr: 'Güney Kore',                 flag: '🇰🇷', region: 'East Asia' },
  { code: 'KP', name: 'North Korea',            name_tr: 'Kuzey Kore',                 flag: '🇰🇵', region: 'East Asia' },
  { code: 'CU', name: 'Cuba',                   name_tr: 'Küba',                       flag: '🇨🇺', region: 'Caribbean' },
  { code: 'US', name: 'United States',          name_tr: 'Amerika Birleşik Devletleri',flag: '🇺🇸', region: 'North America' },
  { code: 'CN', name: 'China',                  name_tr: 'Çin',                        flag: '🇨🇳', region: 'East Asia' },
  { code: 'RW', name: 'Rwanda',                 name_tr: 'Ruanda',                     flag: '🇷🇼', region: 'Sub-Saharan Africa' },
  { code: 'BA', name: 'Bosnia and Herzegovina', name_tr: 'Bosna Hersek',               flag: '🇧🇦', region: 'Europe' },
  { code: 'IQ', name: 'Iraq',                   name_tr: 'Irak',                       flag: '🇮🇶', region: 'Middle East' },
  { code: 'ID', name: 'Indonesia',              name_tr: 'Endonezya',                  flag: '🇮🇩', region: 'Southeast Asia' },
  { code: 'TH', name: 'Thailand',               name_tr: 'Tayland',                    flag: '🇹🇭', region: 'Southeast Asia' },
  { code: 'LK', name: 'Sri Lanka',              name_tr: 'Sri Lanka',                  flag: '🇱🇰', region: 'South Asia' },
  { code: 'EG', name: 'Egypt',                  name_tr: 'Mısır',                      flag: '🇪🇬', region: 'Middle East / North Africa' },
  { code: 'TN', name: 'Tunisia',                name_tr: 'Tunus',                      flag: '🇹🇳', region: 'Middle East / North Africa' },
  { code: 'SY', name: 'Syria',                  name_tr: 'Suriye',                     flag: '🇸🇾', region: 'Middle East' },
  { code: 'UA', name: 'Ukraine',                name_tr: 'Ukrayna',                    flag: '🇺🇦', region: 'Europe' },
  { code: 'RU', name: 'Russia',                 name_tr: 'Rusya',                      flag: '🇷🇺', region: 'Europe / Asia' },
];
```

- [ ] **Step 3: Verify TypeScript**

Run: `pnpm astro check`
Expected: no errors. (CategoryBadge and CountryFlag will need updating in a later task to use `label_tr` / `name_tr`, but the type additions alone won't break anything.)

- [ ] **Step 4: Commit**

```bash
git add src/data/categories.ts src/data/countries.ts
git commit -m "feat: add Turkish labels to categories and countries"
```

---

## Task 3: Extend Zod Schema and Filter Index for Translations

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/lib/filter-index.ts`

- [ ] **Step 1: Update `src/content.config.ts`** — add optional `translations` field:

```typescript
import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const eventDate = z.string().regex(
  /^(\d{4}|\d{4}-\d{2}|\d{4}-\d{2}-\d{2})$/,
  'Use YYYY, YYYY-MM, or YYYY-MM-DD'
);

const translationBlock = z.object({
  title: z.string(),
  summary: z.string(),
  body: z.string().optional(),
}).optional();

const events = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: eventDate,
    date_end: eventDate.optional(),
    date_display: z.string().optional(),
    approximate: z.boolean().default(false),
    summary: z.string(),
    body: z.string().optional(),
    categories: z.array(z.string()),
    countries: z.array(z.string()),
    region: z.string().optional(),
    tags: z.array(z.string()).default([]),
    severity: z.enum(['info', 'warning', 'severe', 'critical']).default('info'),
    ongoing: z.boolean().default(false),
    sources: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
    })).default([]),
    image: z.object({
      src: z.string(),
      alt: z.string(),
      credit: z.string().optional(),
    }).optional(),
    translations: z.object({
      tr: translationBlock,
    }).optional(),
  }),
});

export const collections = { events };
```

- [ ] **Step 2: Update `src/lib/filter-index.ts`** — add `title_tr`/`summary_tr` to searchText:

```typescript
import { extractEventYear } from './dates';

export type EventIndexRecord = {
  slug: string;
  title: string;
  summary: string;
  searchText: string;
  categories: string[];
  countries: string[];
  severity: 'info' | 'warning' | 'severe' | 'critical';
  yearFrom: number;
  yearTo: number;
  ongoing: boolean;
};

export function buildEventIndex(events: any[]): EventIndexRecord[] {
  return events.map(({ id, data: e }) => {
    const yearFrom = extractEventYear(e.date);
    const yearTo   = e.date_end ? extractEventYear(e.date_end) : yearFrom;
    const searchText = [
      e.title,
      e.summary,
      ...(e.tags ?? []),
      e.region ?? '',
      e.translations?.tr?.title ?? '',
      e.translations?.tr?.summary ?? '',
    ].join(' ').toLowerCase();
    return {
      slug: id,
      title: e.title,
      summary: e.summary,
      searchText,
      categories: e.categories,
      countries: e.countries,
      severity: e.severity,
      yearFrom,
      yearTo,
      ongoing: e.ongoing,
    };
  });
}
```

- [ ] **Step 3: Verify TypeScript and build**

Run: `pnpm astro check && pnpm build`
Expected: clean build. YAMLs without `translations` are fine — the field is optional.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/lib/filter-index.ts
git commit -m "feat: extend schema and filter index for translations"
```

---

## Task 4: Add Turkish Translations to All 15 Event YAMLs

**Files:** All files in `src/content/events/`

Add a `translations:` block at the end of each YAML file. Paste exactly the blocks below.

- [ ] **Step 1: `src/content/events/1941-holocaust.yaml`** — append:

```yaml
translations:
  tr:
    title: "Holokost"
    summary: >
      Holokost, Nazi rejimi ve iş birlikçileri tarafından devlet destekli ve sistematik
      biçimde uygulanan altı milyon Yahudi'nin zulüm ve katledilmesidir. Ocak 1933'te
      Almanya'da iktidara gelen Naziler, Almanların "ırk üstünlüğüne" sahip olduğuna ve
      Yahudilerin "aşağı" bir ırk olduğuna inanıyordu.
    body: |
      Holokost, 1930'larda Almanya'daki ayrımcı yasalarla başladı ve Avrupa Yahudilerinin
      tamamı işgal altındaki Polonya'da bulunan altı imha kampına — Auschwitz-Birkenau,
      Belzec, Chelmno, Majdanek, Sobibor ve Treblinka — toplu sürgünleriyle tırmandı.

      Yalnızca Auschwitz-Birkenau'da yaklaşık 1,1 milyon insan katledildi. Yahudi kurbanların
      yanı sıra Naziler; Romanları, engellileri, Sovyet savaş esirlerini, Polonyalı sivilleri,
      eşcinselleri, Yehova Şahitlerini ve siyasi muhalefeti de sistematik biçimde öldürdü.

      Nürnberg davaları (1945–1946), hayatta kalan Nazi liderlerini savaş suçları ve insanlığa
      karşı suçlardan yargılayarak bireylerin uluslararası hukuk kapsamında hesap
      verebileceğini emsal oluşturacak biçimde belirledi. Davalar, 1948 tarihli BM Soykırım
      Sözleşmesi'nin hazırlanmasına da katkıda bulundu.

      "Soykırım" terimi, Holokost'a tepki olarak Polonya asıllı Yahudi hukukçu Raphael Lemkin
      tarafından icat edildi ve 1948'de uluslararası hukuka resmen girdi.
```

- [ ] **Step 2: `src/content/events/1945-hiroshima.yaml`** — append:

```yaml
translations:
  tr:
    title: "Hiroşima ve Nagazaki'nin Atom Bombası ile Bombalanması"
    summary: >
      6 Ağustos 1945'te Amerika Birleşik Devletleri, savaşta kullanılan ilk atom bombasını
      Japon şehri Hiroşima'ya düşürerek tahminen 70.000–80.000 kişiyi anında öldürdü; sonraki
      aylarda radyasyon maruziyetinden binlerce kişi daha hayatını kaybetti. Üç gün sonra
      Nagazaki'ye ikinci bir bomba atıldı.
    body: |
      "Little Boy" (Küçük Çocuk) lakaplı bomba, B-29 Süperkalesi *Enola Gay*'den atılan
      uranyum tabancalı bir cihazdı. Patlama ve ardından gelen yangın fırtınası Hiroşima'nın
      binalarının yaklaşık %69'unu tahrip etti. 1945 yılı sonuna kadar bombalama kaynaklı
      toplam ölü sayısının 90.000–166.000 olduğu tahmin edildi.

      Üç gün sonra, 9 Ağustos'ta Nagazaki üzerine atılan "Fat Man" (Şişman Adam) lakaplı
      plütonyum bombasında yaklaşık 40.000–80.000 kişi hayatını kaybetti. Japonya 15 Ağustos
      1945'te teslim olacağını duyurarak İkinci Dünya Savaşı'nı resmen sona erdirdi.

      Bombalamalara, nükleer caydırıcılık, silah kontrolü ve sivil nüfusun hedef alınmasının
      etiği hakkında küresel bir tartışma eşlik etti. Hibakuşa (atom bombası hayatta
      kalanları), seksen yıldır uluslararası silahsızlanma hareketinin merkezinde yer almaktadır.
```

- [ ] **Step 3: `src/content/events/1947-partition-of-india.yaml`** — append:

```yaml
translations:
  tr:
    title: "Hindistan'ın Bölünmesi"
    summary: >
      Ağustos 1947'de İngiliz egemenliğinin sona ermesiyle birlikte Hindistan alt kıtasında
      eş zamanlı olarak iki bağımsız devlet kuruldu: Hindistan ve Pakistan. Bu süreç,
      200.000 ile 2 milyon arasında insanın hayatını kaybettiği ve 10–20 milyon kişinin
      yerinden edildiği insanlık tarihinin en büyük ve kanlı kitlesel göçlerinden birini
      tetikledi.
    body: |
      Bölünme, Britanya Hindistan İmparatorluğu'nun dağılmasının doğrudan sonucuydu. Hindistan
      ile Pakistan arasındaki sınır olan Radcliffe Hattı, Pencap ve Bengal'i iki yeni devlet
      arasında bölerek yerel istişare yapılmaksızın Sir Cyril Radcliffe tarafından yalnızca
      beş haftada çizildi.

      Hindular, Müslümanlar ve Sikhler kendilerini yeni sınırların "yanlış" tarafında
      bulunca toplumlar arası şiddet büyük ölçekte patlak verdi. Yüzlerce mil uzunluğundaki
      mülteci kafileleri her iki yönde hareket etti. Kadınlar ve kız çocukları kitlesel
      biçimde kaçırıldı ve saldırıya uğradı; köylerin tamamı katledildi.

      14–17 milyona kadar kişinin yerinden edilmesi, kayıtlı tarihin en büyük kitlesel göçü
      olma özelliğini korumaktadır. Bölünmenin yarattığı travma; üç sonraki savaşı ve o
      günden bu yana bir çatışma noktası olmayı sürdüren çözümsüz Keşmir meselesini de
      kapsayan Hindistan–Pakistan ilişkilerini şekillendirmeye devam etmektedir.
```

- [ ] **Step 4: `src/content/events/1950-korean-war.yaml`** — append:

```yaml
translations:
  tr:
    title: "Kore Savaşı"
    summary: >
      Kore Savaşı, Sovyetler Birliği ve Çin destekli Kuzey Kore kuvvetlerinin 25 Haziran
      1950'de Güney Kore'yi işgal etmesiyle başladı. ABD liderliğindeki BM koalisyonu işgali
      püskürtse de üç yıllık çatışma, yarımadayı bugün hâlâ yürürlükte olan bir ateşkes —
      barış antlaşması değil — ile 38. paralel boyunca bölünmüş halde bıraktı.
    body: |
      İkinci Dünya Savaşı'nda Japonya'nın yenik düşmesinin ardından Kore, 38. paralel
      boyunca Sovyet ve Amerikan işgal bölgelerine ayrıldı; bu bölgeler zamanla kuzeyde
      komünist Kore Demokratik Halk Cumhuriyeti'ne ve güneyde Kore Cumhuriyeti'ne dönüştü.
      Kuzey Kore'nin 25 Haziran 1950'de sınırı Sovyet zırhlılarıyla geçmesiyle gerilim
      tam ölçekli savaşa dönüştü.

      BM Güvenlik Konseyi 83 sayılı kararla askeri müdahaleye yetki verdi (SSCB o sırada
      Konseyi boykot ediyordu). General Douglas MacArthur komutasındaki BM kuvvetleri,
      Eylül 1950'de cesur bir amfibi çıkarma harekâtıyla Inchon'u geri aldı ve hızla Çin
      sınırına doğru ilerledi. Çin, Ekim 1950'de yaklaşık 300.000 askerle savaşa girerek
      BM'yi geri çekilmeye zorladı.

      Savaş, 1951–1953 yıllarının büyük bölümünde özgün 38. paralel yakınında kanlı bir
      çıkmaza dönüştü. Ateşkes 27 Temmuz 1953'te imzalanarak Askerden Arındırılmış Bölge
      (DMZ) oluşturuldu. Yaklaşık 36.000 Amerikalı, 137.000 Güney Koreli ve tahminen
      1,5 milyon Çinli ile Kuzey Koreli asker hayatını kaybetti; yaklaşık iki milyon
      Koreli sivil de bu kayıplar arasındaydı.

      Hiçbir zaman resmi bir barış antlaşması imzalanmadı. Kuzey Kore dünyanın en izole
      ülkelerinden biri olmaya devam etmekte; 1953 ateşkesi hâlâ çatışmayı sona erdiren
      tek yasal belge olma özelliğini korumaktadır.
```

- [ ] **Step 5: `src/content/events/1962-cuban-missile-crisis.yaml`** — append:

```yaml
translations:
  tr:
    title: "Küba Füze Krizi"
    summary: >
      Ekim 1962'de ABD keşif uçakları Küba'ya yerleştirilen Sovyet balistik füzelerini
      tespit ettikten sonra, Amerika Birleşik Devletleri ile Sovyetler Birliği tarihin
      hiçbir döneminde olmadığı kadar nükleer savaşa yaklaştı. Kriz, doğrudan müzakereler
      ve karşılıklı tavizlerle çözüme kavuşturuldu.
    body: |
      Kriz, U-2 casus uçağının fotoğraflarının Küba'da inşa halindeki Sovyet orta ve orta
      menzilli balistik füze üslerini ortaya koymasıyla başladı. Başkan Kennedy; deniz
      ablukasından hava saldırılarına ya da işgale uzanan seçenekleri değerlendirmek üzere
      acil bir danışma grubu (ExComm) topladı.

      Kennedy 22 Ekim'de Küba'ya deniz "karantinası" ilan ederek Sovyetlerin füzeleri
      söküp geri götürmesini talep etti. Ek askeri teçhizat taşıyan Sovyet gemileri deniz
      kordonuna yaklaşmadan önce geri döndü.

      Çözüm, arka kanal diplomasiyle sağlandı: SSCB, ABD'nin Küba'yı işgal etmeyeceğine
      dair güvencesi ve Türkiye'deki ABD Jupiter füzelerinin gizlice kaldırılması
      karşılığında füzeleri söküp götürmeyi kabul etti.

      Kriz, silah kontrolü diplomasisini hızlandırdı. Beyaz Saray ile Kremlin arasındaki
      "kırmızı hat" 1963'te kuruldu; aynı yıl Kısmi Nükleer Deneme Yasağı Antlaşması
      imzalandı. Kriz, nükleer caydırıcılık, kriz yönetimi ve diplomatik gerilim azaltma
      konularında temel bir vaka çalışması olmaya devam etmektedir.
```

- [ ] **Step 6: `src/content/events/1966-cultural-revolution.yaml`** — append:

```yaml
translations:
  tr:
    title: "Çin Kültür Devrimi"
    summary: >
      Mao Zedong tarafından Mayıs 1966'da başlatılan Kültür Devrimi, Çin toplumundaki
      "burjuva" unsurları tasfiye etmeyi amaçlayan on yıllık şiddetli bir siyasi ve
      toplumsal çalkantı dönemiydi. Kızıl Muhafızlar kültürel eserleri yıktı, aydınları
      zulme uğrattı ve "karşı devrimcilere" saldırdı; yüz binlerden iki milyona kadar
      kişinin hayatını kaybetmesine yol açtı.
    body: |
      Kültür Devrimi, Mao Zedong'un yıkıcı Büyük İleri Atılım'ın ardından otoritesini
      yeniden pekiştirme çabasından doğdu. Mao, öğretmenlere, yetkililere ve yeterince
      devrimci olmadığı düşünülen herkese saldıran genç öğrencileri — Kızıl Muhafızlar'ı —
      harekete geçirdi. Okullar ve üniversiteler kapatıldı, aydınlar kırsal "yeniden
      eğitim" kamplarına gönderildi, dini mekânlar ve tarihi anıtlar tahrip edildi.

      Rakip Kızıl Muhafız grupları arasındaki hizip şiddeti binlerce kişiyi öldürdü.
      Halk Kurtuluş Ordusu düzeni yeniden sağlamak için sonunda müdahale etmek zorunda
      kaldı. En radikal evre (1966–1969), Mao'nun Eylül 1976'daki ölümüne kadar süren daha
      kontrollü ancak yine de baskıcı bir döneme bıraktı. Mao'nun eşi Jiang Qing liderliğindeki
      Dörtlü Çete, birkaç hafta sonra tutuklandı.

      Çin Komünist Partisi, Kültür Devrimi'ni 1981'de "Parti ve halk için ağır bir gerileme
      ve kayıp" olarak nitelendirdi; Mao'nun genel mirasını korurken birincil sorumluluğu
      ona yükledi. Tarihçiler, 1–2 milyon doğrudan ölümü tahmin etmekte; onlarca milyon
      kişinin ise zorla çalışmaya, hapse atılmaya ve zulme maruz kaldığını belirtmektedir.
```

- [ ] **Step 7: `src/content/events/1994-rwanda-genocide.yaml`** — append:

```yaml
translations:
  tr:
    title: "Ruanda Soykırımı"
    summary: >
      Yaklaşık 100 günde, Hutu aşırıcı milislerin sistematik bir kampanyasıyla 500.000 ile
      800.000 arasında Tutsi ve ılımlı Hutu katledildi. Soykırım, uluslararası toplumun
      büyük ölçüde seyirci kalmasıyla birlikte yaşandı.
    body: |
      Soykırım, 6 Nisan 1994'te Cumhurbaşkanı Juvénal Habyarimana'nın uçağının Kigali
      üzerinde düşürülmesiyle başladı. Saatler içinde Interahamwe milisi ve Ruanda Silahlı
      Kuvvetleri unsurları Tutsi sivilleri sistematik biçimde öldürmeye başladı; ülke
      genelinde barikatlar kuruldu ve radyo yayınları "inyenzi" (hamamböcekleri — Tutsi için
      kullanılan insanlık dışı bir terim) lerinin öldürülmesini körükledi.

      Ruanda'daki BM Barış Gücü (UNAMIR), Güvenlik Konseyi tarafından sivilleri korumak
      amacıyla güç kullanmaktan men edildi. On Belçikalı barış görevlisinin öldürülmesinin
      ardından Belçika kuvvetleri çekildi. ABD ve diğer Batılı hükümetler, 1948 Soykırım
      Sözleşmesi kapsamındaki yükümlülüklerden kaçınmak amacıyla "soykırım" sözcüğünü
      bilinçli olarak kullanmaktan kaçındı.

      Soykırım, ancak ağırlıklı olarak Tutsilerden oluşan silahlı grup olan Ruanda Vatansever
      Cephesi (RVF) hükümeti ve milis kuvvetlerini yenip Temmuz 1994'te Kigali'yi ele
      geçirdiğinde son buldu. Sonrasında misilleme korkusuyla iki milyondan fazla Hutu komşu
      Zaire'ye (bugünkü Demokratik Kongo Cumhuriyeti) sığındı.

      Ruanda için Uluslararası Ceza Mahkemesi (RUCM), soykırım, insanlığa karşı suçlar ve
      savaş suçlarından 93 kişiyi yargıladı. Ruanda hükümetinin gacaca mahkemesi sistemi ise
      topluluk düzeyinde 1,9 milyonun üzerinde davayı sonuçlandırdı.
```

- [ ] **Step 8: `src/content/events/1995-srebrenica.yaml`** — append:

```yaml
translations:
  tr:
    title: "Srebrenitsa Katliamı"
    summary: >
      Temmuz 1995'te General Ratko Mladiç komutasındaki Bosna Sırp kuvvetleri, BM tarafından
      "güvenli bölge" ilan edilen Doğu Bosna'daki Srebrenitsa'da 8.000'den fazla Boşnak
      Müslüman erkek ve çocuğu sistematik biçimde infaz etti. Bu, Holokost'tan bu yana
      Avrupa topraklarında yaşanan en büyük vahşetti.
    body: |
      Srebrenitsa katliamı, Bosna Savaşı'nın (1992–1995) son döneminde, Bosna Sırp
      kuvvetlerinin Boşnak ve Hırvat nüfusa yönelik etnik temizlik kampanyası sürerken
      yaşandı.

      General Ratko Mladiç komutasındaki Republika Srpska Ordusu 11 Temmuz 1995'te kasabayı
      ele geçirdiğinde yaklaşık 25.000–30.000 Boşnak — büyük çoğunluğu kadın, çocuk ve
      yaşlılardan oluşan — yakınlarda konuşlu Hollandalı BM taburu (Dutchbat) yanına sığındı.
      Yaklaşık 12 ile 77 yaşları arasındaki erkek ve çocuklar sistematik biçimde ayrılarak
      öldürüldü; cesetleri kanıtları gizlemek amacıyla sonradan iş makineleriyle açılan ve
      yer değiştirilen toplu mezarlara gömüldü.

      Hollandalı BM barış görevlileri, direnecek yetki ve ateş gücünden yoksun olduklarından
      üslerinde sığınan Boşnakları teslim etti. NATO hava saldırıları BM komuta zinciri
      tarafından defalarca ertelendi.

      Eski Yugoslavya için Uluslararası Ceza Mahkemesi (EYUCM), cinayetleri 1999'da soykırım
      olarak nitelendirdi ve Mladiç'i (2017) ile eski Bosna Sırp Cumhurbaşkanı Radovan
      Karadžiç'i (2016, 2019'da onandı) soykırımdan mahkûm etti. Uluslararası Adalet Divanı
      da 2007'de soykırım işlendiğine hükmetti.
```

- [ ] **Step 9: `src/content/events/2001-september-11.yaml`** — append:

```yaml
translations:
  tr:
    title: "11 Eylül Saldırıları"
    summary: >
      11 Eylül 2001 sabahı, on dokuz El Kaide militanı Amerika Birleşik Devletleri'ne
      koordineli bir saldırı gerçekleştirerek dört ticari uçağa el koydu. İki uçak New
      York'taki Dünya Ticaret Merkezi kulelerine çarptı, biri Pentagon'a isabet etti ve
      dördüncüsü yolcuların direnişinin ardından Pennsylvania'da düştü. Yaklaşık
      3.000 kişi hayatını kaybetti.
    body: |
      Saldırılar El Kaide lideri Usame bin Ladin tarafından planlanıp emredildi ve 19 kişilik
      bir operatörler hücresi tarafından icra edildi. American Airlines Uçuşu 11 ile United
      Airlines Uçuşu 175, Dünya Ticaret Merkezi'nin kuzey ve güney kulelerine çarptı; her
      iki kule de iki saat içinde çöktü. American Airlines Uçuşu 77, Virginia'daki Arlington'da
      Pentagon'a isabet etti. United Airlines Uçuşu 93 ise yolcuların — diğer kaçırma
      olaylarını telefon görüşmelerinde öğrendikten sonra — kontrolü geri almaya çalışmasının
      ardından Pennsylvania'daki Shanksville yakınlarına düştü.

      Toplam 2.977 kurbanın hayatını kaybetmesiyle bu saldırı tarihin en ölümcül terör
      eylemi oldu. Anlık tepkiler arasında Al-Kaide'ye ev sahipliği yapan Taliban yönetimini
      devirmeye yönelik ABD'nin Afganistan işgali, USA PATRIOT Yasası'nın çıkarılması ve
      İç Güvenlik Bakanlığı'nın kurulması yer aldı.

      Saldırılar, ABD'nin iç ve dış politikasını köklü biçimde dönüştürdü. "Terörle Küresel
      Savaş" Afganistan'da yirmi yılı aşkın askeri operasyonlara yol açtı ve 2003 Irak
      işgalini beraberinde getirdi. Toplu gözetleme, süresiz tutukluluk ve olağanüstü iade
      uygulamaları etrafındaki sivil özgürlük tartışmaları günümüz politika gündemlerinde
      yankılanmaya devam etmektedir.
```

- [ ] **Step 10: `src/content/events/2003-iraq-war.yaml`** — append:

```yaml
translations:
  tr:
    title: "Irak Savaşı"
    summary: >
      ABD liderliğindeki koalisyon, Irak'ın kitle imha silahına sahip olduğu iddiasıyla
      Mart 2003'te ülkeyi işgal ederek Saddam Hüseyin hükümetini birkaç hafta içinde
      devirdi. Söz konusu silahlar hiçbir zaman bulunamadı. İşgal, yüz binlerce Iraklının
      hayatını kaybettiği bir isyan ve mezhepsel çatışmayı alevlendirerek bölgeyi on yıllarca
      istikrarsızlaştırdı.
    body: |
      İşgal, George W. Bush yönetimi tarafından Irak'ın biyolojik ve kimyasal silah stokları
      bulundurduğu ve nükleer silah edinmeye çalıştığı gerekçesiyle meşrulaştırıldı. Hans Blix
      başkanlığındaki BM silah denetçileri hâlâ denetimleri sürdürüyor ve KİS programlarına
      ilişkin herhangi bir kanıt bulamamışken ABD, ikinci bir BM Güvenlik Konseyi kararı
      olmaksızın 20 Mart 2003'te işgali başlattı.

      Saddam Hüseyin'in hükümeti, ABD kuvvetlerinin Bağdat'a girdiği 9 Nisan 2003'te çöktü.
      Koalisyon Geçici Yönetimi, Irak Ordusu'nu dağıtıp hükümeti Baas partisinden
      arındırdı; bu adımlar, askeri eğitim almış büyük bir işsiz silahlı insan havuzu
      yaratarak isyanı körüklediği gerekçesiyle sonradan yoğun eleştiri aldı.

      2006'ya gelindiğinde Sünni ve Şii gruplar arasındaki mezhepsel şiddet Irak'ı neredeyse
      iç savaşa sürükledi. 2007'deki 30.000 ilave ABD askeriyle gerçekleştirilen "takviye"
      harekâtı şiddeti azalttı; ancak altta yatan siyasi bölünmüşlüğü çözemedi.

      Son ABD muharebe birlikleri Aralık 2011'de çekildi. Irak'taki sivil ölü sayısına
      ilişkin tahminler 150.000 ile 460.000'in üzerinde arasında değişmekte; ABD'nin askeri
      kaybı ise yaklaşık 4.500 olarak belgelenmektedir. Oluşan güç boşluğu, 2013–2014'te
      IŞİD'in yükselişine zemin hazırladı.
```

- [ ] **Step 11: `src/content/events/2004-indian-ocean-tsunami.yaml`** — append:

```yaml
translations:
  tr:
    title: "2004 Hint Okyanusu Tsunamisi"
    summary: >
      26 Aralık 2004'te Sumatra açıklarında meydana gelen 9,1 büyüklüğündeki bir denizaltı
      depremi, Hint Okyanusu çevresindeki 14 ülkeyi vuran dev tsunamilere yol açtı.
      Kayıtlı tarihin en ölümcül doğal afetlerinden biri olan bu felakette yaklaşık
      227.898 kişi hayatını kaybetti.
    body: |
      Kaydedilen üçüncü büyük deprem olan bu felaket, Hint Okyanusu'nun altında 1.200
      kilometre uzunluğunda bir fay hattını parçaladı. Kimi yerlerde 30 metreye ulaşan dev
      dalgalar, saatler içinde Endonezya, Sri Lanka, Hindistan, Tayland, Somali, Maldivler
      ve daha pek çok ülkenin kıyılarına çarptı.

      Endonezya en ağır kaybı yaşadı; çoğunluğu Açe eyaletinde olmak üzere yaklaşık
      168.000 kişi hayatını kaybetti. Sri Lanka'da yaklaşık 35.000, Hindistan'da 12.400 ve
      Tayland'da yabancı turistler de dahil 5.000'den fazla kişi öldü. Somali, deprem
      merkezinden 6.000 km uzakta olmasına karşın yaklaşık 300 can kaybı yaşadı.

      Felaket, o güne kadarki en büyük uluslararası insani yardım seferberliğini harekete
      geçirdi: 14 milyar ABD Dolarının üzerinde yardım taahhüt edildi. Aynı zamanda 2006'da
      faaliyete geçen Hint Okyanusu Tsunami Uyarı Sistemi'nin kurulmasını da hızlandırdı.

      Afet, afete hazırlık, tsunami riski taşıyan bölgelerdeki kıyı yapılaşması ve erken
      uyarı sistemlerinin uluslararası koordinasyonu konularındaki tartışmaları alevlendirdi.
```

- [ ] **Step 12: `src/content/events/2008-financial-crisis.yaml`** — append:

```yaml
translations:
  tr:
    title: "2008 Küresel Finansal Krizi"
    summary: >
      2007–2008 yıllarında ABD'nin yüksek riskli konut kredisi piyasasının çöküşü,
      Büyük Buhran'dan bu yana yaşanan en ağır küresel finansal krizi tetikledi.
      Eylül 2008'de Lehman Brothers'ın iflası dünya genelinde bir kredi dondurmasına,
      borsa çöküşlerine ve on milyonlarca kişiyi işsiz bırakan durgunluklara neden oldu.
    body: |
      Yıllar içinde biriken gevşek kredi standartları, karmaşık mortgage'a dayalı menkul
      kıymetler ve yetersiz finansal düzenleme, Amerika Birleşik Devletleri'nde büyük
      bir konut balonu yarattı. Konut fiyatları 2006–2007'de zirveye ulaşıp düşmeye
      başlayınca yüksek riskli mortgage temerrütleri fırladı; bu enstrümanları elinde
      bulunduran finansal kuruluşlar yıkıcı kayıplar yaşadı.

      Kriz, Eylül 2008'de akut evresine ulaştı. Fannie Mae ve Freddie Mac devlet
      vesayetine alındı. Lehman Brothers, 15 Eylül 2008'de ABD tarihinin en büyük
      iflasını açıkladı. Merrill Lynch Bank of America'ya satıldı. AIG, çöküşünü
      önlemek için 85 milyar dolarlık devlet kurtarma paketine muhtaç kaldı.

      ABD hükümeti, 700 milyar dolarlık Sorunlu Varlıkları Kurtarma Programı (TARP) ile
      yanıt verdi. Federal Rezerv faiz oranlarını sıfıra yakın düzeye indirerek benzeri
      görülmemiş parasal genişleme programları başlattı; dünya genelindeki merkez bankaları
      benzer önlemler aldı.

      Kriz, 1930'lardan bu yana yaşanan en uzun ve derin küresel durgunluğu tetikledi.
      ABD'de işsizlik Ekim 2009'da %10'a çıktı; Avro Bölgesi 2012–2013'e kadar süren
      uzun soluklu bir egemenlik borç kriziyle boğuştu. Küresel GSYİH 2009'da yaklaşık
      %2 küçüldü. 2010'dan itibaren uygulanan Basel III bankacılık düzenlemeleri,
      1930'lardan bu yana küresel bankacılık sisteminin en kapsamlı yeniden yapılanması
      oldu.
```

- [ ] **Step 13: `src/content/events/2010-arab-spring.yaml`** — append:

```yaml
translations:
  tr:
    title: "Arap Baharı"
    summary: >
      Aralık 2010'da Tunuslu seyyar satıcı Muhammed Buazizi'nin kendini ateşe vermesiyle
      başlayan demokratikleşme protestoları ve ayaklanmaları Arap dünyasını sardı. Devrimler
      Tunus, Mısır, Libya ve Yemen'de uzun süredir iktidarda olan liderleri devirerek Suriye'de
      bugün hâlâ süren yıkıcı bir iç savaşı fitilledi.
    body: |
      Arap Baharı, seyyar satıcı Muhammed Buazizi'nin 17 Aralık 2010'da polis tacizini ve
      yolsuzluğu protesto etmek için Tunus'un Sidi Buzid şehrinde kendini ateşe vermesiyle
      başladı. Bu eylem; 23 yıldır iktidarda olan Cumhurbaşkanı Zeynelabidin bin Ali'yi
      Ocak 2011'de görevden eden kitlesel gösterileri alevlendirdi.

      Mısır'da Tahrir Meydanı'ndaki 18 günlük protesto, 30 yıldır iktidarda olan
      Cumhurbaşkanı Hüsnü Mübarek'in 11 Şubat 2011'de istifasıyla son buldu. Libya'da
      Muammer Kaddafi'ye karşı başlayan ayaklanma iç savaşa dönüştü; NATO hava kampanyası
      isyancıları destekledi ve Kaddafi Ekim 2011'de yakalanarak öldürüldü. Yemen
      Cumhurbaşkanı Ali Abdullah Salih, protestolar ve silahlı ayaklanmanın ortasında 2011'de
      çekilmeyi kabul etti.

      Suriye'de barışçıl protestolar, hükümetin şiddetli müdahalesiyle karşılanarak 2011'de
      tam anlamıyla iç savaşa dönüştü; çatışmaya bölgesel güçler, cihatçı gruplar ve
      nihayetinde Rus askeri müdahalesi de dahil oldu. Savaşın yaklaşık 500.000 kişinin
      hayatını kaybetmesine yol açtığı ve 12 milyonun üzerinde insanı yerinden ettiği
      tahmin edilmektedir.

      Arap dünyasında demokratik geçişe ilişkin başlangıçtaki iyimserlik büyük ölçüde
      hayal kırıklığına dönüştü: Mısır 2013'te askeri yönetime döndü, Libya uzun soluklu
      hizip çatışmasına sürüklendi ve Yemen insani açıdan yıkıcı bir krizin merkezi haline
      geldi. Tunus'un demokratik deneyimi kayda değer bir istisna oluşturduysa da 2021'den
      itibaren ciddi bir geri çekilme yaşandı.
```

- [ ] **Step 14: `src/content/events/2020-covid-pandemic.yaml`** — append:

```yaml
translations:
  tr:
    title: "COVID-19 Salgını"
    summary: >
      SARS-CoV-2 koronavirüsünün yol açtığı COVID-19 salgını, DSÖ tarafından 30 Ocak
      2020'de Uluslararası Halk Sağlığı Acil Durumu, 11 Mart 2020'de ise pandemi olarak
      ilan edildi. DSÖ'nün Mayıs 2023'te küresel sağlık acil durumunu sona erdirmesine kadar
      virüs, resmi kayıtlara göre yaklaşık 7 milyon kişinin hayatını kaybetmesine neden
      olurken fazla ölüm tahminleri 15 ila 20 milyon arasında seyretti.
    body: |
      SARS-CoV-2, 2019'un sonlarında Çin'in Vuhan şehrinde ilk kez tanımlandı. Aylarca
      süren yayılma sürecinde İtalya, İspanya, Amerika Birleşik Devletleri, Brezilya ve
      Hindistan'daki sağlık sistemlerini alt üst etti. Nisan 2020'ye gelindiğinde dünya
      nüfusunun üçte birinden fazlası bir tür sokağa çıkma kısıtlaması altındaydı.

      Salgın, tarihin en hızlı aşı geliştirme sürecini tetikledi. Pfizer-BioNTech ve
      Moderna'nın ilk mRNA aşıları, virüsün dizilenmesinden itibaren bir yıldan kısa bir
      süre sonra Aralık 2020'de acil kullanım onayı aldı. 2023 ortasına kadar dünya
      genelinde 13 milyarın üzerinde aşı dozu uygulandı.

      Ekonomik yıkım ağır oldu. Küresel GSYİH, Büyük Buhran'dan bu yana barış döneminin
      en derin durgunluğu olan 2020'de %3,1 küçüldü. Hükümetler tahminen 16 trilyon dolarlık
      acil mali destek harcadı. Tedarik zinciri aksaklıkları, pandemi sonrası teşvik
      tedbimleriyle birleşince 2021–2022'de 40 yılın en yüksek enflasyon oranlarına zemin
      hazırladı.

      Hayatta kalanların bir bölümünde görülen kalıcı belirtiler olan uzun COVID, önemli bir
      halk sağlığı sorunu olarak gün yüzüne çıktı. Salgın aynı zamanda yüksek ve düşük gelirli
      ülkeler arasındaki derin aşı erişim eşitsizliğini de gözler önüne sererek fikri mülkiyet
      hakları ve küresel sağlık yönetişimine ilişkin tartışmaları yeniden canlandırdı.
```

- [ ] **Step 15: `src/content/events/2022-russia-ukraine-invasion.yaml`** — append:

```yaml
translations:
  tr:
    title: "Rusya'nın Ukrayna'yı İşgali"
    summary: >
      24 Şubat 2022'de Rusya, Ukrayna'ya yönelik tam kapsamlı bir işgal başlattı — bu,
      İkinci Dünya Savaşı'ndan bu yana Avrupa'da gerçekleşen en büyük askeri harekâttı.
      2014'teki Kırım ilhakının ve Doğu Ukrayna'daki ayrılıkçılara verilen desteğin
      ardından başlayan çatışma, on binlerce kişinin hayatını kaybetmesine ve 14 milyonun
      üzerinde insanın yerinden edilmesine yol açtı.
    body: |
      Rusya, 2021'in sonlarından itibaren Ukrayna sınırlarına asker yığmaya başlamıştı.
      Cumhurbaşkanı Vladimir Putin, işgal öncesi açıklamasında Ukrayna'nın meşru bir
      devlet kimliği taşımadığını öne sürerek NATO'yu Rus güvenliğini tehdit etmekle suçladı.
      İşgal, 24 Şubat 2022'nin ilk saatlerinde Ukrayna şehirlerine füze saldırıları ve Rusya
      topraklarından, Kırım'dan ve Belarus'tan ilerleyen kara kuvvetleriyle başladı.

      Ukrayna direncinin hızla çöküşeceği beklentisi gerçekleşmedi. Rusya'nın Kyiv'e yönelik
      ilk saldırısı püskürtüldü; NATO üyelerinden silah desteği alan Ukrayna kuvvetleri,
      Eylül 2022'de Harkiv oblastında ve Kasım 2022'de Herson şehrinde önemli toprakları
      geri alan başarılı karşı saldırılar düzenledi.

      Batılı ülkeler, Rusya'nın merkez bankası rezervlerini, enerji ihracatını ve kilit
      bireyleri hedef alan tarihte bir büyük ekonomiye uygulanan en kapsamlı yaptırımları
      devreye soktu. Avrupa Birliği ve Amerika Birleşik Devletleri, 2023 sonuna kadar
      Ukrayna'ya 100 milyar doların üzerinde askeri ve ekonomik yardım sağladı.

      Çatışma, her iki tarafta da on binlerce askeri can kaybına ve 14 milyonun üzerinde
      Ukraynalının yerinden edilmesine yol açtı — bu, İkinci Dünya Savaşı'ndan bu yana
      Avrupa'nın en büyük mülteci krizi olma özelliği taşımaktadır. Savaşın seyri belirsizliğini
      korumakta; çatışma Doğu ve Güney Ukrayna'daki tartışmalı cephe hattı boyunca
      sürmektedir.
```

- [ ] **Step 16: Verify the schema accepts all 15 updated YAMLs**

Run: `pnpm astro check`
Expected: no errors. If a YAML indentation error exists, check with `pnpm build` to see which file.

- [ ] **Step 17: Commit**

```bash
git add src/content/events/
git commit -m "feat: add Turkish translations to all 15 events"
```

---

## Task 5: Update Base.astro — i18n Store, Language Dropdown, Stone Palette

**Files:**
- Modify: `src/layouts/Base.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add `[x-cloak]` rule to `src/styles/global.css`**

Append to the file:
```css
[x-cloak] { display: none !important; }
```

- [ ] **Step 2: Replace `src/layouts/Base.astro` with the full updated version**

```astro
---
import '../styles/global.css';
import { en } from '../data/i18n/en';
import { tr } from '../data/i18n/tr';

const allTranslations = { en, tr };

const supportedLangs = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
];

interface Props {
  title: string;
  description: string;
  canonicalUrl: string;
  image?: { src: string; alt: string };
}

const { title, description, canonicalUrl, image } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title} — World Events Timeline</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    {image && <meta property="og:image" content={image.src} />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Dark mode: inline script prevents flash -->
    <script is:inline>
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    </script>

    <!-- Language: restore from localStorage to avoid flash -->
    <script is:inline>
      const storedLang = localStorage.getItem('lang');
      if (storedLang) document.documentElement.lang = storedLang;
    </script>

    <!-- i18n translations embedded at build time -->
    <script is:inline define:vars={{ allTranslations }}>
      window.__I18N__ = allTranslations;
    </script>

    <!-- Alpine i18n store — must be is:inline, no defer, before Alpine CDN -->
    <script is:inline>
      document.addEventListener('alpine:init', () => {
        Alpine.store('i18n', {
          lang: localStorage.getItem('lang') || 'en',
          get t() { return window.__I18N__[this.lang] || window.__I18N__.en; },
          setLang(code) {
            this.lang = code;
            localStorage.setItem('lang', code);
            document.documentElement.lang = code;
          },
        });
      });
    </script>

    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  </head>
  <body class="bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 font-sans min-h-screen">

    <!-- Skip to content link -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none"
      x-text="$store.i18n.t.skip_to_content"
    >Skip to content</a>

    <!-- Navigation -->
    <nav class="border-b border-stone-200 dark:border-stone-800 bg-white/85 dark:bg-stone-900/85 backdrop-blur-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a
          href="/"
          class="text-stone-900 dark:text-stone-100 font-semibold text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          x-text="$store.i18n.t.nav_title"
        >World Events Timeline</a>

        <div class="flex items-center gap-2">
          <!-- Language dropdown -->
          <div x-data="{ open: false }" class="relative" @click.outside="open = false">
            <button
              @click="open = !open"
              class="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              aria-haspopup="listbox"
              :aria-expanded="open.toString()"
            >
              <span x-text="$store.i18n.lang.toUpperCase()">EN</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              x-show="open"
              x-transition
              class="absolute right-0 mt-1 w-36 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg overflow-hidden z-50"
              role="listbox"
            >
              {supportedLangs.map((l) => (
                <button
                  @click={`$store.i18n.setLang('${l.code}'); open = false;`}
                  class="w-full flex items-center justify-between px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  role="option"
                  :aria-selected={`$store.i18n.lang === '${l.code}'`}
                >
                  <span>{l.label}</span>
                  <span x-show={`$store.i18n.lang === '${l.code}'`} class="text-blue-600" aria-hidden="true">✓</span>
                </button>
              ))}
            </div>
          </div>

          <!-- Dark mode toggle -->
          <button
            id="theme-toggle"
            class="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            aria-label="Toggle dark mode"
            onclick="
              const html = document.documentElement;
              const isDark = html.classList.toggle('dark');
              localStorage.setItem('theme', isDark ? 'dark' : 'light');
            "
          >
            <svg class="hidden dark:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" />
            </svg>
            <svg class="block dark:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <slot />

    <footer class="border-t border-stone-200 dark:border-stone-800 mt-16 py-8">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-stone-500 dark:text-stone-400"
        x-text="$store.i18n.t.footer_text"
      >
        World Events Timeline — historical data for educational purposes.
      </div>
    </footer>
  </body>
</html>
```

- [ ] **Step 3: Build and verify**

Run: `pnpm build`
Expected: clean build. Check dev server to confirm language dropdown appears in nav.

Run: `pnpm dev` then open browser, switch language — nav title and footer should update.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Base.astro src/styles/global.css
git commit -m "feat: add Alpine i18n store, language dropdown, stone palette to Base"
```

---

## Task 6: Update CategoryBadge and CountryFlag with i18n Labels

**Files:**
- Modify: `src/components/CategoryBadge.astro`
- Modify: `src/components/CountryFlag.astro`

- [ ] **Step 1: Replace `src/components/CategoryBadge.astro`**

```astro
---
import { categories } from '../data/categories';

interface Props {
  slug: string;
}

const { slug } = Astro.props;
const category = categories.find((c) => c.slug === slug);
const label    = category?.label    ?? slug;
const labelTr  = category?.label_tr ?? label;
const color    = category?.color    ?? '#6b7280';

// Sanitize quotes to prevent breaking x-text expression
const safeLabel   = label.replace(/'/g, "\\'");
const safeLabelTr = labelTr.replace(/'/g, "\\'");
---
<span
  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
  style={`background-color: ${color};`}
  x-text={`$store.i18n.lang === 'tr' ? '${safeLabelTr}' : '${safeLabel}'`}
>{label}</span>
```

- [ ] **Step 2: Replace `src/components/CountryFlag.astro`**

```astro
---
import { countries } from '../data/countries';

interface Props {
  code: string;
}

const { code } = Astro.props;
const country  = countries.find((c) => c.code === code);
const name     = country?.name    ?? code;
const nameTr   = country?.name_tr ?? name;
const flag     = country?.flag;

const safeName   = name.replace(/'/g, "\\'");
const safeNameTr = nameTr.replace(/'/g, "\\'");
---
<span class="inline-flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
  {flag
    ? <span role="img" aria-label={`${name} flag`}>{flag}</span>
    : null}
  <span x-text={`$store.i18n.lang === 'tr' ? '${safeNameTr}' : '${safeName}'`}>{name}</span>
</span>
```

- [ ] **Step 3: Build and verify**

Run: `pnpm build`
Expected: clean build. In dev, switch to Turkish and confirm category badges and country names update.

- [ ] **Step 4: Commit**

```bash
git add src/components/CategoryBadge.astro src/components/CountryFlag.astro
git commit -m "feat: add i18n label switching to CategoryBadge and CountryFlag"
```

---

## Task 7: Update EventCard — Bilingual Content + UI Polish + Stone Palette

**Files:**
- Modify: `src/components/EventCard.astro`

- [ ] **Step 1: Replace `src/components/EventCard.astro`**

```astro
---
import CategoryBadge from './CategoryBadge.astro';
import CountryFlag from './CountryFlag.astro';

interface EventTranslation {
  title?: string;
  summary?: string;
}

interface EventData {
  title: string;
  date: string;
  date_end?: string;
  date_display?: string;
  approximate: boolean;
  summary: string;
  categories: string[];
  countries: string[];
  severity: 'info' | 'warning' | 'severe' | 'critical';
  ongoing: boolean;
  translations?: { tr?: EventTranslation };
}

interface Props {
  slug: string;
  data: EventData;
}

const { slug, data: event } = Astro.props;

const severityColors: Record<string, string> = {
  info:     '#3b82f6',
  warning:  '#f59e0b',
  severe:   '#f97316',
  critical: '#ef4444',
};

const borderColor = severityColors[event.severity] ?? severityColors.info;

const dateDisplay = event.date_display
  ?? (event.date_end
    ? `${event.date.slice(0, 4)}–${event.date_end.slice(0, 4)}`
    : event.date);
const displayDate = event.approximate ? `~${dateDisplay}` : dateDisplay;

const title_tr   = event.translations?.tr?.title;
const summary_tr = event.translations?.tr?.summary;
---
<article
  data-slug={slug}
  class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 md:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 border-l-[3px]"
  style={`border-left-color: ${borderColor};`}
>
  <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
    <h3 class="text-stone-900 dark:text-stone-100 font-semibold text-lg leading-snug">
      <a
        href={`/event/${slug}`}
        class="hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
      >
        <span x-show="$store.i18n.lang !== 'tr'">{event.title}</span>
        {title_tr && <span x-show="$store.i18n.lang === 'tr'" x-cloak>{title_tr}</span>}
      </a>
    </h3>
  </div>

  <div class="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
    <time>{displayDate}</time>
    <span aria-hidden="true">·</span>
    <span
      class="font-medium"
      style={`color: ${borderColor};`}
      x-text={`$store.i18n.t.severity_${event.severity}`}
      aria-label={`Severity: ${event.severity}`}
    >{event.severity}</span>
  </div>

  <div class="text-sm text-stone-700 dark:text-stone-300 line-clamp-3 mb-4">
    <span x-show="$store.i18n.lang !== 'tr'">{event.summary}</span>
    {summary_tr && <span x-show="$store.i18n.lang === 'tr'" x-cloak>{summary_tr}</span>}
  </div>

  <div class="flex flex-wrap gap-2 items-center">
    {event.categories.map((cat) => (
      <CategoryBadge slug={cat} />
    ))}
    {event.countries.length > 0 && (
      <span class="text-stone-300 dark:text-stone-700" aria-hidden="true">·</span>
    )}
    {event.countries.map((code) => (
      <CountryFlag code={code} />
    ))}
    {event.ongoing && (
      <span
        class="ml-auto text-xs font-medium text-orange-600 dark:text-orange-400"
        x-text="$store.i18n.t.ongoing_label"
      >Ongoing</span>
    )}
  </div>
</article>
```

- [ ] **Step 2: Build and verify**

Run: `pnpm build`
Expected: clean build. In dev, verify cards show Turkish titles/summaries when switching language, and revert to English when switching back.

- [ ] **Step 3: Commit**

```bash
git add src/components/EventCard.astro
git commit -m "feat: add bilingual content toggle and UI polish to EventCard"
```

---

## Task 8: Update TimelineTrack — Editorial Year Markers + Severity Dots + Stone Palette

**Files:**
- Modify: `src/components/TimelineTrack.astro`

- [ ] **Step 1: Replace `src/components/TimelineTrack.astro`**

```astro
---
import EventCard from './EventCard.astro';
import { normalizeEventDate } from '../lib/dates';

interface EventData {
  title: string;
  date: string;
  date_end?: string;
  date_display?: string;
  approximate: boolean;
  summary: string;
  categories: string[];
  countries: string[];
  severity: 'info' | 'warning' | 'severe' | 'critical';
  ongoing: boolean;
  translations?: { tr?: { title?: string; summary?: string } };
}

interface EventEntry {
  id: string;
  data: EventData;
}

interface Props {
  events: EventEntry[];
}

const { events } = Astro.props;

const severityColors: Record<string, string> = {
  info:     '#3b82f6',
  warning:  '#f59e0b',
  severe:   '#f97316',
  critical: '#ef4444',
};

// Sort descending by date
const sorted = [...events].sort(
  (a, b) =>
    normalizeEventDate(b.data.date).getTime() -
    normalizeEventDate(a.data.date).getTime()
);

// Group by year
const byYear = new Map<number, EventEntry[]>();
for (const event of sorted) {
  const year = Number.parseInt(event.data.date.slice(0, 4), 10);
  const group = byYear.get(year) ?? [];
  group.push(event);
  byYear.set(year, group);
}

const yearGroups = [...byYear.entries()].sort((a, b) => b[0] - a[0]);
---
<div class="relative">
  <!-- Vertical timeline line -->
  <div
    class="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-stone-300 dark:bg-stone-700"
    aria-hidden="true"
  ></div>

  {yearGroups.map(([year, yearEvents]) => (
    <div>
      <!-- Year marker — editorial, sticky -->
      <div
        class="sticky top-14 z-10 mb-6"
        x-show={`${JSON.stringify(yearEvents.map(e => e.id))}.some(s => $data.visibleSlugs.has(s))`}
      >
        <div class="pl-10 md:pl-20 pr-4 py-3 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800 flex items-baseline gap-3">
          <span class="text-5xl font-black tracking-tight text-stone-200 dark:text-stone-800 select-none" aria-hidden="true">
            {year}
          </span>
          <span class="text-lg font-bold text-stone-900 dark:text-stone-100 sr-only">{year}</span>
        </div>
      </div>

      <!-- Events for this year -->
      <div class="space-y-4 mb-10 pl-10 md:pl-20">
        {yearEvents.map((event) => (
          <div
            class="relative"
            x-show={`$data.visibleSlugs.has('${event.id}')`}
            x-transition
          >
            <!-- Connector dot — severity coloured -->
            <div
              class="absolute -left-6 md:-left-12 top-5 w-3.5 h-3.5 rounded-full border-2 border-stone-50 dark:border-stone-950"
              style={`background-color: ${severityColors[event.data.severity] ?? severityColors.info};`}
              aria-hidden="true"
            ></div>
            <!-- Connector line (horizontal) -->
            <div
              class="absolute -left-5 md:-left-10 top-6 w-5 md:w-10 h-px bg-stone-300 dark:bg-stone-700"
              aria-hidden="true"
            ></div>
            <EventCard slug={event.id} data={event.data} />
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Build and verify**

Run: `pnpm build`
Expected: clean build. In dev, verify year markers are large decorative numbers, and connector dots have severity colours (blue for info, red for critical, etc.).

- [ ] **Step 3: Commit**

```bash
git add src/components/TimelineTrack.astro
git commit -m "feat: editorial year markers and severity-coloured timeline dots"
```

---

## Task 9: Update FilterBar and index.astro — Pill-Toggle Categories, Tag-Input Countries, i18n Strings

**Files:**
- Modify: `src/components/FilterBar.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace `src/components/FilterBar.astro`**

```astro
---
import { categories } from '../data/categories';
---
<aside aria-label="Filters" class="lg:w-72 lg:flex-shrink-0">
  <!-- Mobile toggle button (< lg) -->
  <div class="lg:hidden mb-4">
    <button
      @click="mobileOpen = !mobileOpen"
      class="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M7 12h10M11 20h2" />
      </svg>
      <span x-text="mobileOpen ? $store.i18n.t.hide_filters : $store.i18n.t.show_filters">Show Filters</span>
      <span class="ml-auto text-xs text-stone-500 dark:text-stone-400" x-text="`(${visibleSlugs.size})`"></span>
    </button>
  </div>

  <!-- Filter panel -->
  <div
    x-show="mobileOpen || window.innerWidth >= 1024"
    x-transition
    class="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5"
  >
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-stone-900 dark:text-stone-100" x-text="$store.i18n.t.filters">Filters</h2>
      <span class="hidden lg:block text-xs text-stone-500 dark:text-stone-400" x-text="$store.i18n.t.events_count.replace('{n}', visibleSlugs.size)"></span>
    </div>

    <!-- Search -->
    <div class="border-t border-stone-100 dark:border-stone-800 pt-4">
      <label for="filter-search" class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5" x-text="$store.i18n.t.search_label">Search</label>
      <input
        id="filter-search"
        type="text"
        x-model="search"
        :placeholder="$store.i18n.t.search_placeholder"
        class="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm px-3 py-2 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Categories — pill-toggle -->
    <div class="border-t border-stone-100 dark:border-stone-800 pt-4">
      <p class="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2.5" x-text="$store.i18n.t.categories">Categories</p>
      <div class="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            type="button"
            @click={`const i = categories.indexOf('${cat.slug}'); i >= 0 ? categories.splice(i, 1) : categories.push('${cat.slug}')`}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            :class={`categories.includes('${cat.slug}') ? 'text-white border-transparent' : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'`}
            :style={`categories.includes('${cat.slug}') ? 'background-color: ${cat.color}; border-color: ${cat.color};' : ''`}
            :aria-pressed={`categories.includes('${cat.slug}').toString()`}
          >
            <span class="w-2 h-2 rounded-full flex-shrink-0" style={`background-color: ${cat.color};`} aria-hidden="true"></span>
            <span x-text={`$store.i18n.lang === 'tr' ? '${cat.label_tr.replace(/'/g, "\\'")}' : '${cat.label.replace(/'/g, "\\'")}'`}>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>

    <!-- Severity -->
    <div class="border-t border-stone-100 dark:border-stone-800 pt-4">
      <fieldset>
        <legend class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2.5" x-text="$store.i18n.t.severity">Severity</legend>
        <div class="space-y-2">
          {[
            { value: 'info',     color: '#3b82f6' },
            { value: 'warning',  color: '#f59e0b' },
            { value: 'severe',   color: '#f97316' },
            { value: 'critical', color: '#ef4444' },
          ].map((sev) => (
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                value={sev.value}
                x-model="severities"
                class="rounded border-stone-300 dark:border-stone-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span
                class="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={`background-color: ${sev.color};`}
                aria-hidden="true"
              ></span>
              <span
                class="text-sm text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100"
                x-text={`$store.i18n.t.severity_${sev.value}`}
              >{sev.value}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>

    <!-- Date range -->
    <div class="border-t border-stone-100 dark:border-stone-800 pt-4">
      <p class="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2.5" x-text="$store.i18n.t.date_range">Date Range</p>
      <div class="flex gap-2 items-center">
        <label class="sr-only" for="filter-year-from" x-text="$store.i18n.t.date_from">From year</label>
        <input
          id="filter-year-from"
          type="number"
          x-model.number="yearFrom"
          :placeholder="$store.i18n.t.date_from"
          min="1900"
          max="2100"
          class="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm px-3 py-2 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="text-stone-400 dark:text-stone-600 text-sm flex-shrink-0">–</span>
        <label class="sr-only" for="filter-year-to" x-text="$store.i18n.t.date_to">To year</label>
        <input
          id="filter-year-to"
          type="number"
          x-model.number="yearTo"
          :placeholder="$store.i18n.t.date_to"
          min="1900"
          max="2100"
          class="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm px-3 py-2 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Countries — searchable tag-input -->
    <div class="border-t border-stone-100 dark:border-stone-800 pt-4">
      <p class="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2.5" x-text="$store.i18n.t.countries">Countries</p>

      <!-- Selected tags -->
      <div class="flex flex-wrap gap-1.5 mb-2" x-show="countries.length > 0">
        <template x-for="code in countries" :key="code">
          <span class="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-full">
            <span x-text="allCountries.find(c => c.code === code)?.flag ?? ''"></span>
            <span x-text="($store.i18n.lang === 'tr' ? allCountries.find(c => c.code === code)?.name_tr : null) ?? allCountries.find(c => c.code === code)?.name ?? code"></span>
            <button
              @click="countries.splice(countries.indexOf(code), 1)"
              class="ml-0.5 p-0.5 rounded-full hover:bg-stone-300 dark:hover:bg-stone-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              :aria-label="`Remove ${code}`"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </template>
      </div>

      <!-- Search input + dropdown -->
      <div class="relative" @click.outside="countryDropdownOpen = false">
        <input
          type="text"
          x-model="countrySearch"
          @focus="countryDropdownOpen = true"
          :placeholder="$store.i18n.t.country_search_placeholder"
          class="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm px-3 py-2 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div
          x-show="countryDropdownOpen && filteredCountries.length > 0"
          class="absolute z-20 w-full mt-1 max-h-44 overflow-y-auto bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg"
        >
          <template x-for="country in filteredCountries" :key="country.code">
            <button
              type="button"
              @click="if (!countries.includes(country.code)) countries.push(country.code); countrySearch = ''; countryDropdownOpen = false;"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors text-left"
              :class="countries.includes(country.code) ? 'opacity-50 cursor-not-allowed' : ''"
            >
              <span x-text="country.flag"></span>
              <span x-text="$store.i18n.lang === 'tr' ? (country.name_tr ?? country.name) : country.name"></span>
              <span x-show="countries.includes(country.code)" class="ml-auto text-blue-600 text-xs">✓</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Ongoing toggle -->
    <div class="border-t border-stone-100 dark:border-stone-800 pt-4 flex items-center justify-between">
      <label for="filter-ongoing" class="text-sm font-medium text-stone-700 dark:text-stone-300" x-text="$store.i18n.t.ongoing_only">
        Ongoing events only
      </label>
      <button
        id="filter-ongoing"
        role="switch"
        :aria-checked="ongoingOnly.toString()"
        @click="ongoingOnly = !ongoingOnly"
        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        :class="ongoingOnly ? 'bg-blue-600' : 'bg-stone-200 dark:bg-stone-700'"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="ongoingOnly ? 'translate-x-5' : 'translate-x-0'"
        ></span>
      </button>
    </div>

    <!-- Reset button -->
    <div class="border-t border-stone-100 dark:border-stone-800 pt-4">
      <button
        @click="resetFilters()"
        class="w-full px-4 py-2 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        x-text="$store.i18n.t.reset_filters"
      >Reset Filters</button>
    </div>
  </div>
</aside>
```

- [ ] **Step 2: Update `src/pages/index.astro`** — add country tag-input state to x-data, import countries, update header strings

Replace the file with:

```astro
---
import Base from '../layouts/Base.astro';
import FilterBar from '../components/FilterBar.astro';
import TimelineTrack from '../components/TimelineTrack.astro';
import { getCollection } from 'astro:content';
import { buildEventIndex } from '../lib/filter-index';
import { countries } from '../data/countries';

const allEvents = await getCollection('events');
const eventIndex = buildEventIndex(allEvents);

// Embed minimal country data for tag-input (flag, name, name_tr, code)
const countriesForClient = countries.map(c => ({
  code: c.code,
  name: c.name,
  name_tr: c.name_tr,
  flag: c.flag,
}));

const siteUrl = import.meta.env.SITE ?? 'https://your-domain.pages.dev';
---
<Base
  title="World Events Timeline"
  description="A visual timeline of historical and ongoing world events, organised by category, country, and date."
  canonicalUrl={siteUrl}
>
  <script type="application/json" id="event-index" set:html={JSON.stringify(eventIndex)} />

  <main id="main-content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100" x-text="$store.i18n.t.nav_title">
        World Events Timeline
      </h1>
      <p
        class="mt-2 text-stone-600 dark:text-stone-400"
        x-text="$store.i18n.t.all_events_count.replace('{n}', $data.index.length || 0)"
      >
        Historical and ongoing events — {allEvents.length} total
      </p>
    </header>

    <div
      class="flex flex-col lg:flex-row gap-8"
      x-data={`{
        search: '',
        categories: [],
        countries: [],
        severities: [],
        yearFrom: null,
        yearTo: null,
        ongoingOnly: false,
        visibleSlugs: new Set(),
        index: [],
        mobileOpen: false,
        allCountries: ${JSON.stringify(countriesForClient)},
        countrySearch: '',
        countryDropdownOpen: false,

        get filteredCountries() {
          const q = this.countrySearch.toLowerCase();
          if (!q) return this.allCountries;
          return this.allCountries.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            (c.name_tr && c.name_tr.toLowerCase().includes(q))
          );
        },

        init() {
          this.index = JSON.parse(document.getElementById('event-index').textContent);
          this.restoreFromHash();
          this.recomputeVisible();
          this.$watch('search',      () => { this.recomputeVisible(); this.syncHash(); });
          this.$watch('categories',  () => { this.recomputeVisible(); this.syncHash(); });
          this.$watch('countries',   () => { this.recomputeVisible(); this.syncHash(); });
          this.$watch('severities',  () => { this.recomputeVisible(); this.syncHash(); });
          this.$watch('yearFrom',    () => { this.recomputeVisible(); this.syncHash(); });
          this.$watch('yearTo',      () => { this.recomputeVisible(); this.syncHash(); });
          this.$watch('ongoingOnly', () => { this.recomputeVisible(); this.syncHash(); });
          window.addEventListener('hashchange', () => {
            this.restoreFromHash();
            this.recomputeVisible();
          });
        },

        recomputeVisible() {
          const visible = new Set();
          for (const event of this.index) {
            if (this.matchesEvent(event)) visible.add(event.slug);
          }
          this.visibleSlugs = visible;
        },

        matchesEvent(event) {
          if (this.search.trim() && !event.searchText.includes(this.search.toLowerCase())) return false;
          if (this.categories.length > 0 && !this.categories.some(c => event.categories.includes(c))) return false;
          if (this.countries.length > 0 && !this.countries.some(c => event.countries.includes(c))) return false;
          if (this.severities.length > 0 && !this.severities.includes(event.severity)) return false;
          if (this.yearFrom !== null && event.yearTo   < this.yearFrom) return false;
          if (this.yearTo   !== null && event.yearFrom > this.yearTo)   return false;
          if (this.ongoingOnly && !event.ongoing) return false;
          return true;
        },

        syncHash() {
          const params = new URLSearchParams();
          if (this.search.trim())       params.set('search',     this.search.trim());
          if (this.categories.length)   params.set('categories', this.categories.join(','));
          if (this.countries.length)    params.set('countries',  this.countries.join(','));
          if (this.severities.length)   params.set('severity',   this.severities.join(','));
          if (this.yearFrom !== null)   params.set('yearFrom',   String(this.yearFrom));
          if (this.yearTo   !== null)   params.set('yearTo',     String(this.yearTo));
          if (this.ongoingOnly)         params.set('ongoing',    'true');
          const hash = params.toString() ? '#' + params.toString() : location.pathname;
          history.replaceState(null, '', hash === location.pathname ? location.pathname : '#' + params.toString());
        },

        restoreFromHash() {
          const raw = location.hash.slice(1);
          if (!raw) return;
          const params = new URLSearchParams(raw);
          this.search      = params.get('search')     ?? '';
          this.categories  = params.get('categories') ? params.get('categories').split(',') : [];
          this.countries   = params.get('countries')  ? params.get('countries').split(',')  : [];
          this.severities  = params.get('severity')   ? params.get('severity').split(',')   : [];
          this.yearFrom    = params.get('yearFrom')   ? Number(params.get('yearFrom'))       : null;
          this.yearTo      = params.get('yearTo')     ? Number(params.get('yearTo'))         : null;
          this.ongoingOnly = params.get('ongoing')    === 'true';
        },

        resetFilters() {
          this.search = ''; this.categories = []; this.countries = [];
          this.severities = []; this.yearFrom = null; this.yearTo = null; this.ongoingOnly = false;
        },
      }`}
    >
      <FilterBar />
      <div class="flex-1 min-w-0">
        <TimelineTrack events={allEvents} />
      </div>
    </div>
  </main>
</Base>
```

- [ ] **Step 3: Build and verify**

Run: `pnpm build`
Expected: clean build. In dev verify:
- Category pills show/deselect on click
- Country tag-input filters as you type, adds tags on click, removes on ×
- Filter counts update as usual
- Switching language updates filter labels

- [ ] **Step 4: Commit**

```bash
git add src/components/FilterBar.astro src/pages/index.astro
git commit -m "feat: pill-toggle categories, tag-input countries, i18n filter labels"
```

---

## Task 10: Update Event Detail Page — Bilingual Content + Stone Palette

**Files:**
- Modify: `src/pages/event/[slug].astro`

- [ ] **Step 1: Replace `src/pages/event/[slug].astro`**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import Base from '../../layouts/Base.astro';
import CategoryBadge from '../../components/CategoryBadge.astro';
import CountryFlag from '../../components/CountryFlag.astro';
import { renderMarkdown } from '../../lib/markdown';
import { normalizeEventDate } from '../../lib/dates';

export async function getStaticPaths() {
  const events = await getCollection('events');
  return events.map((event) => ({
    params: { slug: event.id },
  }));
}

const { slug } = Astro.params;
const event = await getEntry('events', slug as string);

if (!event) {
  return Astro.redirect('/');
}

const { data } = event;

// Related events
const allEvents = await getCollection('events');
const related = allEvents
  .filter(
    (e) =>
      e.id !== slug &&
      (e.data.categories.some((c) => data.categories.includes(c)) ||
        e.data.countries.some((c) => data.countries.includes(c)))
  )
  .sort(
    (a, b) =>
      normalizeEventDate(b.data.date).getTime() -
      normalizeEventDate(a.data.date).getTime()
  )
  .slice(0, 5);

const dateDisplay = data.date_display
  ?? (data.date_end
    ? `${data.date.slice(0, 4)}–${data.date_end.slice(0, 4)}`
    : data.date);
const displayDate = data.approximate ? `~${dateDisplay}` : dateDisplay;

const severityColors: Record<string, string> = {
  info:     '#3b82f6',
  warning:  '#f59e0b',
  severe:   '#f97316',
  critical: '#ef4444',
};

// Turkish overrides
const tr = data.translations?.tr;
const bodyHtmlEn = data.body ? renderMarkdown(data.body) : null;
const bodyHtmlTr = tr?.body  ? renderMarkdown(tr.body)  : null;

const siteUrl = import.meta.env.SITE ?? 'https://your-domain.pages.dev';
---
<Base
  title={data.title}
  description={data.summary}
  canonicalUrl={`${siteUrl}/event/${slug}`}
  image={data.image}
>
  <main id="main-content" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <nav class="mb-6" aria-label="Breadcrumb">
      <a
        href="/"
        class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
        x-text="$store.i18n.t.back_to_timeline"
      >← Back to Timeline</a>
    </nav>

    <article>
      <header class="mb-8">
        <div class="flex flex-wrap gap-2 mb-3">
          {data.categories.map((cat) => <CategoryBadge slug={cat} />)}
        </div>

        <!-- Title: EN / TR -->
        <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          <span x-show="$store.i18n.lang !== 'tr'">{data.title}</span>
          {tr?.title && <span x-show="$store.i18n.lang === 'tr'" x-cloak>{tr.title}</span>}
        </h1>

        <div class="flex flex-wrap items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
          <time>{displayDate}</time>
          <span
            class="inline-flex items-center gap-1.5 font-medium"
            style={`color: ${severityColors[data.severity]}`}
          >
            <span
              class="inline-block w-2 h-2 rounded-full"
              style={`background-color: ${severityColors[data.severity]};`}
              aria-hidden="true"
            ></span>
            <span x-text={`$store.i18n.t.severity_${data.severity}`}>{data.severity}</span>
          </span>
          {data.ongoing && (
            <span class="text-orange-600 dark:text-orange-400 font-medium" x-text="$store.i18n.t.ongoing_label">Ongoing</span>
          )}
        </div>

        <div class="flex flex-wrap gap-3 mt-3">
          {data.countries.map((code) => <CountryFlag code={code} />)}
          {data.region && (
            <span class="text-sm text-stone-500 dark:text-stone-400">{data.region}</span>
          )}
        </div>
      </header>

      {data.image && (
        <figure class="mb-8 rounded-xl overflow-hidden">
          <img
            src={data.image.src}
            alt={data.image.alt}
            class="w-full object-cover max-h-80"
            loading="lazy"
          />
          {data.image.credit && (
            <figcaption class="text-xs text-stone-500 dark:text-stone-400 mt-2 text-right">
              {data.image.credit}
            </figcaption>
          )}
        </figure>
      )}

      <!-- Summary lead: EN / TR -->
      <div class="text-lg text-stone-700 dark:text-stone-300 leading-relaxed mb-6 font-medium">
        <span x-show="$store.i18n.lang !== 'tr'">{data.summary}</span>
        {tr?.summary && <span x-show="$store.i18n.lang === 'tr'" x-cloak>{tr.summary}</span>}
      </div>

      <!-- Body prose: EN / TR -->
      {bodyHtmlEn && (
        <div
          class="prose prose-stone dark:prose-invert max-w-none mb-8"
          x-show="$store.i18n.lang !== 'tr'"
          set:html={bodyHtmlEn}
        />
      )}
      {bodyHtmlTr && (
        <div
          class="prose prose-stone dark:prose-invert max-w-none mb-8"
          x-show="$store.i18n.lang === 'tr'"
          x-cloak
          set:html={bodyHtmlTr}
        />
      )}
      {/* TR section without body: show fallback note */}
      {tr && !bodyHtmlTr && bodyHtmlEn && (
        <div x-show="$store.i18n.lang === 'tr'" x-cloak class="mb-8">
          <p class="text-sm text-stone-500 dark:text-stone-400 italic mb-4" x-text="$store.i18n.t.body_english_only"></p>
          <div class="prose prose-stone dark:prose-invert max-w-none" set:html={bodyHtmlEn} />
        </div>
      )}

      <!-- Sources -->
      {data.sources.length > 0 && (
        <section class="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800" aria-labelledby="sources-heading">
          <h2 id="sources-heading" class="text-sm font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-3" x-text="$store.i18n.t.sources">Sources</h2>
          <ul class="space-y-2">
            {data.sources.map((source) => (
              <li>
                <a
                  href={source.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
                >
                  {source.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>

    <!-- Related events -->
    {related.length > 0 && (
      <section class="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800" aria-labelledby="related-heading">
        <h2 id="related-heading" class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4" x-text="$store.i18n.t.related_events">Related Events</h2>
        <ul class="space-y-2">
          {related.map((e) => (
            <li>
              <a
                href={`/event/${e.id}`}
                class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
              >
                <span class="text-stone-400 dark:text-stone-600">{e.data.date.slice(0, 4)}</span>
                {e.data.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    )}
  </main>
</Base>
```

- [ ] **Step 2: Build and verify**

Run: `pnpm build`
Expected: clean build. In dev, open any event detail page, switch language — title, summary, body, and all labels should update.

- [ ] **Step 3: Commit**

```bash
git add src/pages/event/[slug].astro
git commit -m "feat: bilingual content on event detail page, stone palette"
```

---

## Task 11: Update Category and Country Pages — Stone Palette + i18n Strings

**Files:**
- Modify: `src/pages/category/[slug].astro`
- Modify: `src/pages/country/[slug].astro`

- [ ] **Step 1: Replace `src/pages/category/[slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import EventCard from '../../components/EventCard.astro';
import { normalizeEventDate } from '../../lib/dates';
import { categories, type Category } from '../../data/categories';

export async function getStaticPaths() {
  const events = await getCollection('events');
  const usedSlugs = new Set(events.flatMap((e) => e.data.categories));
  return categories
    .filter((cat) => usedSlugs.has(cat.slug))
    .map((cat) => ({ params: { slug: cat.slug }, props: { category: cat } }));
}

const { slug } = Astro.params;
const { category } = Astro.props as { category: Category };
const allEvents = await getCollection('events');
const filtered = allEvents
  .filter((e) => e.data.categories.includes(slug as string))
  .sort(
    (a, b) =>
      normalizeEventDate(b.data.date).getTime() -
      normalizeEventDate(a.data.date).getTime()
  );

const siteUrl = import.meta.env.SITE ?? 'https://your-domain.pages.dev';
---
<Base
  title={category.label}
  description={`All events related to ${category.label} on the World Events Timeline.`}
  canonicalUrl={`${siteUrl}/category/${slug}`}
>
  <main id="main-content" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <nav class="mb-6" aria-label="Breadcrumb">
      <a
        href="/"
        class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
        x-text="$store.i18n.t.back_to_timeline"
      >← Back to Timeline</a>
    </nav>
    <header class="mb-8">
      <div
        class="inline-block w-4 h-4 rounded-full mb-3"
        style={`background-color: ${category.color};`}
        aria-hidden="true"
      ></div>
      <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
        <span x-show="$store.i18n.lang !== 'tr'">{category.label}</span>
        <span x-show="$store.i18n.lang === 'tr'" x-cloak>{category.label_tr}</span>
      </h1>
      <p class="text-stone-500 dark:text-stone-400 mt-1"
        x-text={`$store.i18n.t.events_count.replace('{n}', ${filtered.length})`}
      >{filtered.length} events</p>
    </header>
    <div class="space-y-4">
      {filtered.map((event) => (
        <EventCard slug={event.id} data={event.data} />
      ))}
    </div>
  </main>
</Base>
```

- [ ] **Step 2: Replace `src/pages/country/[slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import EventCard from '../../components/EventCard.astro';
import CountryFlag from '../../components/CountryFlag.astro';
import { normalizeEventDate } from '../../lib/dates';
import { countries, type Country } from '../../data/countries';

export async function getStaticPaths() {
  const events = await getCollection('events');
  const usedCodes = new Set(events.flatMap((e) => e.data.countries));
  return countries
    .filter((c) => usedCodes.has(c.code))
    .map((c) => ({ params: { slug: c.code }, props: { country: c } }));
}

const { slug } = Astro.params;
const { country } = Astro.props as { country: Country };
const allEvents = await getCollection('events');
const filtered = allEvents
  .filter((e) => e.data.countries.includes(slug as string))
  .sort(
    (a, b) =>
      normalizeEventDate(b.data.date).getTime() -
      normalizeEventDate(a.data.date).getTime()
  );

const siteUrl = import.meta.env.SITE ?? 'https://your-domain.pages.dev';
---
<Base
  title={country.name}
  description={`All events related to ${country.name} on the World Events Timeline.`}
  canonicalUrl={`${siteUrl}/country/${slug}`}
>
  <main id="main-content" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <nav class="mb-6" aria-label="Breadcrumb">
      <a
        href="/"
        class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
        x-text="$store.i18n.t.back_to_timeline"
      >← Back to Timeline</a>
    </nav>
    <header class="mb-8">
      <CountryFlag code={country.code} />
      <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
        <span x-show="$store.i18n.lang !== 'tr'">{country.name}</span>
        <span x-show="$store.i18n.lang === 'tr'" x-cloak>{country.name_tr}</span>
      </h1>
      <p class="text-stone-500 dark:text-stone-400 mt-1"
        x-text={`$store.i18n.t.events_count.replace('{n}', ${filtered.length}) + ' · ' + '${country.region}'`}
      >{filtered.length} events · {country.region}</p>
    </header>
    <div class="space-y-4">
      {filtered.map((event) => (
        <EventCard slug={event.id} data={event.data} />
      ))}
    </div>
  </main>
</Base>
```

- [ ] **Step 3: Final build and full verification**

Run: `pnpm build`
Expected: clean build with no TypeScript errors.

Run: `pnpm dev` and verify end-to-end:
- [ ] Language dropdown switches all UI strings
- [ ] Event cards show Turkish title/summary in TR mode
- [ ] Category pills are toggleable and i18n-labelled
- [ ] Country tag-input filters, adds, removes tags
- [ ] Event detail page shows Turkish content and fallback note where body is absent
- [ ] Dark mode still works
- [ ] URL hash filter state still works across language switches

- [ ] **Step 4: Commit**

```bash
git add src/pages/category/[slug].astro src/pages/country/[slug].astro
git commit -m "feat: stone palette and i18n strings on category and country pages"
```
