# Timeline Website — Implementation Specification

> **For the implementing LLM:** This document is self-contained. Read it fully before writing a single line of code. Sections marked ⚠️ contain constraints that are easy to violate; treat them as hard requirements.

---

## 1. Project Overview

Build a static, publicly accessible website that displays historical and ongoing world events on a visual timeline. Events are organised by category and country/region. The site compiles to flat HTML at build time — no server, no database, and no React/Vue/Svelte application runtime. Alpine.js is allowed only as a minimal progressive-enhancement layer.

### Core goals

- **Lean:** No server. No database. Pure static output deployable to any CDN.
- **Beautiful:** Clean, readable, visually engaging timeline with well-considered typography and colour.
- **Maintainable:** Adding a new event = creating one YAML file. No code changes required.
- **Fast:** Sub-second load times worldwide via CDN edge delivery.
- **Open:** All data is human-readable plain text in Git. Full audit trail of every change.

---

## 2. Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Astro | 4.x | Static output mode (`output: 'static'`) |
| Styling | Tailwind CSS | 3.x | Via `@astrojs/tailwind` integration |
| Interactivity | Alpine.js | 3.x | CDN include, no build step |
| Markdown rendering | marked | 12.x | Build-time only; installed as dev dependency |
| Data format | YAML + Markdown | — | Parsed via Astro content collections |
| Deployment | Cloudflare Pages | — | Free tier, git-push CI/CD |
| Package manager | pnpm | latest | Preferred over npm for speed |

**Do not introduce React, Vue, Svelte, or any other component framework.** Astro's `.astro` component syntax is sufficient for all templating needs.

---

## 3. Project File Structure

```
timeline/
├── public/
│   ├── favicon.svg
│   └── images/events/          # Optional event images
├── src/
│   ├── components/
│   │   ├── EventCard.astro
│   │   ├── TimelineTrack.astro
│   │   ├── FilterBar.astro
│   │   ├── CategoryBadge.astro
│   │   └── CountryFlag.astro
│   ├── content/
│   │   ├── config.ts           # Zod schema definitions
│   │   └── events/             # One YAML file per event
│   │       ├── 1941-holocaust.yaml
│   │       ├── 1994-rwanda-genocide.yaml
│   │       └── ...
│   ├── data/
│   │   ├── categories.yaml     # Master category list with colours
│   │   └── countries.yaml      # Master country list with ISO codes
│   ├── lib/
│   │   ├── dates.ts            # Date parsing and normalisation helpers
│   │   ├── filter-index.ts     # Build-time event index assembly
│   │   └── markdown.ts         # Markdown rendering utility
│   ├── layouts/
│   │   └── Base.astro          # HTML shell, meta tags, nav
│   ├── pages/
│   │   ├── index.astro         # Main timeline view
│   │   ├── event/
│   │   │   └── [slug].astro    # Individual event detail page
│   │   ├── category/
│   │   │   └── [slug].astro    # Events filtered by category
│   │   └── country/
│   │       └── [slug].astro    # Events filtered by country
│   └── styles/
│       └── global.css          # Minimal global overrides
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## 4. Data Schema

### 4.1 Event YAML Schema

Each event lives in `src/content/events/`. Filename format: `YYYY-slug-describing-event.yaml`.

```yaml
# src/content/events/1994-rwanda-genocide.yaml

title: "Rwandan Genocide"
date: "1994-04-07"               # Required. Use one of: YYYY, YYYY-MM, YYYY-MM-DD
date_end: "1994-07-15"           # Optional end date for multi-day/month events
date_display: "April–July 1994"  # Optional human-readable override for display
approximate: false               # true = date is uncertain; renders with a ~ prefix

summary: >
  In approximately 100 days, an estimated 500,000 to 800,000 Tutsi and moderate
  Hutu were killed in a systematic campaign orchestrated by Hutu extremists.

body: |
  Extended Markdown content rendered on the detail page. Can include
  multiple paragraphs, context, aftermath, and significance.

categories:
  - genocide
  - war-conflict
  - human-rights

