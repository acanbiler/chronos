# Chronos — i18n & UI Redesign Spec

**Date:** 2026-03-31
**Status:** Approved

---

## 1. Goals

1. Add full Turkish language support — UI chrome and all event content — via a language dropdown in the nav that persists to `localStorage`. Designed to accommodate additional languages in future.
2. Redesign the UI to be warm, readable, and visually polished — warm stone palette, severity-colored timeline dots, editorial year markers, improved cards, and better filter controls.

---

## 2. Constraints

- Static Astro output (`output: 'static'`). No server-side rendering.
- No React, Vue, or Svelte. Astro components + Alpine.js only.
- Alpine.js loaded from CDN. No additional client-side bundles.
- All translations embedded at build time (no runtime fetches).
- English is always the fallback when a translation key is missing.

---

## 3. i18n Architecture

### 3.1 Translation files

Create `src/data/i18n/en.ts` and `src/data/i18n/tr.ts`, each exporting a typed `Translations` object covering every UI string:

```typescript
// src/data/i18n/types.ts
export interface Translations {
  lang: string;           // "English" / "Türkçe"
  nav_title: string;
  filters: string;
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
  ongoing_only: string;
  reset_filters: string;
  events_count: string;   // "{n} events" — use {n} as placeholder
  back_to_timeline: string;
  sources: string;
  related_events: string;
  ongoing_label: string;
  footer_text: string;
  show_filters: string;
  hide_filters: string;
  all_events_count: string; // "historical and ongoing events — {n} total"
}
```

### 3.2 Event YAML `translations` key

Each event YAML gains an optional `translations` block:

```yaml
translations:
  tr:
    title: "Ruanda Soykırımı"
    summary: "Yaklaşık 100 günde..."
    body: |
      Türkçe gövde içeriği...
```

The Zod schema (`src/content.config.ts`) is extended to allow this optional nested structure. `title` and `summary` under `translations.tr` are required when the block is present; `body` is optional.

### 3.3 Category and country labels

`src/data/categories.ts` entries gain a `label_tr` field.
`src/data/countries.ts` entries gain a `name_tr` field.

### 3.4 Alpine i18n store

Registered in `Base.astro` before Alpine initialises. Both scripts must use `is:inline` (no `defer`) to guarantee they execute before Alpine's CDN script fires `alpine:init`:

```astro
<!-- Step 1: embed both language objects at build time -->
<script is:inline define:vars={{ translations: allTranslations }}>
  window.__I18N__ = translations; // { en: {...}, tr: {...} }
</script>

<!-- Step 2: register store on alpine:init (must also be is:inline, no defer) -->
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
```

All components reference UI strings via `$store.i18n.t.key`.

**Placeholder interpolation:** strings with a `{n}` placeholder (e.g. `events_count`) are interpolated inline at the call site using `.replace('{n}', count)`. Example:

```html
<span x-text="$store.i18n.t.events_count.replace('{n}', visibleSlugs.size)"></span>
```

**`<html lang>` attribute:** an inline script (before `</head>`, same pattern as the dark mode script) sets `document.documentElement.lang` from `localStorage` on every page load:

```html
<script is:inline>
  const storedLang = localStorage.getItem('lang');
  if (storedLang) document.documentElement.lang = storedLang;
</script>
```

### 3.5 Language dropdown

Placed in the nav, right of the dark mode toggle. A custom button+dropdown (Alpine `x-data`) showing the current language name. Supported languages list is a build-time constant array — adding a new language requires only adding a new translations file and adding it to the list.

```
[ EN ▾ ]   ← current language button
  English ✓
  Türkçe
```

### 3.6 Event content language switching

**Event cards (TimelineTrack / EventCard):**

EventCard is a static Astro component — its title and summary are rendered as HTML at build time, not by Alpine. The correct approach is to **pre-render both languages** in the static HTML and use Alpine `x-show` to toggle visibility, exactly matching the detail page pattern.

EventCard receives `title_tr` and `summary_tr` as optional props (sourced from `event.data.translations?.tr`). It renders both:

```astro
<!-- English title (always rendered; default visible) -->
<span x-show="$store.i18n.lang !== 'tr'">{event.title}</span>
<!-- Turkish title (pre-rendered; shown when lang === 'tr') -->
{title_tr && <span x-show="$store.i18n.lang === 'tr'" x-cloak>{title_tr}</span>}
```

Same pattern for `summary`. If `title_tr` is absent, the English title is shown regardless of language.

The event index (`buildEventIndex`) is extended to include `title_tr` and `summary_tr` when present. These are **not used for card rendering** but are concatenated into `searchText` so search works in Turkish. Example: `searchText = [e.title, e.summary, e.translations?.tr?.title ?? '', e.translations?.tr?.summary ?? '', ...tags].join(' ').toLowerCase()`.

**Event detail pages (`/event/[slug].astro`):**
- Both English and Turkish title, summary, and body are pre-rendered in the HTML.
- `x-show="$store.i18n.lang !== 'tr'"` / `x-show="$store.i18n.lang === 'tr'"` controls which version is visible.
- English is always rendered (for SEO and as fallback).
- When `translations.tr.body` is absent: the Turkish section shows only the translated title and summary, then falls back to the English body prose with a visible note (rendered in both languages: "Extended content available in English only" / "Genişletilmiş içerik yalnızca İngilizce olarak mevcuttur"). This prevents a blank detail page.

**Category labels (CategoryBadge):**

