export interface Category {
  slug: string;
  label: string;
  color: string;
}

export const categories: Category[] = [
  { slug: 'genocide',     label: 'Genocide',                color: '#7c1d1d' },
  { slug: 'war-conflict', label: 'War & Conflict',          color: '#7c3a1d' },
  { slug: 'human-rights', label: 'Human Rights',            color: '#1e3a5f' },
  { slug: 'environment',  label: 'Environment & Climate',   color: '#14532d' },
  { slug: 'economics',    label: 'Economics & Finance',     color: '#3b2f6b' },
  { slug: 'political',    label: 'Political',               color: '#4a3000' },
  { slug: 'science-tech', label: 'Science & Technology',   color: '#1a3a4a' },
  { slug: 'pandemic',     label: 'Pandemic & Health',       color: '#2d1a4a' },
];
