# Timeline Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Astro website that displays historical world events on a filterable timeline, deployable to Cloudflare Pages with zero server-side runtime.

**Architecture:** Astro (static output) generates all pages at build time from YAML content collections. Alpine.js handles client-side filtering against a JSON index embedded in the page — no DOM scraping, no API calls. Tailwind provides styling with dark mode via the `class` strategy.

**Tech Stack:** Astro 4.x, Tailwind CSS 3.x (`@astrojs/tailwind`), Alpine.js 3.x (CDN), `marked` 12.x (build-time only), YAML content collections, pnpm, Cloudflare Pages

**Spec:** `timeline-website-spec-final.md`

**Verification commands:**
- Type check: `pnpm astro check`
- Build: `pnpm build`
- Dev server: `pnpm dev`

---

## File Map

| File | Purpose |
|---|---|
| `astro.config.mjs` | Astro config — static output, Tailwind integration |
| `tailwind.config.mjs` | Tailwind config — class dark mode, Inter font, content paths |
| `tsconfig.json` | TypeScript strict config extending astro/tsconfigs/strict |
| `src/content/config.ts` | Zod schema for events content collection |
| `src/lib/dates.ts` | `normalizeEventDate` and `extractEventYear` helpers |
| `src/lib/filter-index.ts` | `buildEventIndex` — compiles per-event filter records |
| `src/lib/markdown.ts` | `renderMarkdown` — build-time `marked` wrapper |
| `src/data/categories.yaml` | Master category list with slugs and hex colours |
| `src/data/countries.yaml` | Master country list with ISO codes, flag emoji, region |
| `src/content/events/*.yaml` | One YAML file per event (15+ total) |
| `src/layouts/Base.astro` | HTML shell: `<head>`, dark mode script, skip link, nav, footer |
| `src/components/CategoryBadge.astro` | Pill badge — looks up label+colour from categories data |
| `src/components/CountryFlag.astro` | Flag emoji + country name with ARIA label |
| `src/components/EventCard.astro` | Single event card — severity border, badges, summary |
| `src/components/TimelineTrack.astro` | Year-grouped vertical timeline with Alpine `x-show` |
| `src/components/FilterBar.astro` | Alpine filter controls — all state, hash sync, recompute |
| `src/pages/index.astro` | Main timeline page — embeds event index JSON |
| `src/pages/event/[slug].astro` | Individual event detail (static paths) |
| `src/pages/category/[slug].astro` | Events filtered by category (static paths) |
| `src/pages/country/[slug].astro` | Events filtered by country ISO code (static paths) |
| `src/styles/global.css` | Minimal global CSS overrides |
| `public/favicon.svg` | SVG favicon |
| `README.md` | Local dev, add-event guide, deploy instructions |

---

## Task 1: Scaffold Astro Project with Tailwind

**Files:**
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `tsconfig.json`
- Create: `package.json`
- Create: `src/styles/global.css`
- Create: `public/favicon.svg`

- [ ] **Step 1: Initialise the Astro project at repo root**

```bash
cd /Users/acbiler/dev/projects/chronos
pnpm create astro@latest . --template minimal --typescript strict --no-git --install
```

When prompted: choose "An empty project", TypeScript strict, install dependencies.

- [ ] **Step 2: Add Tailwind integration**

```bash
pnpm astro add tailwind --yes
```

- [ ] **Step 3: Add marked as dev dependency**

```bash
pnpm add -D marked@^12.0.0
```

- [ ] **Step 4: Replace `astro.config.mjs` with spec version**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
  site: 'https://your-domain.pages.dev',
});
```

- [ ] **Step 5: Replace `tailwind.config.mjs` with spec version**

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

- [ ] **Step 6: Replace `tsconfig.json` with spec version**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

- [ ] **Step 7: Create `src/styles/global.css`**

```css
/* Minimal global overrides — use Tailwind classes in components */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Create `public/favicon.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#1e3a5f"/>
  <rect x="6" y="10" width="2" height="12" rx="1" fill="#93c5fd"/>
  <circle cx="7" cy="10" r="2.5" fill="#3b82f6"/>
  <circle cx="7" cy="16" r="2.5" fill="#3b82f6"/>
  <circle cx="7" cy="22" r="2.5" fill="#3b82f6"/>
  <rect x="11" y="9" width="15" height="2" rx="1" fill="#93c5fd"/>
  <rect x="11" y="15" width="11" height="2" rx="1" fill="#93c5fd"/>
  <rect x="11" y="21" width="13" height="2" rx="1" fill="#93c5fd"/>
</svg>
```

- [ ] **Step 9: Verify dev server starts cleanly**

```bash
pnpm dev
```

Expected: Server running at `http://localhost:4321`, no errors in terminal.

- [ ] **Step 10: Verify build completes**

```bash
pnpm build
```

Expected: `dist/` directory created, exit code 0.

- [ ] **Step 11: Commit**

```bash
git add astro.config.mjs tailwind.config.mjs tsconfig.json package.json pnpm-lock.yaml src/styles/global.css public/favicon.svg
git commit -m "feat: scaffold Astro project with Tailwind"
```

---

## Task 2: Content Schema and Lib Utilities

**Files:**
- Create: `src/content/config.ts`
- Create: `src/lib/dates.ts`
- Create: `src/lib/filter-index.ts`
- Create: `src/lib/markdown.ts`

- [ ] **Step 1: Create `src/content/config.ts` with Zod schema**

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

- [ ] **Step 2: Create `src/lib/dates.ts`**

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

- [ ] **Step 3: Create `src/lib/filter-index.ts`**

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

- [ ] **Step 4: Create `src/lib/markdown.ts`**

```typescript
import { marked } from 'marked';

marked.setOptions({ breaks: true });

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown) as string;
}
```

- [ ] **Step 5: Run type check**

```bash
pnpm astro check
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/content/config.ts src/lib/dates.ts src/lib/filter-index.ts src/lib/markdown.ts
git commit -m "feat: add content schema and lib utilities"
```

---

## Task 3: Static Data Files

**Files:**
- Create: `src/data/categories.yaml`
- Create: `src/data/countries.yaml`

- [ ] **Step 1: Create `src/data/categories.yaml`**

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

- [ ] **Step 2: Create `src/data/countries.yaml`**

Include all countries referenced by the seed events (DE, PL, JP, IN, PK, KR, KP, CU, US, CN, RW, BA, IQ, ID, TH, LK, EG, TN, SY, UA, RU and a global placeholder):

```yaml
- code: DE
  name: "Germany"
  flag: "🇩🇪"
  region: "Europe"

- code: PL
  name: "Poland"
  flag: "🇵🇱"
  region: "Europe"

- code: JP
  name: "Japan"
  flag: "🇯🇵"
  region: "East Asia"

- code: IN
  name: "India"
  flag: "🇮🇳"
  region: "South Asia"

- code: PK
  name: "Pakistan"
  flag: "🇵🇰"
  region: "South Asia"

- code: KR
  name: "South Korea"
  flag: "🇰🇷"
  region: "East Asia"

- code: KP
  name: "North Korea"
  flag: "🇰🇵"
  region: "East Asia"

- code: CU
  name: "Cuba"
  flag: "🇨🇺"
  region: "Caribbean"

- code: US
  name: "United States"
  flag: "🇺🇸"
  region: "North America"

- code: CN
  name: "China"
  flag: "🇨🇳"
  region: "East Asia"

- code: RW
  name: "Rwanda"
  flag: "🇷🇼"
  region: "Sub-Saharan Africa"

- code: BA
  name: "Bosnia and Herzegovina"
  flag: "🇧🇦"
  region: "Europe"

- code: IQ
  name: "Iraq"
  flag: "🇮🇶"
  region: "Middle East"

- code: ID
  name: "Indonesia"
  flag: "🇮🇩"
  region: "Southeast Asia"

- code: TH
  name: "Thailand"
  flag: "🇹🇭"
  region: "Southeast Asia"

- code: LK
  name: "Sri Lanka"
  flag: "🇱🇰"
  region: "South Asia"

- code: EG
  name: "Egypt"
  flag: "🇪🇬"
  region: "Middle East / North Africa"

- code: TN
  name: "Tunisia"
  flag: "🇹🇳"
  region: "Middle East / North Africa"

- code: SY
  name: "Syria"
  flag: "🇸🇾"
  region: "Middle East"

- code: UA
  name: "Ukraine"
  flag: "🇺🇦"
  region: "Europe"

- code: RU
  name: "Russia"
  flag: "🇷🇺"
  region: "Europe / Asia"
```

- [ ] **Step 3: Commit**

