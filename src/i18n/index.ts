/**
 * i18n Configuration
 * Localization with English (en) and Indonesian (id)
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import id from './locales/id.json'

const LOCALE_STORAGE_KEY = 'walletwise-locale'

// Get saved locale or default to 'en'
const savedLocale = (() => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'en' || stored === 'id') return stored
  } catch {
    // ignore
  }
  return 'en'
})()

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  lng: savedLocale,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes
  },
})

// Persist locale changes to localStorage
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lng)
  } catch {
    // ignore
  }
})

export const LOCALES = [
  { code: 'en' as const, label: 'English' },
  { code: 'id' as const, label: 'Bahasa Indonesia' },
] as const

export type LocaleCode = (typeof LOCALES)[number]['code']
export { LOCALE_STORAGE_KEY }
