/**
 * DateTimePicker - Date + Time selection using react-datepicker
 * Value format: yyyy-MM-dd'T'HH:mm
 */

import { parse, format, isValid, parseISO } from 'date-fns'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { useTranslation } from 'react-i18next'
import { enUS } from 'date-fns/locale'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('en', enUS)
registerLocale('id', id)

export interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm"

function toDate(v: string): Date | null {
  const parsed = parse(v, DATETIME_FORMAT, new Date())
  return isValid(parsed) ? parsed : null
}

function fromISO(iso: string): Date | null {
  try {
    const d = parseISO(iso)
    return isValid(d) ? d : null
  } catch {
    return null
  }
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Select date and time',
  disabled = false,
  className,
  id,
}: DateTimePickerProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'id' ? 'id' : 'en'

  const selected =
    toDate(value) ??
    (value ? fromISO(value) : null) ??
    null

  const handleChange = (date: Date | null) => {
    onChange(date ? format(date, DATETIME_FORMAT) : '')
  }

  return (
    <ReactDatePicker
      id={id}
      selected={selected}
      onChange={handleChange}
      showTimeSelect
      timeIntervals={15}
      timeCaption={t('transactions.time', 'Time')}
      dateFormat="dd MMM yyyy HH:mm"
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
