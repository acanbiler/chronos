# Chronos — World Events Timeline

A static website displaying historical and ongoing world events on a visual timeline.
Built with Astro, Tailwind CSS, and Alpine.js. Deployed to Cloudflare Pages.

## Local Development

```bash
pnpm install
pnpm dev         # starts dev server at http://localhost:4321
pnpm build       # builds to dist/
pnpm preview     # previews the built output
pnpm astro check # TypeScript type checking
```

## Adding an Event

1. Create a new file in `src/content/events/` with the filename format `YYYY-slug.yaml`.
2. Populate it with the following structure (`# required` fields are mandatory):

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

categories:                   # required — slugs from src/data/categories.ts
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
4. Run `pnpm dev` to preview the change locally.

## Adding a Category

1. Open `src/data/categories.ts`.
2. Add a new entry to the exported array:

```typescript
{ slug: 'your-category-slug', label: 'Human-Readable Label', color: '#hexcolor' },
```

3. Events can now use this slug in their `categories` array.

## Adding a Country

1. Open `src/data/countries.ts`.
2. Add a new entry to the exported array:

```typescript
{ code: 'XX', name: 'Country Name', flag: '🏳️', region: 'Region Name' },
```

Use the ISO 3166-1 alpha-2 country code.

## Deployment (Cloudflare Pages)

1. Push the repository to GitHub.
2. In Cloudflare Pages → **Create a project** → connect the repository.
3. Build settings:
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Environment variable:** `NODE_VERSION=20`
4. Every push to `main` triggers a build and deploy automatically.
5. Every pull request gets an isolated preview deployment.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 6.x (static output) |
| Styling | Tailwind CSS 4.x |
| Interactivity | Alpine.js 3.x (CDN) |
| Markdown | marked 12.x (build-time only) |
| Data | YAML content collections |
| Deployment | Cloudflare Pages |