CategoryBadge is a static component. The `label_tr` value is a build-time prop. The Astro template interpolates both values directly into the `x-text` expression string:

```astro
---
// label = "War & Conflict", labelTr = "Savaş ve Çatışma"
---
<span x-text={`$store.i18n.lang === 'tr' ? '${labelTr}' : '${label}'`}>{label}</span>
```

The text content `{label}` serves as the pre-Alpine fallback (visible before JS loads).

> **Constraint:** category and country label strings (both English and translated) must not contain single quotes. The build-time template literal `'${labelTr}'` is not escaped. All labels in `categories.ts` and `countries.ts` must use typographic apostrophes (e.g. `"War & Conflict"`) or have single quotes replaced with `\'` in the Astro template. Implementors should sanitize by replacing `'` with `\\'` before interpolation: `` `'${label.replace(/'/g, "\\'")}'` ``.

**Country names (CountryFlag):** same pattern as CategoryBadge using `name` and `name_tr`.

**"Ongoing" label in EventCard:** rendered using `x-text="$store.i18n.t.ongoing_label"` on the span that currently shows the hardcoded string "Ongoing".

### 3.7 Extensibility

To add a third language (e.g. German):
1. Create `src/data/i18n/de.ts`.
2. Add `de` to the supported languages array in `Base.astro`.
3. Add `label_de` to categories and countries.
4. Add `translations.de` blocks to event YAMLs as needed.

---

## 4. UI Redesign

### 4.1 Colour palette

Replace the current cold gray palette with warm stone/slate tones.

| Token | Light | Dark |
|---|---|---|
| Page background | `stone-50` | `stone-950` |
| Card background | `white` | `stone-900` |
| Card border | `stone-200` | `stone-800` |
| Timeline line | `stone-300` | `stone-700` |
| Timeline dot | severity color | severity color |
| Muted text | `stone-500` | `stone-400` |
| Heading text | `stone-900` | `stone-100` |
| Body text | `stone-700` | `stone-300` |

Category and severity accent colors remain unchanged (sourced from data).

### 4.2 Year markers

Full-width editorial markers replacing the current inline pill:

- A large, decorative year number (`text-5xl font-black tracking-tight`) in `stone-200` / `stone-800` — visible but not competing with content.
- A full-width hairline border beneath it.
- `sticky top-14 z-10` with `backdrop-blur-sm` and semi-transparent background.

### 4.3 Timeline dots

- Dots colored by event severity (`info` → blue, `warning` → amber, `severe` → orange, `critical` → red) using inline `style`.
- Slightly larger: `w-3.5 h-3.5`.
- White/dark ring border for contrast against the line.

### 4.4 Event cards

- `rounded-xl` corners.
- `border-l-[3px]` severity accent.
- Hover: `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150`.
- Title: `text-lg font-semibold` with `leading-snug`.
- Date and severity on the same row, separated by `·`.
- Summary: `line-clamp-3` (was 2).
- Tags row: unchanged (category badges + country flags).

### 4.5 Filter sidebar

- Section headings separated by a thin `border-t border-stone-100 dark:border-stone-800 pt-4` instead of bare spacing.
- **Category filter**: pill-toggle buttons (replace checkboxes). Each pill shows the category color dot and label; selected state is a filled background using the category color.
- **Country filter**: searchable tag-input (replace `<select multiple>`). A text input filters the list; clicking an entry adds it as a removable tag above the input. Pure Alpine — no external library.
- All other controls (severity checkboxes, date range, ongoing toggle, reset) retain their current interaction patterns with the stone palette applied.

### 4.6 Nav additions

- Language dropdown added right of dark mode toggle.
- Nav height unchanged (`h-14`).

---

## 5. Files Changed

| File | Change |
|---|---|
| `src/data/i18n/types.ts` | New — `Translations` interface |
| `src/data/i18n/en.ts` | New — English strings |
| `src/data/i18n/tr.ts` | New — Turkish strings |
| `src/data/categories.ts` | Add `label_tr` to each entry |
| `src/data/countries.ts` | Add `name_tr` to each entry |
| `src/content/events/*.yaml` | Add `translations.tr` block to all 15 events |
| `src/content.config.ts` | Extend Zod schema with optional `translations` |
| `src/lib/filter-index.ts` | Add `title_tr`, `summary_tr` to `EventIndexRecord` |
| `src/layouts/Base.astro` | Add i18n store, translations JSON, language dropdown; stone palette |
| `src/components/EventCard.astro` | Pre-render EN+TR title/summary with `x-show` toggle; stone palette; UI polish |
| `src/components/TimelineTrack.astro` | Editorial year markers; severity-colored dots; stone palette |
| `src/components/FilterBar.astro` | Pill-toggle categories; tag-input countries; stone palette |
| `src/components/CategoryBadge.astro` | Stone palette; `x-text` label with i18n |
| `src/components/CountryFlag.astro` | `x-text` country name with i18n |
| `src/pages/index.astro` | Stone palette pass; i18n strings for header |
| `src/pages/event/[slug].astro` | Both-language content blocks; stone palette |
| `src/pages/category/[slug].astro` | i18n string for page description |
| `src/pages/country/[slug].astro` | i18n string for page description |

---

## 6. Out of Scope

- SEO per-language (Turkish content not separately indexed — `lang` attribute on `<html>` will be updated dynamically but no `/tr/` URL prefix).
- Machine translation API integration — all Turkish content provided manually.
- Adding languages beyond Turkish in this iteration.
