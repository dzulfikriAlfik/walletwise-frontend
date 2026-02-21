/**
 * DatePicker - Date selection
 * Mobile: iOS-style wheel picker (react-mobile-picker)
 * Desktop: react-datepicker
 * Value format: yyyy-MM-dd
 */

import { useState } from 'react'
import { parse, format, isValid } from 'date-fns'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { useTranslation } from 'react-i18next'
import { enUS, id as idLocale } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'
import { MobileDateWheelPicker } from '@/components/ui/MobileDateWheelPicker'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('en', enUS)
registerLocale('id', idLocale)

export interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

const DATE_FORMAT = 'yyyy-MM-dd'
const DISPLAY_FORMAT = 'dd MMM yyyy'

const inputBaseClass =
  'flex h-11 w-full min-h-[44px] rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const { i18n } = useTranslation()
  const locale = i18n.language === 'id' ? idLocale : enUS
  const isMobile = useIsMobile()
  const [wheelOpen, setWheelOpen] = useState(false)

  const selected = value
    ? (() => {
        const d = parse(value, DATE_FORMAT, new Date())
        return isValid(d) ? d : null
      })()
    : null

  const handleChange = (date: Date | null) => {
    onChange(date ? format(date, DATE_FORMAT) : '')
  }

  const displayValue = value
    ? (() => {
        const d = parse(value, DATE_FORMAT, new Date())
        return isValid(d) ? format(d, DISPLAY_FORMAT, { locale }) : ''
      })()
    : ''

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
        <MobileDateWheelPicker
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
      dateFormat="yyyy-MM-dd"
      locale={i18n.language === 'id' ? 'id' : 'en'}
      placeholderText={placeholder}
      disabled={disabled}
      className={cn(inputBaseClass, className)}
    />
  )
}
