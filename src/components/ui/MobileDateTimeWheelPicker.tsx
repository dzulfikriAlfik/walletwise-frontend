/**
 * Mobile DateTime Wheel Picker - iOS-style wheel for date + time
 * Used inside DateTimePicker on mobile
 */

import { useState, useEffect, useMemo } from 'react'
import Picker from 'react-mobile-picker'
import { format, parse, isValid, getDaysInMonth, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { enUS } from 'date-fns/locale'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm"
const START_YEAR = 2000
const END_YEAR = 2030

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

export interface MobileDateTimeWheelPickerProps {
  value: string
  onChange: (value: string) => void
  onCancel?: () => void
  open: boolean
}

function getMonthOptions(locale: typeof enUS) {
  return Array.from({ length: 12 }, (_, i) => {
    const v = String(i + 1)
    const label = format(new Date(2000, i), 'MMMM', { locale })
    return { value: v, label }
  })
}

function getDayOptions(month: number, year: number) {
  const days = getDaysInMonth(new Date(year, month - 1))
  return Array.from({ length: days }, (_, i) => String(i + 1))
}

function getYearOptions() {
  return Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) =>
    String(START_YEAR + i)
  )
}

function parseValue(v: string): Date | null {
  const parsed = parse(v, DATETIME_FORMAT, new Date())
  if (isValid(parsed)) return parsed
  try {
    const d = parseISO(v)
    return isValid(d) ? d : null
  } catch {
    return null
  }
}

function roundMinute(mm: number): string {
  const idx = Math.round(mm / 15) % 4
  return MINUTES[idx] ?? '00'
}

function toPickerValue(v: string): {
  month: string
  day: string
  year: string
  hour: string
  minute: string
} {
  const d = parseValue(v) ?? new Date()
  const mm = parseInt(format(d, 'mm'), 10)
  return {
    month: String(d.getMonth() + 1),
    day: String(d.getDate()),
    year: String(d.getFullYear()),
    hour: format(d, 'HH'),
    minute: MINUTES.includes(format(d, 'mm')) ? format(d, 'mm') : roundMinute(mm),
  }
}

export function MobileDateTimeWheelPicker({
  value,
  onChange,
  onCancel,
  open,
}: MobileDateTimeWheelPickerProps) {
  const { i18n, t } = useTranslation()
  const locale = (i18n.language === 'id' ? id : enUS) as typeof enUS

  const [pickerValue, setPickerValue] = useState(() => toPickerValue(value))

  useEffect(() => {
    if (open) setPickerValue(toPickerValue(value))
  }, [open, value])

  const monthOpts = useMemo(() => getMonthOptions(locale), [locale])
  const yearOpts = useMemo(() => getYearOptions(), [])
  const dayOpts = useMemo(
    () =>
      getDayOptions(
        parseInt(pickerValue.month, 10),
        parseInt(pickerValue.year, 10)
      ),
    [pickerValue.month, pickerValue.year]
  )

  const safePickerValue = useMemo(() => {
    const maxDay = getDaysInMonth(
      new Date(
        parseInt(pickerValue.year, 10),
        parseInt(pickerValue.month, 10) - 1
      )
    )
    const day = parseInt(pickerValue.day, 10)
    const minute = MINUTES.includes(pickerValue.minute)
      ? pickerValue.minute
      : MINUTES[0]
    return {
      ...pickerValue,
      day: day > maxDay ? String(maxDay) : pickerValue.day,
      minute,
    }
  }, [pickerValue])

  const handleConfirm = () => {
    const m = safePickerValue.month.padStart(2, '0')
    const d = safePickerValue.day.padStart(2, '0')
    const y = safePickerValue.year
    const dateStr = `${y}-${m}-${d}`
    const timeStr = `${safePickerValue.hour}:${safePickerValue.minute}`
    onChange(`${dateStr}T${timeStr}`)
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onCancel}
        aria-hidden
      />
      <div
        className={cn(
          'fixed left-0 right-0 bottom-0 z-50',
          'bg-white dark:bg-card rounded-t-2xl shadow-xl',
          'pb-safe'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            type="button"
            onClick={onCancel}
            className="text-primary text-sm font-medium"
          >
            {t('common.cancel')}
          </button>
          <span className="text-sm font-medium text-foreground">
            {t('transactions.date')}
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            className="text-primary text-sm font-medium"
          >
            {t('common.save')}
          </button>
        </div>
        <div className="ios-wheel-picker">
          <Picker
            value={safePickerValue}
            onChange={setPickerValue}
            height={216}
            itemHeight={36}
            wheelMode="natural"
          >
            <Picker.Column name="month">
              {monthOpts.map(({ value: v, label }) => (
                <Picker.Item key={v} value={v}>
                  {({ selected }) => (
                    <span
                      className={cn(
                        'block text-center transition-all',
                        selected
                          ? 'text-foreground font-semibold text-base'
                          : 'text-muted-foreground text-sm'
                      )}
                    >
                      {label}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
            <Picker.Column name="day">
              {dayOpts.map((d) => (
                <Picker.Item key={d} value={d}>
                  {({ selected }) => (
                    <span
                      className={cn(
                        'block text-center transition-all',
                        selected
                          ? 'text-foreground font-semibold text-base'
                          : 'text-muted-foreground text-sm'
                      )}
                    >
                      {d}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
            <Picker.Column name="year">
              {yearOpts.map((y) => (
                <Picker.Item key={y} value={y}>
                  {({ selected }) => (
                    <span
                      className={cn(
                        'block text-center transition-all',
                        selected
                          ? 'text-foreground font-semibold text-base'
                          : 'text-muted-foreground text-sm'
                      )}
                    >
                      {y}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
            <Picker.Column name="hour">
              {HOURS.map((h) => (
                <Picker.Item key={h} value={h}>
                  {({ selected }) => (
                    <span
                      className={cn(
                        'block text-center transition-all',
                        selected
                          ? 'text-foreground font-semibold text-base'
                          : 'text-muted-foreground text-sm'
                      )}
                    >
                      {h}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
            <Picker.Column name="minute">
              {MINUTES.map((m) => (
                <Picker.Item key={m} value={m}>
                  {({ selected }) => (
                    <span
                      className={cn(
                        'block text-center transition-all',
                        selected
                          ? 'text-foreground font-semibold text-base'
                          : 'text-muted-foreground text-sm'
                      )}
                    >
                      {m}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          </Picker>
        </div>
      </div>
    </>
  )
}
