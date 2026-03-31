export interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
}

export const countries: Country[] = [
  { code: 'DE', name: 'Germany',                flag: '🇩🇪', region: 'Europe' },
  { code: 'PL', name: 'Poland',                 flag: '🇵🇱', region: 'Europe' },
  { code: 'JP', name: 'Japan',                  flag: '🇯🇵', region: 'East Asia' },
  { code: 'IN', name: 'India',                  flag: '🇮🇳', region: 'South Asia' },
  { code: 'PK', name: 'Pakistan',               flag: '🇵🇰', region: 'South Asia' },
  { code: 'KR', name: 'South Korea',            flag: '🇰🇷', region: 'East Asia' },
  { code: 'KP', name: 'North Korea',            flag: '🇰🇵', region: 'East Asia' },
  { code: 'CU', name: 'Cuba',                   flag: '🇨🇺', region: 'Caribbean' },
  { code: 'US', name: 'United States',          flag: '🇺🇸', region: 'North America' },
  { code: 'CN', name: 'China',                  flag: '🇨🇳', region: 'East Asia' },
  { code: 'RW', name: 'Rwanda',                 flag: '🇷🇼', region: 'Sub-Saharan Africa' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', region: 'Europe' },
  { code: 'IQ', name: 'Iraq',                   flag: '🇮🇶', region: 'Middle East' },
  { code: 'ID', name: 'Indonesia',              flag: '🇮🇩', region: 'Southeast Asia' },
  { code: 'TH', name: 'Thailand',               flag: '🇹🇭', region: 'Southeast Asia' },
  { code: 'LK', name: 'Sri Lanka',              flag: '🇱🇰', region: 'South Asia' },
  { code: 'EG', name: 'Egypt',                  flag: '🇪🇬', region: 'Middle East / North Africa' },
  { code: 'TN', name: 'Tunisia',                flag: '🇹🇳', region: 'Middle East / North Africa' },
  { code: 'SY', name: 'Syria',                  flag: '🇸🇾', region: 'Middle East' },
  { code: 'UA', name: 'Ukraine',                flag: '🇺🇦', region: 'Europe' },
  { code: 'RU', name: 'Russia',                 flag: '🇷🇺', region: 'Europe / Asia' },
];