```bash
git add src/data/categories.yaml src/data/countries.yaml
git commit -m "feat: add categories and countries data"
```

---

## Task 4: First 5 Seed Events

**Files:**
- Create: `src/content/events/1941-holocaust.yaml`
- Create: `src/content/events/1945-hiroshima.yaml`
- Create: `src/content/events/1947-partition-of-india.yaml`
- Create: `src/content/events/1962-cuban-missile-crisis.yaml`
- Create: `src/content/events/1994-rwanda-genocide.yaml`

- [ ] **Step 1: Create `src/content/events/1941-holocaust.yaml`**

```yaml
title: "The Holocaust"
date: "1941-12"
date_end: "1945-05-08"
date_display: "1941–1945"
approximate: false

summary: >
  The Holocaust was the state-sponsored, systematic persecution and murder of
  six million Jews by the Nazi regime and its collaborators. Between 1933 and
  1945, the Nazis, who came to power in Germany in January 1933, believed
  that Germans were "racially superior" and that the Jews were "inferior."

body: |
  The Holocaust began with discriminatory laws in Germany in the 1930s and
  escalated with the mass deportation of European Jews to six extermination
  camps — Auschwitz-Birkenau, Belzec, Chelmno, Majdanek, Sobibor, and
  Treblinka — all located in occupied Poland.

  Approximately 1.1 million people were murdered at Auschwitz-Birkenau alone.
  Beyond the Jewish victims, the Nazis also systematically murdered Roma,
  people with disabilities, Soviet POWs, Polish civilians, homosexuals,
  Jehovah's Witnesses, and political opponents.

  The Nuremberg trials (1945–1946) prosecuted surviving Nazi leaders for war
  crimes and crimes against humanity, establishing the legal precedent that
  individuals could be held accountable under international law. The trials
  also contributed to the drafting of the 1948 UN Convention on Genocide.

  The term "genocide" was coined by Polish-Jewish lawyer Raphael Lemkin
  specifically in response to the Holocaust, and was formally adopted into
  international law in 1948.

categories:
  - genocide
  - war-conflict

countries:
  - DE
  - PL

region: "Europe"

tags:
  - Nazi Germany
  - antisemitism
  - extermination camps
  - World War II
  - crimes against humanity

severity: critical
ongoing: false

sources:
  - label: "United States Holocaust Memorial Museum"
    url: "https://www.ushmm.org/information/about-the-museum"
  - label: "Yad Vashem World Holocaust Remembrance Center"
    url: "https://www.yadvashem.org"
```

- [ ] **Step 2: Create `src/content/events/1945-hiroshima.yaml`**

```yaml
title: "Atomic Bombing of Hiroshima"
date: "1945-08-06"
date_end: "1945-08-09"
date_display: "August 6–9, 1945"
approximate: false

summary: >
  On August 6, 1945, the United States dropped the first atomic bomb ever
  used in warfare on the Japanese city of Hiroshima, killing an estimated
  70,000–80,000 people instantly and tens of thousands more from radiation
  exposure in the months that followed. A second bomb fell on Nagasaki three
  days later.

body: |
  The bomb, nicknamed "Little Boy," was a uranium gun-type device dropped
  from the B-29 Superfortress *Enola Gay*. The blast and subsequent firestorm
  destroyed approximately 69% of Hiroshima's buildings. By the end of 1945,
  total deaths attributable to the bombing were estimated at 90,000–166,000.

  Three days later, on August 9, the plutonium implosion bomb "Fat Man" was
  detonated over Nagasaki, killing an estimated 40,000–80,000 people. Japan
  announced its surrender on August 15, 1945, formally ending World War II.

  The bombings remain the only wartime use of nuclear weapons in history and
  sparked a global debate about nuclear deterrence, arms control, and the
  ethics of targeting civilian populations. The hibakusha (atomic bomb
  survivors) have been central voices in the international disarmament
  movement for eight decades.

  The 1968 Nuclear Non-Proliferation Treaty and subsequent arms-control
  agreements trace their moral urgency in part to the human devastation
  witnessed at Hiroshima and Nagasaki.

categories:
  - war-conflict

countries:
  - JP

region: "East Asia"

tags:
  - nuclear weapons
  - World War II
  - United States
  - civilian casualties
  - disarmament

severity: critical
ongoing: false

sources:
  - label: "Hiroshima Peace Memorial Museum"
    url: "https://hpmmuseum.jp"
  - label: "Atomic Heritage Foundation"
    url: "https://www.atomicheritage.org"
```

- [ ] **Step 3: Create `src/content/events/1947-partition-of-india.yaml`**

```yaml
title: "Partition of India"
date: "1947-08-14"
date_end: "1947-08-15"
date_display: "August 1947"
approximate: false

summary: >
  The end of British rule over the Indian subcontinent in August 1947 brought
  the simultaneous creation of two independent nations — India and Pakistan —
  and triggered one of the largest and bloodiest mass migrations in human
  history, with between 200,000 and 2 million people killed and 10–20 million
  displaced.

body: |
  The Partition was the direct result of the British Indian Empire's
  dissolution. The boundary between India and Pakistan — the Radcliffe Line —
  was drawn by Sir Cyril Radcliffe in just five weeks, with little local
  consultation, dividing Punjab and Bengal between the two new states.

  As Hindus, Muslims, and Sikhs found themselves on the "wrong" side of new
  borders, communal violence erupted on an enormous scale. Convoys of refugees
  hundreds of miles long moved in both directions. Women and girls were
  abducted and assaulted in massive numbers; entire villages were massacred.

  The displacement of up to 14–17 million people remains the largest mass
  migration in recorded history. The trauma of Partition continues to shape
  the political relationship between India and Pakistan, including three
  subsequent wars and the unresolved Kashmir conflict, which has been a
  flashpoint ever since.

categories:
  - political
  - human-rights

countries:
  - IN
  - PK

region: "South Asia"

tags:
  - British Empire
  - decolonisation
  - communal violence
  - mass migration
  - religious conflict

severity: critical
ongoing: false

sources:
  - label: "1947 Partition Archive"
    url: "https://www.1947partitionarchive.org"
  - label: "Partition: India, Pakistan and the price of freedom"
    url: "https://www.bbc.co.uk/programmes/b08tq7f0"
```

- [ ] **Step 4: Create `src/content/events/1962-cuban-missile-crisis.yaml`**

```yaml
title: "Cuban Missile Crisis"
date: "1962-10-16"
date_end: "1962-10-28"
date_display: "October 16–28, 1962"
approximate: false

summary: >
  For thirteen days in October 1962, the United States and Soviet Union came
  closer to nuclear war than at any other point in history, after US
  reconnaissance aircraft discovered Soviet ballistic missiles being installed
  in Cuba. The crisis was resolved through direct negotiations and mutual
  concessions.

body: |
  The crisis began when U-2 spy plane photographs revealed Soviet medium- and
  intermediate-range ballistic missile sites under construction in Cuba.
  President Kennedy convened an emergency advisory group (ExComm) to consider
  options ranging from a naval blockade to air strikes or an invasion.

  On October 22, Kennedy announced a naval "quarantine" of Cuba and demanded
  the Soviets remove the missiles. Soviet ships carrying additional military
  equipment approached the naval cordon before ultimately turning back.

  The resolution came through back-channel diplomacy: the USSR agreed to
  dismantle and remove the missiles in exchange for a US pledge not to invade
  Cuba, and a secret agreement to remove US Jupiter missiles from Turkey.

  The crisis accelerated arms-control diplomacy. The "hotline" between the
  White House and the Kremlin was established in 1963, and the Partial Nuclear
  Test Ban Treaty was signed the same year. The crisis remains a foundational
  case study in nuclear deterrence, crisis management, and diplomatic
  de-escalation.

categories:
  - political

countries:
  - CU
  - US

region: "Caribbean"

tags:
  - Cold War
  - nuclear deterrence
  - Kennedy
  - Khrushchev
  - arms control

severity: critical
ongoing: false

sources:
  - label: "John F. Kennedy Presidential Library — Cuban Missile Crisis"
    url: "https://www.jfklibrary.org/learn/about-jfk/jfk-in-history/cuban-missile-crisis"
  - label: "National Security Archive — Cuban Missile Crisis"
    url: "https://nsarchive.gwu.edu/project/cuban-missile-crisis"
```

- [ ] **Step 5: Create `src/content/events/1994-rwanda-genocide.yaml`**

