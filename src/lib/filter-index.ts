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