countries:
  - RW             # ISO 3166-1 alpha-2 codes

region: "Sub-Saharan Africa"     # Optional broader geographic region

tags:
  - ethnic-violence
  - UN-failure
  - Cold-War-aftermath

severity: critical               # info | warning | severe | critical — controls accent colour
ongoing: false                   # true = event has not concluded

sources:
  - label: "UN report on the Rwandan genocide"
    url: "https://example.com"
  - label: "Human Rights Watch documentation"
    url: "https://example.com"

image:
  src: "/images/events/rwanda-1994.jpg"    # Optional. Place in public/images/events/
  alt: "Description for screen readers"
  credit: "Photo credit / source"
```

**Date rule:** `date` and `date_end` are plain strings, not parsed dates. Accept only `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`, then normalise at build time for sorting and filtering. Using `z.coerce.date()` will reject partial formats — do not use it.

### 4.2 Zod Schema (`src/content/config.ts`)

```typescript
import { defineCollection, z } from 'astro:content';

const eventDate = z.string().regex(
  /^(\d{4}|\d{4}-\d{2}|\d{4}-\d{2}-\d{2})$/,
  'Use YYYY, YYYY-MM, or YYYY-MM-DD'
);

const events = defineCollection({
  type: 'data',
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
  }),
});

export const collections = { events };
```

### 4.3 Date Helpers (`src/lib/dates.ts`)

```typescript
export function normalizeEventDate(input: string): Date {
  if (/^\d{4}$/.test(input)) return new Date(`${input}-01-01T00:00:00Z`);
  if (/^\d{4}-\d{2}$/.test(input)) return new Date(`${input}-01T00:00:00Z`);
  return new Date(`${input}T00:00:00Z`);
}

export function extractEventYear(input: string): number {
  return Number.parseInt(input.slice(0, 4), 10);
}
```

### 4.4 Markdown Rendering (`src/lib/markdown.ts`)

The `body` field is Markdown stored as a YAML block string, rendered at build time on the event detail page. Raw HTML is disabled. Supported features: paragraphs, headings, lists, links, and emphasis only.

```typescript
import { marked } from 'marked';

marked.setOptions({ breaks: true });

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown) as string;
}
```

In the event detail page, render the returned HTML with `set:html` inside a Tailwind `prose` wrapper:

```astro
<div class="prose dark:prose-invert max-w-none" set:html={renderMarkdown(event.data.body)} />
```

### 4.5 Event Index (`src/lib/filter-index.ts`)

This module assembles the compact, filter-ready index embedded in the page at build time. It is the single source of truth for all client-side filtering — cards are never queried for `data-*` attributes.

```typescript
import { extractEventYear } from './dates';

export type EventIndexRecord = {
  slug: string;
  title: string;
  summary: string;
  searchText: string;    // pre-lowercased: title + summary + tags + region
  categories: string[];
  countries: string[];
  severity: 'info' | 'warning' | 'severe' | 'critical';
  yearFrom: number;
  yearTo: number;        // equals yearFrom when date_end is absent
  ongoing: boolean;
};

