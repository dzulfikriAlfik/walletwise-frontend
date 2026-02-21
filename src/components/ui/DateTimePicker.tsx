/**
 * DateTimePicker - Date + Time selection
 * Mobile: iOS-style wheel picker (react-mobile-picker)
 * Desktop: react-datepicker
 * Value format: yyyy-MM-dd'T'HH:mm
 */

import { useState } from 'react'
import { parse, format, isValid, parseISO } from 'date-fns'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { useTranslation } from 'react-i18next'
import { enUS } from 'date-fns/locale'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'
import { MobileDateTimeWheelPicker } from '@/components/ui/MobileDateTimeWheelPicker'
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
const DISPLAY_FORMAT = 'dd MMM yyyy HH:mm'

function toDate(v: string): Date | null {
  const parsed = parse(v, DATETIME_FORMAT, new Date())
  if (isValid(parsed)) return parsed
  try {
    const d = parseISO(v)
    return isValid(d) ? d : null
  } catch {
    return null
  }
}

const inputBaseClass =
  'flex h-11 w-full min-h-[44px] rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

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
  const isMobile = useIsMobile()
  const [wheelOpen, setWheelOpen] = useState(false)

  const selected = value ? toDate(value) : null

  const displayValue = value
    ? (() => {
        const d = toDate(value)
        return d ? format(d, DISPLAY_FORMAT, { locale: i18n.language === 'id' ? id : enUS }) : ''
      })()
    : ''

  const handleChange = (date: Date | null) => {
    onChange(date ? format(date, DATETIME_FORMAT) : '')
  }

  if (isMobile) {
    return (
      <>
        <input
          id={id}
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onClick={() => !disabled && setWheelOpen(true)}
          className={cn(inputBaseClass, 'cursor-pointer', className)}
        />
        <MobileDateTimeWheelPicker
          value={value}
          onChange={(v) => {
            onChange(v)
            setWheelOpen(false)
          }}
          onCancel={() => setWheelOpen(false)}
          open={wheelOpen}
        />
      </>
    )
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
      className={cn(inputBaseClass, className)}
    />
  )
}