```yaml
title: "Rwandan Genocide"
date: "1994-04-07"
date_end: "1994-07-15"
date_display: "April–July 1994"
approximate: false

summary: >
  In approximately 100 days, an estimated 500,000 to 800,000 Tutsi and
  moderate Hutu were killed in a systematic campaign orchestrated by Hutu
  extremist militias. The genocide unfolded while the international community
  largely stood aside.

body: |
  The genocide was triggered by the assassination of President Juvénal
  Habyarimana on April 6, 1994, when his plane was shot down over Kigali.
  Within hours, the Interahamwe militia and elements of the Rwandan Armed
  Forces began systematically killing Tutsi civilians, roadblocks were erected
  across the country, and radio broadcasts urged the murder of the "inyenzi"
  (cockroaches — the dehumanising term used for Tutsi).

  The UN peacekeeping force in Rwanda, UNAMIR, was forbidden by the Security
  Council from using force to protect civilians. Belgian peacekeepers were
  withdrawn after ten were murdered. The United States and other Western
  governments deliberately avoided using the word "genocide" to circumvent
  obligations under the 1948 Genocide Convention.

  The genocide ended only when the Rwandan Patriotic Front (RPF), a
  predominantly Tutsi rebel force, defeated the government and militia forces
  and captured Kigali in July 1994. In the aftermath, over two million Hutus
  fled to neighbouring Zaire (now DRC), fearing reprisals.

  The International Criminal Tribunal for Rwanda (ICTR) prosecuted 93
  individuals for genocide, crimes against humanity, and war crimes. The
  Rwandan government's gacaca court system tried over 1.9 million cases at the
  community level.

  The genocide has become a defining moment in debates about humanitarian
  intervention, the Responsibility to Protect doctrine, and the failures of
  multilateral institutions.

categories:
  - genocide
  - human-rights

countries:
  - RW

region: "Sub-Saharan Africa"

tags:
  - ethnic violence
  - UN failure
  - humanitarian intervention
  - international criminal law

severity: critical
ongoing: false

sources:
  - label: "International Criminal Tribunal for Rwanda"
    url: "https://unictr.irmct.org"
  - label: "Human Rights Watch — Leave None to Tell the Story"
    url: "https://www.hrw.org/reports/1999/rwanda"
```

- [ ] **Step 6: Run Astro check to validate schema compliance**

```bash
pnpm astro check
```

Expected: No errors. All 5 YAML files validated against the Zod schema.

- [ ] **Step 7: Verify build**

```bash
pnpm build
```

Expected: Clean build, `dist/` populated.

- [ ] **Step 8: Commit**

```bash
git add src/content/events/
git commit -m "feat: add first 5 seed events"
```

---

## Task 5: Base Layout Component

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create `src/layouts/Base.astro`**

```astro
---
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
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  </head>
  <body class="bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 font-sans min-h-screen">
    <!-- Skip to content link -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none"
    >
      Skip to content
    </a>

    <!-- Navigation -->
    <nav class="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a href="/" class="text-gray-900 dark:text-gray-100 font-semibold text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          World Events Timeline
        </a>
        <button
          id="theme-toggle"
          class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          aria-label="Toggle dark mode"
          onclick="
            const html = document.documentElement;
            const isDark = html.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
          "
        >
          <!-- Sun icon (shown in dark mode) -->
          <svg class="hidden dark:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" />
          </svg>
          <!-- Moon icon (shown in light mode) -->
          <svg class="block dark:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </nav>

    <slot />

    <footer class="border-t border-gray-200 dark:border-gray-800 mt-16 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
        World Events Timeline — historical data for educational purposes.
      </div>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Run type check**

```bash
pnpm astro check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat: add Base layout with dark mode and nav"
```

---

## Task 6: Atomic Components

**Files:**
- Create: `src/components/CategoryBadge.astro`
- Create: `src/components/CountryFlag.astro`

- [ ] **Step 1: Create `src/components/CategoryBadge.astro`**

```astro
---
import categoriesRaw from '../data/categories.yaml';

interface Category {
  slug: string;
  label: string;
  color: string;
}

interface Props {
  slug: string;
}

const categories = categoriesRaw as Category[];
const { slug } = Astro.props;
const category = categories.find((c) => c.slug === slug);
const label = category?.label ?? slug;
const color = category?.color ?? '#6b7280';
---
<span
  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
  style={`background-color: ${color};`}
>
  {label}
</span>
```

- [ ] **Step 2: Create `src/components/CountryFlag.astro`**

```astro
---
import countriesRaw from '../data/countries.yaml';

interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
}

interface Props {
  code: string;
}

const countries = countriesRaw as Country[];
const { code } = Astro.props;
const country = countries.find((c) => c.code === code);
const name = country?.name ?? code;
const flag = country?.flag;
---
<span class="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
  {flag
    ? <span role="img" aria-label={`${name} flag`}>{flag}</span>
    : null}
  <span>{name}</span>
</span>
```

- [ ] **Step 3: Run type check**

```bash
pnpm astro check
```

Expected: No errors. Note: Astro may require `allowImportingTsExtensions` — if YAML imports fail, add `declare module '*.yaml'` to a `src/env.d.ts` file:

```typescript
// src/env.d.ts (add if it doesn't exist or append to existing)
/// <reference types="astro/client" />
declare module '*.yaml' {
  const data: unknown;
  export default data;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/CategoryBadge.astro src/components/CountryFlag.astro src/env.d.ts
git commit -m "feat: add CategoryBadge and CountryFlag components"
```

---

## Task 7: EventCard Component

**Files:**
- Create: `src/components/EventCard.astro`

- [ ] **Step 1: Create `src/components/EventCard.astro`**

```astro
---
import CategoryBadge from './CategoryBadge.astro';
import CountryFlag from './CountryFlag.astro';
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

const severityLabels: Record<string, string> = {
  info:     'Info',
  warning:  'Warning',
  severe:   'Severe',
  critical: 'Critical',
};

const borderColor = severityColors[event.severity] ?? severityColors.info;
const severityLabel = severityLabels[event.severity] ?? event.severity;

const dateDisplay = event.date_display
  ?? (event.date_end ? `${event.date.slice(0,4)}–${event.date_end.slice(0,4)}` : event.date);
const displayDate = event.approximate ? `~${dateDisplay}` : dateDisplay;
---
<article
  data-slug={slug}
  class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 md:p-6 hover:shadow-md transition-shadow border-l-4"
  style={`border-left-color: ${borderColor};`}
>
  <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
    <h3 class="text-gray-900 dark:text-gray-100 font-semibold text-base leading-snug">
      <a href={`/event/${slug}`} class="hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded">
        {event.title}
      </a>
    </h3>
    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap" aria-label={`Severity: ${severityLabel}`}>
      {severityLabel}
    </span>
  </div>

  <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">{displayDate}</p>

  <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">{event.summary}</p>

  <div class="flex flex-wrap gap-2 items-center">
    {event.categories.map((cat) => (
      <CategoryBadge slug={cat} />
    ))}
    {event.countries.length > 0 && (
      <span class="text-gray-300 dark:text-gray-700" aria-hidden="true">·</span>
    )}
    {event.countries.map((code) => (
      <CountryFlag code={code} />
    ))}
    {event.ongoing && (
      <span class="ml-auto text-xs font-medium text-orange-600 dark:text-orange-400">Ongoing</span>
    )}
  </div>
</article>
```

- [ ] **Step 2: Run type check**

```bash
pnpm astro check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/EventCard.astro
git commit -m "feat: add EventCard component"
```

---

## Task 8: TimelineTrack Component

**Files:**
- Create: `src/components/TimelineTrack.astro`

- [ ] **Step 1: Create `src/components/TimelineTrack.astro`**

The component groups events by year and uses Alpine `x-show` to react to `visibleSlugs`. It must be a descendant of the `x-data` element that owns `visibleSlugs`.

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
}

interface EventEntry {
  slug: string;
  data: EventData;
}

interface Props {
  events: EventEntry[];
}

const { events } = Astro.props;

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
    class="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"
    aria-hidden="true"
  ></div>

  {yearGroups.map(([year, yearEvents]) => (
    <div>
      <!-- Year marker (sticky) -->
      <div
        class="sticky top-14 z-10 -mx-4 sm:-mx-0 mb-4"
        x-show={`${JSON.stringify(yearEvents.map(e => e.slug))}.some(s => $data.visibleSlugs.has(s))`}
      >
        <div class="inline-flex items-center pl-8 md:pl-16 pr-4 py-2 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-sm">
          <span class="text-lg font-bold text-gray-900 dark:text-gray-100">{year}</span>
        </div>
      </div>

      <!-- Events for this year -->
      <div class="space-y-4 mb-8 pl-10 md:pl-20">
        {yearEvents.map((event) => (
          <div
            class="relative"
            data-slug={event.slug}
            x-show={`$data.visibleSlugs.has('${event.slug}')`}
            x-transition
          >
            <!-- Connector dot -->
            <div
              class="absolute -left-6 md:-left-12 top-5 w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 border-2 border-gray-50 dark:border-gray-950"
              aria-hidden="true"
            ></div>
            <!-- Connector line (horizontal) -->
            <div
              class="absolute -left-5 md:-left-10 top-6 w-5 md:w-10 h-0.5 bg-gray-300 dark:bg-gray-700"
              aria-hidden="true"
            ></div>
            <EventCard slug={event.slug} data={event.data} />
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Run type check**

```bash
pnpm astro check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/TimelineTrack.astro
git commit -m "feat: add TimelineTrack component with year grouping"
```

---

## Task 9: FilterBar Component

**Files:**
- Create: `src/components/FilterBar.astro`

The FilterBar owns all Alpine.js state. It reads the embedded event index JSON on init, computes `visibleSlugs`, syncs state to/from URL hash, and exposes `visibleSlugs` to sibling `TimelineTrack` via the shared `x-data` scope.

- [ ] **Step 1: Create `src/components/FilterBar.astro`**

```astro
---
import categoriesRaw from '../data/categories.yaml';
import countriesRaw from '../data/countries.yaml';

interface Category { slug: string; label: string; color: string; }
interface Country { code: string; name: string; flag: string; }

const categories = categoriesRaw as Category[];
const countries = countriesRaw as Country[];
---
<aside
  aria-label="Filters"
  x-data="{
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