export function buildEventIndex(events: any[]): EventIndexRecord[] {
  return events.map(({ slug, data: e }) => {
    const yearFrom = extractEventYear(e.date);
    const yearTo   = e.date_end ? extractEventYear(e.date_end) : yearFrom;
    const searchText = [e.title, e.summary, ...(e.tags ?? []), e.region ?? '']
      .join(' ')
      .toLowerCase();
    return {
      slug,
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

### 4.6 Categories (`src/data/categories.yaml`)

```yaml
- slug: genocide
  label: "Genocide"
  color: "#7c1d1d"

- slug: war-conflict
  label: "War & Conflict"
  color: "#7c3a1d"

- slug: human-rights
  label: "Human Rights"
  color: "#1e3a5f"

- slug: environment
  label: "Environment & Climate"
  color: "#14532d"

- slug: economics
  label: "Economics & Finance"
  color: "#3b2f6b"

- slug: political
  label: "Political"
  color: "#4a3000"

- slug: science-tech
  label: "Science & Technology"
  color: "#1a3a4a"

- slug: pandemic
  label: "Pandemic & Health"
  color: "#2d1a4a"
```

### 4.7 Countries (`src/data/countries.yaml`)

```yaml
- code: RW
  name: "Rwanda"
  flag: "🇷🇼"
  region: "Sub-Saharan Africa"

- code: IQ
  name: "Iraq"
  flag: "🇮🇶"
  region: "Middle East"

# Expand to the full set of countries needed for seed data
```

---

## 5. Pages & Routing

### 5.1 Index page (`src/pages/index.astro`)

The main page. Fetches all events from the content collection, sorts them by date descending (most recent first), builds the event index via `buildEventIndex`, and renders `FilterBar` and `TimelineTrack`.

The built index is embedded once in the page as a JSON script tag:

```astro
<script type="application/json" id="event-index" set:html={JSON.stringify(eventIndex)} />
```

Alpine reads and parses this once during `init()`. Filter state is restored from the URL hash on load and kept in sync on every change.

### 5.2 Event detail page (`src/pages/event/[slug].astro`)

Rendered statically for every event at build time via `getStaticPaths()`. Displays: title, date (with `date_display` override if present), `body` rendered as HTML prose, source links, related events (same category or country), and a back-link to the timeline.

### 5.3 Category page (`src/pages/category/[slug].astro`)

Pre-rendered for every category slug. Shows all events in that category. Visually identical to the filtered index view.

### 5.4 Country page (`src/pages/country/[slug].astro`)

Pre-rendered for every ISO country code that appears in at least one event.

---

## 6. Components

### 6.1 `FilterBar.astro`

Alpine.js-powered filter controls. All state lives in a single `x-data` object on a parent `<div>`. Emits no custom events — the timeline reacts by reading `visibleSlugs` from the same Alpine component.

**Filter controls:**

| Control | Type | Default |
|---|---|---|
| Search | Text input | `''` |
| Category | Multi-select checkboxes with coloured badges | all shown |
| Country | Searchable tag-style multi-select | all shown |
| Severity | Checkbox group (`info` / `warning` / `severe` / `critical`) | all shown |
| Date range | Two number inputs (year from / year to) | unconstrained |
| Ongoing only | Toggle switch | off |
| Reset | Button | — |

**Alpine state shape:**

```javascript
{
  search: '',
  categories: [],    // empty array = show all
  countries: [],
  severities: [],
  yearFrom: null,
  yearTo: null,
  ongoingOnly: false,
  visibleSlugs: new Set(),
  index: [],
}
```

### 6.2 `TimelineTrack.astro`

Renders the visual timeline. Receives all events as a prop. Each `<article>` card carries the event slug in a `data-slug` attribute and uses Alpine's `x-show` to react to `visibleSlugs`:

```html
<article
  data-slug="1994-rwanda-genocide"
  x-show="$data.visibleSlugs.has('1994-rwanda-genocide')"
  x-transition
>
  <!-- card content -->
</article>
```

`$data` refers to the parent Alpine component's data object. The `TimelineTrack` component must be a descendant of the same `x-data` element that owns `visibleSlugs`. Do not use `$store` — keep all state in the single component.

**Visual structure:**

```
[Year marker: sticky, full-width]
│
├─● [Category badge] [Country flag]  Title
│         Date display
│         Summary excerpt (2 lines, truncated)
│
├─● ...next event
```

- A vertical line runs the full height of the timeline on the left.
- Year group labels are sticky (`position: sticky; top: 0`) with a blurred backdrop.
- Each card connects to the vertical line with a short horizontal connector and a dot.
- Cards are full-width on mobile; offset right of the line on desktop.

### 6.3 `EventCard.astro`

Receives a single event object. Renders: title, date, category badges, country flags, severity left-border accent, and a two-line summary. Links to `/event/[slug]`.

**Severity left-border colours:**

| Severity | Colour |
|---|---|
| `info` | `#3b82f6` (blue-500) |
| `warning` | `#f59e0b` (amber-500) |
| `severe` | `#f97316` (orange-500) |
| `critical` | `#ef4444` (red-500) |

Because Tailwind purges dynamic class names, apply the border colour via inline `style` using the severity value, not a dynamic class string.

### 6.4 `CategoryBadge.astro`

Pill-shaped badge. Receives a category slug, looks up its label and colour from the categories data, renders with that background colour and white text.

### 6.5 `CountryFlag.astro`

Renders a flag emoji and country name. Wraps the emoji in `<span role="img" aria-label="{name} flag">`. Falls back to the raw ISO code if the country is not in the master list.

---

## 7. Filtering Logic (Alpine.js)

**Do not read `data-*` attributes from the DOM to filter cards.** Filter the in-memory index; update `visibleSlugs`; cards react via `x-show`.

### 7.1 Initialisation

```javascript
init() {
  this.index = JSON.parse(document.getElementById('event-index').textContent);
  this.restoreFromHash();
  this.recomputeVisible();
  this.$watch('search',     () => { this.recomputeVisible(); this.syncHash(); });
  this.$watch('categories', () => { this.recomputeVisible(); this.syncHash(); });
  this.$watch('countries',  () => { this.recomputeVisible(); this.syncHash(); });
  this.$watch('severities', () => { this.recomputeVisible(); this.syncHash(); });
  this.$watch('yearFrom',   () => { this.recomputeVisible(); this.syncHash(); });
  this.$watch('yearTo',     () => { this.recomputeVisible(); this.syncHash(); });
  this.$watch('ongoingOnly',() => { this.recomputeVisible(); this.syncHash(); });
  window.addEventListener('hashchange', () => {
    this.restoreFromHash();
    this.recomputeVisible();
  });
},
```

### 7.2 Recompute

```javascript
recomputeVisible() {
  const visible = new Set();
  for (const event of this.index) {
    if (this.matchesEvent(event)) visible.add(event.slug);
  }
  this.visibleSlugs = visible;
},
```

### 7.3 Matching logic

```javascript
matchesEvent(event) {
  if (this.search.trim()) {
    if (!event.searchText.includes(this.search.toLowerCase())) return false;
  }
  if (this.categories.length > 0) {
    if (!this.categories.some(c => event.categories.includes(c))) return false;
  }
  if (this.countries.length > 0) {
    if (!this.countries.some(c => event.countries.includes(c))) return false;
  }
  if (this.severities.length > 0) {
    if (!this.severities.includes(event.severity)) return false;
  }
  if (this.yearFrom !== null && event.yearTo   < this.yearFrom) return false;
  if (this.yearTo   !== null && event.yearFrom > this.yearTo)   return false;
  if (this.ongoingOnly && !event.ongoing) return false;
  return true;
},
```

### 7.4 URL hash format

```
#search=war&categories=genocide,war-conflict&countries=RW,US&severity=critical,severe&yearFrom=1990&yearTo=2020&ongoing=true
```

Encoding rules:
- `search`: plain string
- `categories`, `countries`, `severity`: comma-separated values
- `yearFrom`, `yearTo`: integers
- `ongoing`: present as `true` only when the toggle is on; omit otherwise

Hash rules:
- The hash is the single source of truth for shareable, deep-linkable filter state.
- On page load, restore full filter state from the hash before first render.
- Use `history.replaceState`, not `pushState`, to avoid polluting the browser's back stack.
- Updating a filter must never reload the page.

### 7.5 Scalability note

A linear scan over a compact in-memory index is fast and sufficient for up to a few hundred events. If the dataset grows into the thousands, add year buckets and inverted category/country indices — but this is not required for the initial version.

---

## 8. Design System

### 8.1 Typography

- **Font:** Inter (Google Fonts). Load with `<link rel="preconnect">` and `font-display: swap`.
- **Base size:** 16px. Use Tailwind's default type scale throughout.
- **Body text:** `text-gray-700` / `dark:text-gray-300`.
- **Headings:** `text-gray-900` / `dark:text-gray-100`.

### 8.2 Colour tokens

Use Tailwind semantic colours. Hardcode hex only for category and severity accents, which originate from YAML data.

| Token | Light | Dark |
|---|---|---|
| Page background | `gray-50` | `gray-950` |
| Card background | `white` | `gray-900` |
| Card border | `gray-200` | `gray-800` |
| Timeline line | `gray-300` | `gray-700` |
| Timeline dot | `gray-400` | `gray-600` |
| Muted text | `gray-500` | `gray-400` |

### 8.3 Dark mode

Use Tailwind's `class` strategy. On first load, apply `dark` to `<html>` based on `prefers-color-scheme`. Persist the user's manual toggle to `localStorage` and re-apply on subsequent loads. Inline this script in `<head>` to prevent flash:

```html
<script>
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
</script>
```

### 8.4 Layout

- Max content width: `max-w-4xl` (896px), centred.
- Card padding: `p-5` mobile, `p-6` desktop.
- Timeline connector: `ml-8` mobile, `ml-16` desktop.
- Year markers: `position: sticky; top: 0` with `backdrop-blur-sm` and a semi-transparent background.

### 8.5 Responsive breakpoints

| Breakpoint | Behaviour |
|---|---|
| `< 640px` | Single column. Timeline line flush left. Filter bar hidden behind a "Filters" button. |
| `640px – 1024px` | Timeline line at `left: 2rem`. Cards offset right. Filter bar inline above timeline. |
| `> 1024px` | Two-column layout: sticky filter sidebar (`w-72`) on the left; timeline fills the remainder. |

**Desktop sidebar:**

```
┌──────────────────┬────────────────────────────────────┐
│  Filters         │  Timeline                          │
│  (sticky)        │                                    │
│                  │  [Year 2023]                        │
│  Search          │  ● Event card                      │
│  Categories      │  ● Event card                      │
│  Countries       │                                    │
│  Severity        │  [Year 2022]                        │
│  Date range      │  ● Event card                      │
│  Ongoing         │                                    │
│  Reset           │                                    │
└──────────────────┴────────────────────────────────────┘
```

Sidebar: `w-72 sticky top-6 max-h-screen overflow-y-auto`.

---

## 9. SEO & Meta

Every page must include the following in `Base.astro`:

```astro
---
const { title, description, canonicalUrl, image } = Astro.props;
---
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
</head>
```

- Event pages: use `summary` as the meta description.
- Category/country pages: generate a description such as `"All events related to Genocide on the World Events Timeline."`.

---

## 10. Configuration Files

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
  site: 'https://your-domain.pages.dev',  // replace before deploy
});
```

```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

---

## 11. Seed Data

Populate at least **15 events** across at least 5 categories and 10 countries, spanning the 1940s to the present. Write full, realistic `summary` and `body` content for every event — placeholder text is not acceptable.

| Event | Year | Categories | Countries |
|---|---|---|---|
| Holocaust | 1941–1945 | genocide, war-conflict | DE, PL |
| Hiroshima atomic bombing | 1945 | war-conflict | JP |
| Partition of India | 1947 | political, human-rights | IN, PK |
| Korean War | 1950–1953 | war-conflict | KR, KP |
| Cuban Missile Crisis | 1962 | political | CU, US |
| Cultural Revolution | 1966–1976 | political, human-rights | CN |
| Rwandan Genocide | 1994 | genocide, human-rights | RW |
| Srebrenica massacre | 1995 | genocide, war-conflict | BA |
| 9/11 attacks | 2001 | war-conflict, political | US |
| Iraq War | 2003 | war-conflict | IQ |
| 2004 Indian Ocean tsunami | 2004 | environment | ID, TH, LK |
| 2008 financial crisis | 2008 | economics | — |
| Arab Spring | 2010–2012 | political, human-rights | EG, TN, SY |
| COVID-19 pandemic | 2020 | pandemic | — |
| Russia's invasion of Ukraine | 2022 | war-conflict | UA, RU |

---

## 12. Deployment (Cloudflare Pages)

1. Push the repository to GitHub or GitLab.
2. In Cloudflare Pages → Create a project → Connect the repository.
3. Build settings:
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Node version environment variable:** `NODE_VERSION=20`
4. Every push to `main` triggers a build and deploy automatically.
5. Every pull request gets an isolated preview deployment.

---

## 13. Performance Requirements

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 95 |
| Lighthouse Accessibility | ≥ 90 |
| First Contentful Paint | < 1.2s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | < 200ms |
| JavaScript (uncompressed) | < 50 KB (Alpine CDN only) |
| CSS (uncompressed) | < 20 KB |

---

## 14. Accessibility Requirements

- All images have meaningful `alt` text.
- All interactive elements are keyboard-navigable with visible focus rings (`focus-visible`).
- Colour is never the sole indicator of meaning — severity levels use both colour and a text label or icon.
- Skip-to-content link as the first element of every page.
- Timeline is wrapped in `<main>`; filters in `<aside aria-label="Filters">`.
- Country flags: `<span role="img" aria-label="Rwanda flag">🇷🇼</span>`.

---

## 15. Implementation Order

Follow this order exactly. Validate each step before proceeding.

1. Scaffold Astro project with Tailwind. Confirm `pnpm dev` starts cleanly.
2. Define Zod schema in `src/content/config.ts`. Confirm Astro validates it on startup.
3. Create `src/lib/dates.ts`, `filter-index.ts`, and `markdown.ts`.
4. Create at least 5 seed YAML event files, plus `categories.yaml` and `countries.yaml`.
5. Build `Base.astro` — HTML shell, nav, dark mode script, meta tags.
6. Build `EventCard.astro` — static, no filtering.
7. Build `TimelineTrack.astro` — static rendering of all events with year grouping.
8. Build `index.astro` — renders all events; embed the event index JSON.
9. Build `FilterBar.astro` — all Alpine state and controls wired.
10. Wire filtering — add `x-show="$data.visibleSlugs.has(slug)"` to each card; confirm filter, hash sync, and restore all work end-to-end.
11. Build `/event/[slug].astro` detail page.
12. Build `/category/[slug].astro` and `/country/[slug].astro` pages.
13. Add remaining seed data (15+ events total, full content).
14. SEO pass — meta tags, Open Graph, canonical URLs on all pages.
15. Accessibility pass — ARIA labels, keyboard nav, focus rings, skip link.
16. Performance pass — image optimisation, font preloading, verify Lighthouse scores.

---

## 16. Hard Constraints

These are non-negotiable. Do not deviate.

- ⚠️ **No server-side rendering.** `output: 'static'` in Astro config. No API routes.
- ⚠️ **No React, Vue, or Svelte.** Astro components + Alpine.js only.
- ⚠️ **No database.** All data lives in YAML files under `src/content/` and `src/data/`.
- ⚠️ **No hardcoded events in components.** All events come from the content collection.
- ⚠️ **No DOM-based filtering.** Filter the in-memory index; never read `data-*` attributes.
- ⚠️ **Alpine.js loaded from CDN** (`cdn.jsdelivr.net`), not bundled.
- ⚠️ **`marked` is a build-time dependency only.** Never import it in client-side code.
- ⚠️ **Inter loaded from Google Fonts** with `preconnect` and `font-display: swap`.
- ⚠️ **Filter state is hash-encoded.** Must survive page refresh and be deep-linkable.
- ⚠️ **Dark mode must work.** Every component must render correctly in both modes.
- ⚠️ **TypeScript throughout.** All `.astro` frontmatter and `.ts` files use strict TypeScript.

---

## 17. Deliverables

1. The complete file tree with all files fully populated and functional.
2. A `README.md` covering:
   - Local development: `pnpm install && pnpm dev`
   - How to add an event (minimal YAML template)
   - How to add a category
   - How to deploy to Cloudflare Pages
3. All 15+ seed events with complete, realistic content — no placeholder text.
