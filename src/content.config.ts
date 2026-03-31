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
