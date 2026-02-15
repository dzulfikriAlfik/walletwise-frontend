/**
 * LocaleSelector - Dropdown for switching between locales (en / id)
 */

import { useTranslation } from 'react-i18next'
import { LOCALES, type LocaleCode } from '@/i18n'

export function LocaleSelector() {
  const { i18n } = useTranslation()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LocaleCode
    if (value === 'en' || value === 'id') {
      i18n.changeLanguage(value)
    }
  }

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      aria-label="Select language"
    >
      {LOCALES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  )
}