    syncHash() {
      const params = new URLSearchParams();
      if (this.search.trim())       params.set('search',     this.search.trim());
      if (this.categories.length)   params.set('categories', this.categories.join(','));
      if (this.countries.length)    params.set('countries',  this.countries.join(','));
      if (this.severities.length)   params.set('severity',   this.severities.join(','));
      if (this.yearFrom !== null)   params.set('yearFrom',   String(this.yearFrom));
      if (this.yearTo   !== null)   params.set('yearTo',     String(this.yearTo));
      if (this.ongoingOnly)         params.set('ongoing',    'true');
      const hash = params.toString() ? '#' + params.toString() : ' ';
      history.replaceState(null, '', hash);
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
      this.search      = '';
      this.categories  = [];
      this.countries   = [];
      this.severities  = [];
      this.yearFrom    = null;
      this.yearTo      = null;
      this.ongoingOnly = false;
    },
  }"
  class="lg:w-72 lg:flex-shrink-0"
>
  <!-- Mobile toggle button (< lg) -->
  <div class="lg:hidden mb-4">
    <button
      @click="mobileOpen = !mobileOpen"
      class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M7 12h10M11 20h2" />
      </svg>
      <span x-text="mobileOpen ? 'Hide Filters' : 'Show Filters'">Show Filters</span>
      <span class="ml-auto text-xs text-gray-500 dark:text-gray-400" x-text="`(${visibleSlugs.size} events)`"></span>
    </button>
  </div>

  <!-- Filter panel -->
  <div
    x-show="mobileOpen || window.innerWidth >= 1024"
    x-transition
    class="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5"
  >
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
      <span class="hidden lg:block text-xs text-gray-500 dark:text-gray-400" x-text="`${visibleSlugs.size} events`"></span>
    </div>

    <!-- Search -->
    <div>
      <label for="filter-search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
      <input
        id="filter-search"
        type="text"
        x-model="search"
        placeholder="Search events…"
        class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Categories -->
    <div>
      <fieldset>
        <legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</legend>
        <div class="space-y-2">
          {categories.map((cat) => (
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                :value={`'${cat.slug}'`}
                x-model="categories"
                class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span
                class="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={`background-color: ${cat.color};`}
                aria-hidden="true"
              ></span>
              <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>

    <!-- Severity -->
    <div>
      <fieldset>
        <legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</legend>
        <div class="space-y-2">
          {[
            { value: 'info',     label: 'Info',     color: '#3b82f6' },
            { value: 'warning',  label: 'Warning',  color: '#f59e0b' },
            { value: 'severe',   label: 'Severe',   color: '#f97316' },
            { value: 'critical', label: 'Critical', color: '#ef4444' },
          ].map((sev) => (
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                :value={`'${sev.value}'`}
                x-model="severities"
                class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span
                class="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={`background-color: ${sev.color};`}
                aria-hidden="true"
              ></span>
              <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                {sev.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>

    <!-- Date range -->
    <div>
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</p>
      <div class="flex gap-2 items-center">
        <label class="sr-only" for="filter-year-from">From year</label>
        <input
          id="filter-year-from"
          type="number"
          x-model.number="yearFrom"
          placeholder="From"
          min="1900"
          max="2100"
          class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="text-gray-400 dark:text-gray-600 text-sm flex-shrink-0">–</span>
        <label class="sr-only" for="filter-year-to">To year</label>
        <input
          id="filter-year-to"
          type="number"
          x-model.number="yearTo"
          placeholder="To"
          min="1900"
          max="2100"
          class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Countries -->
    <div>
      <label for="filter-country" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Countries</label>
      <select
        id="filter-country"
        multiple
        x-model="countries"
        class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
      >
        {countries.map((country) => (
          <option value={country.code}>{country.flag} {country.name}</option>
        ))}
      </select>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Ctrl/Cmd+click to select multiple</p>
    </div>

    <!-- Ongoing toggle -->
    <div class="flex items-center justify-between">
      <label for="filter-ongoing" class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Ongoing events only
      </label>
      <button
        id="filter-ongoing"
        role="switch"
        :aria-checked="ongoingOnly.toString()"
        @click="ongoingOnly = !ongoingOnly"
        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        :class="ongoingOnly ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="ongoingOnly ? 'translate-x-5' : 'translate-x-0'"
        ></span>
      </button>
    </div>

    <!-- Reset button -->
    <button
      @click="resetFilters()"
      class="w-full px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      Reset Filters
    </button>
  </div>
</aside>
```

- [ ] **Step 2: Run type check**

```bash
pnpm astro check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/FilterBar.astro
git commit -m "feat: add FilterBar component with Alpine.js state"
```

---

## Task 10: Index Page — Wire Everything Together

**Files:**
- Modify: `src/pages/index.astro`

This is the most critical integration step. The `x-data` must wrap both `FilterBar` and `TimelineTrack` so they share the same Alpine scope.

- [ ] **Step 1: Replace `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import FilterBar from '../components/FilterBar.astro';
import TimelineTrack from '../components/TimelineTrack.astro';
import { getCollection } from 'astro:content';
import { buildEventIndex } from '../lib/filter-index';
import { normalizeEventDate } from '../lib/dates';

const allEvents = await getCollection('events');

// Sort descending for initial server-rendered order
const sortedEvents = [...allEvents].sort(
  (a, b) =>
    normalizeEventDate(b.data.date).getTime() -
    normalizeEventDate(a.data.date).getTime()
);

const eventIndex = buildEventIndex(allEvents);

const siteUrl = import.meta.env.SITE ?? 'https://your-domain.pages.dev';
---
<Base
  title="World Events Timeline"
  description="A visual timeline of historical and ongoing world events, organised by category, country, and date."
  canonicalUrl={siteUrl}
>
  <!-- Embed event index for Alpine -->
  <script type="application/json" id="event-index" set:html={JSON.stringify(eventIndex)} />

  <main id="main-content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">World Events Timeline</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Historical and ongoing events — {allEvents.length} total
      </p>
    </header>

    <!--
      IMPORTANT: FilterBar owns the x-data scope.
      TimelineTrack is a descendant and reads $data.visibleSlugs.
      Both must be inside the same x-data wrapper.
    -->
    <div class="flex flex-col lg:flex-row gap-8">
      <FilterBar />
      <div class="flex-1 min-w-0">
        <TimelineTrack events={sortedEvents} />
      </div>
    </div>
  </main>
</Base>
```

**IMPORTANT:** The `FilterBar` component's root `<aside>` element contains `x-data`. The `TimelineTrack` component is a sibling inside the same flex container. For `$data.visibleSlugs` to be accessible inside `TimelineTrack`, the `x-data` must be on an ancestor of both. Move the `x-data` from `FilterBar`'s `<aside>` to the wrapping `<div class="flex ...">` in `index.astro`.

Revise `index.astro` flex wrapper:

```astro
<div
  class="flex flex-col lg:flex-row gap-8"
  x-data="{
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
      window.addEventListener('hashchange', () => { this.restoreFromHash(); this.recomputeVisible(); });
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
      const hash = params.toString() ? '#' + params.toString() : ' ';
      history.replaceState(null, '', hash);
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
  }"
>
  <FilterBar />
  <div class="flex-1 min-w-0">
    <TimelineTrack events={sortedEvents} />
  </div>
</div>
```

And remove the `x-data` from `FilterBar.astro`'s root `<aside>` element — the `<aside>` keeps its attributes but loses `x-data`. All Alpine bindings inside `FilterBar.astro` (`x-model`, `@click`, etc.) still work because they now inherit the ancestor's Alpine scope.

- [ ] **Step 2: Run build**

```bash
pnpm build
```

Expected: Clean build with all pages generated.

- [ ] **Step 3: Test filtering manually**

```bash
pnpm dev
```

Open `http://localhost:4321`. Verify:
- All events are visible on load
- Typing in search hides non-matching events
- Checking a category hides events from other categories
- Refreshing with a hash (e.g. `#search=Rwanda`) restores filter state

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/components/FilterBar.astro
git commit -m "feat: wire index page with Alpine filtering and hash sync"
```

---

## Task 11: Event Detail Page

**Files:**
- Create: `src/pages/event/[slug].astro`

- [ ] **Step 1: Create `src/pages/event/[slug].astro`**

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

// Related events: same category or country, not this event
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
      >
        ← Back to Timeline
      </a>
    </nav>

    <article>
      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-wrap gap-2 mb-3">
          {data.categories.map((cat) => <CategoryBadge slug={cat} />)}
        </div>

        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {data.title}
        </h1>

        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
            {data.severity.charAt(0).toUpperCase() + data.severity.slice(1)}
          </span>
          {data.ongoing && (
            <span class="text-orange-600 dark:text-orange-400 font-medium">Ongoing</span>
          )}
        </div>

        <div class="flex flex-wrap gap-3 mt-3">
          {data.countries.map((code) => <CountryFlag code={code} />)}
          {data.region && (
            <span class="text-sm text-gray-500 dark:text-gray-400">{data.region}</span>
          )}
        </div>
      </header>

      <!-- Optional image -->
      {data.image && (
        <figure class="mb-8 rounded-xl overflow-hidden">
          <img
            src={data.image.src}
            alt={data.image.alt}
            class="w-full object-cover max-h-80"
            loading="lazy"
          />
          {data.image.credit && (
            <figcaption class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
              {data.image.credit}
            </figcaption>
          )}
        </figure>
      )}

      <!-- Summary lead -->
      <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-medium">
        {data.summary}
      </p>

      <!-- Body (Markdown) -->
      {data.body && (
        <div
          class="prose prose-gray dark:prose-invert max-w-none mb-8"
          set:html={renderMarkdown(data.body)}
        />
      )}

      <!-- Sources -->
      {data.sources.length > 0 && (
        <section class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800" aria-labelledby="sources-heading">
          <h2 id="sources-heading" class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            Sources
          </h2>
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
      <section class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800" aria-labelledby="related-heading">
        <h2 id="related-heading" class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Related Events
        </h2>
        <ul class="space-y-2">
          {related.map((e) => (
            <li>
              <a
                href={`/event/${e.id}`}
                class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
              >
                <span class="text-gray-400 dark:text-gray-600">{e.data.date.slice(0, 4)}</span>
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

- [ ] **Step 2: Run build**

```bash
pnpm build
```

Expected: A page generated for each event slug under `dist/event/`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/event/
git commit -m "feat: add event detail page"
```

---

## Task 12: Category and Country Pages

**Files:**
- Create: `src/pages/category/[slug].astro`
- Create: `src/pages/country/[slug].astro`

- [ ] **Step 1: Create `src/pages/category/[slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import EventCard from '../../components/EventCard.astro';
import { normalizeEventDate } from '../../lib/dates';
import categoriesRaw from '../../data/categories.yaml';

interface Category { slug: string; label: string; color: string; }

export async function getStaticPaths() {
  const categories = categoriesRaw as Category[];
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
      <a href="/" class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded">
        ← Back to Timeline
      </a>
    </nav>
    <header class="mb-8">
      <div
        class="inline-block w-4 h-4 rounded-full mb-3"
        style={`background-color: ${category.color};`}
        aria-hidden="true"
      ></div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{category.label}</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">{filtered.length} events</p>
    </header>
    <div class="space-y-4">
      {filtered.map((event) => (
        <EventCard slug={event.id} data={event.data} />
      ))}
    </div>
  </main>
</Base>
```

- [ ] **Step 2: Create `src/pages/country/[slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import EventCard from '../../components/EventCard.astro';
import CountryFlag from '../../components/CountryFlag.astro';
import { normalizeEventDate } from '../../lib/dates';
import countriesRaw from '../../data/countries.yaml';

interface Country { code: string; name: string; flag: string; region: string; }

export async function getStaticPaths() {
  const countries = countriesRaw as Country[];
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
      <a href="/" class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded">
        ← Back to Timeline
      </a>
    </nav>
    <header class="mb-8">
      <CountryFlag code={country.code} />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{country.name}</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">{filtered.length} events · {country.region}</p>
    </header>
    <div class="space-y-4">
      {filtered.map((event) => (
        <EventCard slug={event.id} data={event.data} />
      ))}
    </div>
  </main>
</Base>
```

- [ ] **Step 3: Run build**

```bash
pnpm build
```

Expected: Pages generated for every category and country that has at least one event.

- [ ] **Step 4: Commit**

```bash
git add src/pages/category/ src/pages/country/
git commit -m "feat: add category and country filtered pages"
```

---

## Task 13: Remaining 10 Seed Events

**Files:**
- Create: `src/content/events/1950-korean-war.yaml`
- Create: `src/content/events/1966-cultural-revolution.yaml`
- Create: `src/content/events/1995-srebrenica.yaml`
- Create: `src/content/events/2001-september-11.yaml`
- Create: `src/content/events/2003-iraq-war.yaml`
- Create: `src/content/events/2004-indian-ocean-tsunami.yaml`
- Create: `src/content/events/2008-financial-crisis.yaml`
- Create: `src/content/events/2010-arab-spring.yaml`
- Create: `src/content/events/2020-covid-pandemic.yaml`
- Create: `src/content/events/2022-russia-ukraine-invasion.yaml`

- [ ] **Step 1: Create `src/content/events/1950-korean-war.yaml`**

```yaml
title: "Korean War"
date: "1950-06-25"
date_end: "1953-07-27"
date_display: "1950–1953"
approximate: false

summary: >
  The Korean War began when North Korean forces, backed by the Soviet Union
  and China, invaded South Korea on June 25, 1950. A UN-mandated coalition led
  by the United States repelled the invasion, but three years of fighting left
  the peninsula divided at roughly the 38th parallel, with an armistice — not
  a peace treaty — still in force today.

body: |
  Following Japan's defeat in World War II, Korea was divided along the 38th
  parallel into Soviet- and American-occupied zones, which became the
  communist Democratic People's Republic of Korea in the north and the
  Republic of Korea in the south. Tensions escalated into full-scale war on
  June 25, 1950, when the Korean People's Army crossed the border with Soviet
  armour.

  UN Security Council Resolution 83 authorised military intervention (the
  USSR was boycotting the Council at the time). General Douglas MacArthur
  commanded UN forces and led a daring amphibious landing at Inchon in
  September 1950, rapidly pushing north toward the Chinese border. China
  entered the war in October 1950 with roughly 300,000 troops, forcing a
  UN retreat.

  The war settled into a bloody stalemate near the original 38th parallel for
  most of 1951–1953. An armistice was signed on July 27, 1953, creating the
  Demilitarized Zone (DMZ). Approximately 36,000 Americans, 137,000 South
  Koreans, and an estimated 1.5 million Chinese and North Korean soldiers
  died, along with roughly two million Korean civilians.

  No formal peace treaty has ever been signed. North Korea remains one of the
  world's most isolated states, and the armistice of 1953 remains technically
  the only legal instrument ending the fighting.

categories:
  - war-conflict

countries:
  - KR
  - KP

region: "East Asia"

tags:
  - Cold War
  - United Nations
  - China
  - armistice
  - division

severity: critical
ongoing: false

sources:
  - label: "Korean War Commemoration — U.S. Department of Defense"
    url: "https://www.defense.gov/Experience/Commemorations/Korean-War-70th/"
  - label: "Korean War — Britannica"
    url: "https://www.britannica.com/event/Korean-War"
```

- [ ] **Step 2: Create `src/content/events/1966-cultural-revolution.yaml`**

```yaml
title: "Chinese Cultural Revolution"
date: "1966-05"
date_end: "1976-10"
date_display: "1966–1976"
approximate: false

summary: >
  Launched by Mao Zedong in May 1966, the Cultural Revolution was a decade of
  violent political and social upheaval aimed at purging "bourgeois" elements
  from Chinese society. Red Guards destroyed cultural artefacts, persecuted
  intellectuals, and attacked "counter-revolutionaries," causing the deaths of
  hundreds of thousands to two million people.

body: |
  The Cultural Revolution emerged from Mao Zedong's desire to reassert his
  authority following the catastrophic Great Leap Forward. Mao mobilised
  young students — the Red Guards — who attacked teachers, officials, and
  anyone perceived as insufficiently revolutionary. Schools and universities
  were shut, intellectuals were sent to rural "re-education" camps, and
  religious sites and historical monuments were destroyed.

  Factional violence between rival Red Guard factions killed thousands. The
  People's Liberation Army eventually intervened to restore order. The most
  radical phase (1966–1969) gave way to a more controlled but still
  repressive period until Mao's death in September 1976. The Gang of Four,
  led by Mao's wife Jiang Qing, were arrested weeks later.

  The Chinese Communist Party officially assessed the Cultural Revolution in
  1981 as a "severe setback and loss for the Party and the people," attributing
  primary responsibility to Mao while preserving his overall legacy.
  Historians estimate 1–2 million direct deaths, with tens of millions more
  subjected to forced labour, imprisonment, and persecution.

categories:
  - political
  - human-rights

countries:
  - CN

region: "East Asia"

tags:
  - Mao Zedong
  - Red Guards
  - communism
  - political repression
  - China

severity: severe
ongoing: false

sources:
  - label: "Cultural Revolution — Harvard University Press"
    url: "https://www.hup.harvard.edu/catalog.php?isbn=9780674967946"
  - label: "Cultural Revolution — Britannica"
    url: "https://www.britannica.com/event/Cultural-Revolution"
```

- [ ] **Step 3: Create `src/content/events/1995-srebrenica.yaml`**

```yaml
title: "Srebrenica Massacre"
date: "1995-07-11"
date_end: "1995-07-22"
date_display: "July 1995"
approximate: false

summary: >
  In July 1995, Bosnian Serb forces under General Ratko Mladić systematically
  executed more than 8,000 Bosniak Muslim men and boys in and around Srebrenica,
  a UN-designated "safe area" in eastern Bosnia. It was the worst atrocity on
  European soil since the Holocaust.

body: |
  The Srebrenica massacre occurred at the end of the Bosnian War (1992–1995),
  in which Bosnian Serb forces pursued a campaign of ethnic cleansing against
  Bosniak (Bosnian Muslim) and Croat populations.

  When General Ratko Mladić's Army of Republika Srpska seized the town on
  July 11, 1995, some 25,000–30,000 Bosniaks — mostly women, children, and
  the elderly — sought refuge with the Dutch UN battalion (Dutchbat) stationed
  nearby. Men and boys between approximately 12 and 77 were systematically
  separated and killed; their bodies were buried in mass graves that were
  later bulldozed and relocated to conceal evidence.

  The Dutch UN peacekeepers, lacking the mandate and firepower to resist,
  handed over Bosniaks sheltering at their compound. NATO air strikes were
  repeatedly delayed by the UN chain of command.

  The International Criminal Tribunal for the Former Yugoslavia (ICTY) ruled
  the killings a genocide in 1999 and convicted Mladić (2017) and former
  Bosnian Serb President Radovan Karadžić (2016, upheld 2019) of genocide.
  The International Court of Justice also ruled in 2007 that genocide had
  been committed.

categories:
  - genocide
  - war-conflict

countries:
  - BA

region: "Europe"

tags:
  - Bosnia
  - ethnic cleansing
  - UN peacekeeping
  - ICTY
  - NATO failure

severity: critical
ongoing: false

sources:
  - label: "ICTY — Srebrenica case information"
    url: "https://www.icty.org/sid/324"
  - label: "Srebrenica Memorial Centre"
    url: "https://www.srebrenicamemorial.org"
```

- [ ] **Step 4: Create `src/content/events/2001-september-11.yaml`**

```yaml
title: "September 11 Attacks"
date: "2001-09-11"
approximate: false

summary: >
  On the morning of September 11, 2001, nineteen al-Qaeda hijackers seized
  four commercial aircraft in a coordinated attack on the United States. Two
  planes struck the World Trade Center towers in New York City, one hit the
  Pentagon, and a fourth crashed in Pennsylvania after passengers attempted to
  overpower the hijackers. Nearly 3,000 people were killed.

body: |
  The attacks were planned and ordered by al-Qaeda leader Osama bin Laden and
  executed by a 19-member cell of operatives. American Airlines Flight 11 and
  United Airlines Flight 175 struck the North and South towers of the World
  Trade Center; both towers collapsed within two hours. American Airlines
  Flight 77 struck the Pentagon in Arlington, Virginia. United Airlines
  Flight 93 crashed near Shanksville, Pennsylvania after passengers — alerted
  by phone calls about the other hijackings — attempted to retake control.

  In total, 2,977 victims were killed, making it the deadliest terrorist attack
  in history. The immediate response included a US invasion of Afghanistan to
  topple the Taliban government that harboured al-Qaeda, the passage of the
  USA PATRIOT Act, and the creation of the Department of Homeland Security.

  The attacks fundamentally reshaped US foreign and domestic policy. The
  "Global War on Terror" led to over two decades of military operations in
  Afghanistan and the 2003 invasion of Iraq. Civil liberties debates around
  mass surveillance, indefinite detention, and extraordinary rendition continue
  to echo in policy discussions today.

categories:
  - war-conflict
  - political

countries:
  - US

region: "North America"

tags:
  - terrorism
  - al-Qaeda
  - Osama bin Laden
  - War on Terror
  - aviation security

severity: critical
ongoing: false

sources:
  - label: "9/11 Commission Report"
    url: "https://9-11commission.gov/report/"
  - label: "National September 11 Memorial & Museum"
    url: "https://www.911memorial.org"
```

- [ ] **Step 5: Create `src/content/events/2003-iraq-war.yaml`**

```yaml
title: "Iraq War"
date: "2003-03-20"
date_end: "2011-12-18"
date_display: "2003–2011"
approximate: false

summary: >
  A US-led coalition invaded Iraq in March 2003, toppling Saddam Hussein's
  government within weeks on the stated premise that Iraq possessed weapons
  of mass destruction. No such weapons were found. The occupation triggered an
  insurgency and sectarian conflict that killed hundreds of thousands of
  Iraqis and destabilised the region for decades.

body: |
  The invasion was justified by the George W. Bush administration on grounds
  that Iraq held stockpiles of biological and chemical weapons and was seeking
  to acquire nuclear weapons. UN weapons inspectors, led by Hans Blix, were
  still conducting inspections and had found no evidence of WMD programmes
  when the US launched the invasion on March 20, 2003, without a second UN
  Security Council resolution.

  Saddam Hussein's government fell on April 9, 2003, when US forces entered
  Baghdad. The Coalition Provisional Authority dissolved the Iraqi Army and
  de-Baathified the government, moves later criticised for fuelling the
  insurgency by creating a large pool of unemployed, armed men with military
  training.

  By 2006, sectarian violence between Sunni and Shia factions had plunged Iraq
  into near-civil war. The "surge" of 30,000 additional US troops in 2007
  reduced violence but did not resolve underlying political divisions.

  The final US combat troops withdrew in December 2011. Estimates of Iraqi
  civilian deaths range from 150,000 to over 460,000, with an estimated
  4,500 US military deaths. The power vacuum contributed to the rise of the
  Islamic State (ISIS) in 2013–2014.

categories:
  - war-conflict

countries:
  - IQ

region: "Middle East"

tags:
  - WMD
  - George W. Bush
  - coalition
  - occupation
  - ISIS origins

severity: critical
ongoing: false

sources:
  - label: "Iraq Body Count Project"
    url: "https://www.iraqbodycount.org"
  - label: "Chilcot Inquiry Report (UK)"
    url: "https://webarchive.nationalarchives.gov.uk/ukgwa/20171123122743/http://www.iraqinquiry.org.uk/the-report/"
```

- [ ] **Step 6: Create `src/content/events/2004-indian-ocean-tsunami.yaml`**

```yaml
title: "2004 Indian Ocean Tsunami"
date: "2004-12-26"
approximate: false

summary: >
  A magnitude-9.1 undersea earthquake off the coast of Sumatra on December 26,
  2004 generated a series of massive tsunamis that struck 14 countries around
  the Indian Ocean, killing an estimated 227,898 people in one of the deadliest
  natural disasters in recorded history.

body: |
  The earthquake — the third-largest ever recorded — ruptured a 1,200-kilometre
  fault line under the Indian Ocean. The resulting tsunamis, some reaching
  heights of 30 metres, struck coastlines in Indonesia, Sri Lanka, India,
  Thailand, Somalia, Maldives, and beyond within hours.

  Indonesia bore the greatest death toll, with an estimated 168,000 killed,
  mostly in Aceh province. Sri Lanka lost approximately 35,000, India around
  12,400, and Thailand over 5,000, including a significant number of foreign
  tourists. Somalia recorded approximately 300 deaths 6,000 km from the
  epicentre.

  The disaster prompted the largest international humanitarian response in
  history at that time, with over US$14 billion in aid pledged. It also
  accelerated the creation of the Indian Ocean Tsunami Warning System,
  operational by 2006.

  The disaster spurred global debate about disaster preparedness, coastal
  development in tsunami-prone zones, and international coordination of
  early-warning systems.

categories:
  - environment

countries:
  - ID
  - TH
  - LK

region: "Southeast Asia / South Asia"

tags:
  - natural disaster
  - earthquake
  - humanitarian response
  - early warning systems

severity: critical
ongoing: false

sources:
  - label: "USGS — 2004 Sumatra–Andaman earthquake"
    url: "https://earthquake.usgs.gov/earthquakes/eventpage/usp000d6bf/executive"
  - label: "UNESCO Indian Ocean Tsunami Warning System"
    url: "https://www.ioc-tsunami.org"
```

- [ ] **Step 7: Create `src/content/events/2008-financial-crisis.yaml`**

```yaml
title: "2008 Global Financial Crisis"
date: "2008-09"
date_end: "2009-06"
date_display: "2008–2009"
approximate: true

summary: >
  The collapse of the US subprime mortgage market in 2007–2008 triggered a
  global financial crisis — the worst since the Great Depression. The failure
  of Lehman Brothers in September 2008 precipitated a worldwide credit freeze,
  stock market collapses, and recessions across advanced economies that cost
  tens of millions of jobs.

body: |
  Years of lax lending standards, complex mortgage-backed securities, and
  inadequate financial regulation created an enormous housing bubble in the
  United States. When housing prices peaked and began falling in 2006–2007,
  subprime mortgage defaults surged, causing catastrophic losses at financial
  institutions that held these instruments.

  The crisis reached its acute phase in September 2008. Fannie Mae and Freddie
  Mac were placed in government conservatorship. Lehman Brothers filed for
  bankruptcy on September 15, 2008 — the largest bankruptcy in US history.
  Merrill Lynch was sold to Bank of America. AIG required an $85 billion
  government bailout to prevent its collapse.

  The US government responded with the $700 billion Troubled Asset Relief
  Programme (TARP). The Federal Reserve cut interest rates to near zero and
  launched unprecedented quantitative-easing programmes. Similar measures
  were adopted by central banks worldwide.

  The crisis triggered the longest and deepest global recession since the
  1930s. Unemployment in the US peaked at 10% in October 2009; the Eurozone
  entered a prolonged sovereign-debt crisis that lasted until 2012–2013.
  Global GDP fell by approximately 2% in 2009. The Basel III banking
  regulations, implemented from 2010, were the most significant regulatory
  overhaul of the global banking system since the 1930s.

categories:
  - economics

countries: []

region: "Global"

tags:
  - Lehman Brothers
  - subprime mortgage
  - TARP
  - quantitative easing
  - Eurozone crisis

severity: severe
ongoing: false

sources:
  - label: "Financial Crisis Inquiry Commission Report"
    url: "https://fcic.law.stanford.edu/report"
  - label: "IMF — Global Financial Stability Report, 2008"
    url: "https://www.imf.org/en/Publications/GFSR"
```

- [ ] **Step 8: Create `src/content/events/2010-arab-spring.yaml`**

```yaml
title: "Arab Spring"
date: "2010-12"
date_end: "2012-12"
date_display: "2010–2012"
approximate: true

summary: >
  Beginning with Mohamed Bouazizi's self-immolation in Tunisia in December 2010,
  a wave of pro-democracy protests and uprisings swept the Arab world. The
  revolutions toppled long-standing leaders in Tunisia, Egypt, Libya, and Yemen,
  while triggering a devastating civil war in Syria that continues to this day.

body: |
  The Arab Spring began in Sidi Bouzid, Tunisia, when street vendor Mohamed
  Bouazizi set himself on fire on December 17, 2010, protesting police
  harassment and corruption. The act ignited mass demonstrations that drove
  President Zine El Abidine Ben Ali — in power for 23 years — from office in
  January 2011.

  In Egypt, 18 days of protest in Tahrir Square ended with President Hosni
  Mubarak's resignation on February 11, 2011, after 30 years in power. In
  Libya, an uprising against Muammar Gaddafi escalated into civil war; a NATO
  air campaign supported the rebels, and Gaddafi was captured and killed in
  October 2011. Yemen's President Ali Abdullah Saleh agreed to step down in
  2011 amid protests and an armed uprising.

  In Syria, peaceful protests were met with violent government crackdowns that
  spiralled into a full-scale civil war beginning in 2011, drawing in regional
  powers, jihadist groups, and eventually Russian military intervention. The
  conflict has killed an estimated 500,000 people and displaced over
  12 million.

  The initial optimism about democratic transition in the Arab world largely
  gave way to disillusionment: Egypt returned to military rule in 2013, Libya
  descended into prolonged factional conflict, and Yemen became the site of a
  catastrophic humanitarian crisis. Tunisia's democratic experiment was the
  notable exception, though it too has faced serious backsliding since 2021.

categories:
  - political
  - human-rights

countries:
  - EG
  - TN
  - SY

region: "Middle East / North Africa"

tags:
  - democracy
  - revolution
  - social media
  - civil war
  - protest

severity: severe
ongoing: true

sources:
  - label: "Arab Spring — Brookings Institution"
    url: "https://www.brookings.edu/research/the-arab-spring-five-years-later/"
  - label: "Syria conflict — UN OCHA"
    url: "https://www.unocha.org/syria"
```

- [ ] **Step 9: Create `src/content/events/2020-covid-pandemic.yaml`**

```yaml
title: "COVID-19 Pandemic"
date: "2020-01-30"
date_end: "2023-05-05"
date_display: "2020–2023"
approximate: false

summary: >
  The COVID-19 pandemic, caused by the SARS-CoV-2 coronavirus, was declared
  a Public Health Emergency of International Concern by the WHO on January 30,
  2020, and a pandemic on March 11, 2020. By the time the WHO ended the global
  health emergency in May 2023, the virus had killed an estimated 7 million
  people officially, with excess-mortality estimates ranging from 15 to 20 million.

body: |
  SARS-CoV-2 was first identified in Wuhan, China in late 2019. Within months
  it had spread globally, overwhelming healthcare systems in Italy, Spain, the
  United States, Brazil, and India. By April 2020, over one-third of the world's
  population was under some form of lockdown.

  The pandemic prompted the fastest vaccine development in history. The first
  mRNA vaccines — from Pfizer-BioNTech and Moderna — received emergency
  authorisation in December 2020, less than a year after the virus was
  sequenced. By mid-2023, over 13 billion vaccine doses had been administered
  globally.

  Economic disruption was severe. Global GDP contracted by 3.1% in 2020 — the
  deepest peacetime recession since the Great Depression. Governments spent
  an estimated $16 trillion in emergency fiscal support. Supply chain
  disruptions, combined with post-pandemic stimulus, contributed to the
  highest inflation rates in 40 years in 2021–2022.

  Long COVID — persistent symptoms in a subset of survivors — emerged as a
  significant public-health challenge. The pandemic also exposed deep
  inequalities in vaccine access between high- and low-income countries,
  renewing debates about intellectual property rights and global health
  governance.

categories:
  - pandemic

countries: []

region: "Global"

tags:
  - SARS-CoV-2
  - lockdown
  - mRNA vaccine
  - WHO
  - excess mortality

severity: critical
ongoing: false

sources:
  - label: "WHO COVID-19 Dashboard"
    url: "https://covid19.who.int"
  - label: "Our World in Data — COVID-19"
    url: "https://ourworldindata.org/coronavirus"
```

- [ ] **Step 10: Create `src/content/events/2022-russia-ukraine-invasion.yaml`**

```yaml
title: "Russia's Full-Scale Invasion of Ukraine"
date: "2022-02-24"
approximate: false

summary: >
  On February 24, 2022, Russia launched a full-scale invasion of Ukraine —
  the largest military offensive in Europe since World War II. The invasion
  followed Russia's seizure of Crimea in 2014 and support for separatists in
  eastern Ukraine. The conflict has caused tens of thousands of deaths and the
  displacement of over 14 million people.

body: |
  Russia had been massing troops on Ukraine's borders since late 2021. President
  Vladimir Putin, in a pre-invasion address, claimed Ukraine had no legitimate
  statehood and accused NATO of threatening Russian security. The invasion began
  in the early hours of February 24, 2022, with missile strikes on cities across
  Ukraine and ground forces advancing from Russian territory, Crimea, and Belarus.

  The anticipated rapid collapse of Ukrainian resistance did not materialise.
  Russia's initial assault on Kyiv was repelled, and Ukrainian forces — supplied
  with weapons from NATO members — launched successful counter-offensives that
  recaptured significant territory in Kharkiv Oblast in September 2022 and
  Kherson city in November 2022.

  Western nations imposed the most extensive sanctions ever applied to a major
  economy, targeting Russia's central bank reserves, energy exports, and key
  individuals. The European Union and United States provided over $100 billion
  in military and economic aid to Ukraine by end 2023.

  The conflict has caused tens of thousands of military deaths on both sides and
  the displacement of over 14 million Ukrainians — the largest refugee crisis in
  Europe since World War II. The war's outcome remains unresolved; fighting
  continues along a contested front line in eastern and southern Ukraine.

categories:
  - war-conflict

countries:
  - UA
  - RU

region: "Europe"

tags:
  - NATO
  - Putin
  - sanctions
  - refugee crisis
  - European security

severity: critical
ongoing: true

sources:
  - label: "UN Human Rights Monitoring Mission in Ukraine"
    url: "https://ukraine.un.org/en/sdgs/16"
  - label: "Ukraine Support Tracker — Kiel Institute"
    url: "https://www.ifw-kiel.de/topics/war-against-ukraine/ukraine-support-tracker/"
```

- [ ] **Step 11: Run build to validate all 15 events**

```bash
pnpm build
```

Expected: 15 event pages under `dist/event/`, all category and country pages populated.

- [ ] **Step 12: Commit**

```bash
git add src/content/events/
git commit -m "feat: add remaining 10 seed events (15 total)"
```

---

## Task 14: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
# World Events Timeline (Chronos)

A static website displaying historical and ongoing world events on a visual timeline.
Built with Astro, Tailwind CSS, and Alpine.js. Deployed to Cloudflare Pages.

## Local Development

```bash
pnpm install
pnpm dev         # starts dev server at http://localhost:4321
pnpm build       # builds to dist/
pnpm preview     # previews the built output
```

## Adding an Event

1. Create a new file in `src/content/events/` with the filename format `YYYY-slug.yaml`.
2. Populate it with the following structure (all fields marked `#required` are mandatory):

```yaml
title: "Event Title"          # required
date: "YYYY-MM-DD"            # required — YYYY, YYYY-MM, or YYYY-MM-DD
date_end: "YYYY-MM-DD"        # optional end date
date_display: "Human label"   # optional display override
approximate: false            # true adds a ~ prefix to the date

summary: >                    # required — one paragraph shown in the card
  Summary text here.

body: |                       # optional — Markdown, shown on detail page
  Extended content here.

categories:                   # required — slugs from src/data/categories.yaml
  - war-conflict

countries:                    # required — ISO 3166-1 alpha-2 codes
  - US

severity: info                # info | warning | severe | critical
ongoing: false                # true = event has not concluded

sources:
  - label: "Source name"
    url: "https://example.com"
```

3. Run `pnpm astro check` — the Zod schema will validate your file and report any errors.

## Adding a Category

1. Open `src/data/categories.yaml`.
2. Add a new entry:

```yaml
- slug: your-category-slug
  label: "Human-Readable Label"
  color: "#hexcolor"
```

3. Events can now use this slug in their `categories` array.

## Deployment (Cloudflare Pages)

1. Push the repository to GitHub.
2. In Cloudflare Pages → **Create a project** → connect the repository.
3. Build settings:
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Environment variable:** `NODE_VERSION=20`
4. Every push to `main` triggers a build and deploy automatically.
5. Every pull request gets an isolated preview deployment.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: write README with local dev and event-authoring guide"
```

---

## Task 15: SEO and Accessibility Pass

**Files:**
- Review: `src/layouts/Base.astro` — verify all meta tags
- Review: `src/components/CountryFlag.astro` — verify ARIA
- Review: `src/components/EventCard.astro` — verify focus rings
- Review: all pages — verify skip link, `<main>`, `<aside aria-label>`

- [ ] **Step 1: Verify all pages have correct meta in Base.astro**

Open `src/layouts/Base.astro` and confirm:
- `<meta charset="UTF-8">`
- `<meta name="viewport">`
- `<title>` with site suffix
- `<meta name="description">`
- `<link rel="canonical">`
- Open Graph tags (`og:title`, `og:description`, `og:type`, `og:image` conditionally)
- `font-display: swap` on Google Fonts link (add `&display=swap` to the URL if missing)

- [ ] **Step 2: Verify skip-to-content link is the first element in `<body>` in Base.astro**

The link must be visible on focus, hidden otherwise:
```html
<a href="#main-content" class="sr-only focus:not-sr-only ...">Skip to content</a>
```
Every page must have `id="main-content"` on the `<main>` element.

- [ ] **Step 3: Verify `<aside aria-label="Filters">` in FilterBar.astro**

The `<aside>` root element must have `aria-label="Filters"`.

- [ ] **Step 4: Verify all `CountryFlag` instances use `role="img"` with aria-label**

Check `src/components/CountryFlag.astro`:
```astro
<span role="img" aria-label={`${name} flag`}>{flag}</span>
```

- [ ] **Step 5: Verify severity is conveyed in text, not just colour**

In `EventCard.astro`, the severity label must appear as text alongside the colour accent. Confirm the severity label span is present.

- [ ] **Step 6: Verify focus-visible rings on all interactive elements**

Search for `<a`, `<button`, `<input`, `<select` across components. Each must have:
- `focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500` or equivalent
- Or Tailwind's `focus:ring` utilities

- [ ] **Step 7: Run build and check**

```bash
pnpm build && pnpm astro check
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git commit -am "fix: accessibility and SEO pass — ARIA labels, focus rings, meta tags"
```

---

## Task 16: Performance Pass and Tailwind Prose Plugin

**Files:**
- Modify: `package.json` — add `@tailwindcss/typography`
- Modify: `tailwind.config.mjs` — register typography plugin
- Review: `src/layouts/Base.astro` — font preconnect order

- [ ] **Step 1: Install Tailwind typography plugin**

The `prose` class used in the event detail page requires `@tailwindcss/typography`:

```bash
pnpm add -D @tailwindcss/typography
```

- [ ] **Step 2: Register plugin in `tailwind.config.mjs`**

```javascript
import typography from '@tailwindcss/typography';

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
  plugins: [typography],
};
```

- [ ] **Step 3: Verify `<link rel="preconnect">` appears before the font stylesheet in `Base.astro`**

Order must be:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:..." rel="stylesheet" />
```

- [ ] **Step 4: Run final build**

```bash
pnpm build
```

Expected: Clean build. No errors.

- [ ] **Step 5: Spot-check the built site**

```bash
pnpm preview
```

Open `http://localhost:4321` and verify:
- Timeline renders all 15 events
- Dark mode toggle works and persists on refresh
- Search filter hides non-matching cards
- URL hash updates on filter change and restores on refresh
- Event detail pages have prose-styled body content
- Category and country pages show filtered events

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml tailwind.config.mjs
git commit -m "feat: add Tailwind typography plugin for prose rendering"
```

---

## Completion Checklist

- [ ] `pnpm build` succeeds with no errors
- [ ] `pnpm astro check` passes TypeScript validation
- [ ] 15+ events visible on timeline
- [ ] Filtering by search, category, country, severity, date range, ongoing all work
- [ ] URL hash encodes filter state; restores on page load
- [ ] Dark mode works on all pages
- [ ] Event detail pages render markdown body
- [ ] Category and country pages work
- [ ] Skip-to-content link present on all pages
- [ ] All interactive elements have keyboard-accessible focus rings
- [ ] README documents local dev, add-event, add-category, and deploy
