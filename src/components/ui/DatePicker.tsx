/**
 * DatePicker - Date selection using react-datepicker
 * Value format: yyyy-MM-dd
 */

import { parse, format, isValid } from 'date-fns'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { useTranslation } from 'react-i18next'
import { enUS } from 'date-fns/locale'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('en', enUS)
registerLocale('id', id)

export interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

const DATE_FORMAT = 'yyyy-MM-dd'

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const { i18n } = useTranslation()
  const locale = i18n.language === 'id' ? 'id' : 'en'

  const selected = value
    ? (() => {
        const d = parse(value, DATE_FORMAT, new Date())
        return isValid(d) ? d : null
      })()
    : null

  const handleChange = (date: Date | null) => {
    onChange(date ? format(date, DATE_FORMAT) : '')
  }

  return (
    <ReactDatePicker
      id={id}
      selected={selected}
      onChange={handleChange}
      dateFormat="yyyy-MM-dd"
      locale={locale}
      placeholderText={placeholder}
      disabled={disabled}
      className={cn(
        'flex h-11 w-full min-h-[44px] rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  )
}
