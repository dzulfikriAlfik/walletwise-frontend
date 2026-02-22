/**
 * LocaleSelector - Dropdown for switching between locales (en / id)
 */

import { useTranslation } from 'react-i18next'
import { LOCALES, type LocaleCode } from '@/i18n'
import { SelectSimple } from '@/components/ui/Select'

export function LocaleSelector() {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'en' || i18n.language === 'id' ? i18n.language : 'en'

  const handleChange = (value: string) => {
    if (value === 'en' || value === 'id') {
      i18n.changeLanguage(value)
    }
  }

  return (
    <SelectSimple
      value={lang}
      onValueChange={handleChange}
      options={LOCALES.map(({ code, label }) => ({ value: code, label }))}
      className="h-9 min-h-[36px]"
    />
  )
}
