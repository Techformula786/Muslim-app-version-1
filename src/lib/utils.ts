import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeGetHijriDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const locales = [
    'en-u-ca-islamic-uma-nu-latn',
    'en-u-ca-islamic-uma',
    'en-u-ca-islamic',
    'en-US'
  ];
  for (const locale of locales) {
    try {
      return new Intl.DateTimeFormat(locale, options || { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    } catch (e) {
      // try next
    }
  }
  return date.toLocaleDateString();
}

export function safeGetHijriParts(date: Date, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[] {
  const locales = [
    'en-u-ca-islamic-uma-nu-latn',
    'en-u-ca-islamic-uma',
    'en-u-ca-islamic',
    'en-US'
  ];
  for (const locale of locales) {
    try {
      return new Intl.DateTimeFormat(locale, options || { month: 'long', year: 'numeric' }).formatToParts(date);
    } catch (e) {
      // try next
    }
  }
  
  // Handcrafted fallback
  return [
    { type: 'month', value: 'Ramadan' }, // static default indicator to avoid crash
    { type: 'literal', value: ', ' },
    { type: 'year', value: String(Math.floor((date.getFullYear() - 622) * (33 / 32))) }
  ];
}

