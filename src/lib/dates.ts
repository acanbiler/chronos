export function normalizeEventDate(input: string): Date {
  if (/^\d{4}$/.test(input)) return new Date(`${input}-01-01T00:00:00Z`);
  if (/^\d{4}-\d{2}$/.test(input)) return new Date(`${input}-01T00:00:00Z`);
  return new Date(`${input}T00:00:00Z`);
}

export function extractEventYear(input: string): number {
  return Number.parseInt(input.slice(0, 4), 10);
}
