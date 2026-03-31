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
