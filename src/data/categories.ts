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
