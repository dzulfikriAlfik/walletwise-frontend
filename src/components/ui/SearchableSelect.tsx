/**
 * SearchableSelect - Combobox with type-to-search
 */

import { useState, useRef, useEffect } from 'react'
import { Input } from './Input'
import { cn } from '@/lib/utils'

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  'data-testid'?: string
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Search...',
  disabled,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''
  const displayValue = isOpen ? search : selectedLabel

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFocus = () => {
    if (disabled) return
    setIsOpen(true)
    setSearch('')
  }

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150)
  }

  const handleSelect = (opt: SearchableSelectOption) => {
    onValueChange(opt.value)
    setSearch('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearch('')
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        value={displayValue}
        onChange={(e) => {
          const v = e.target.value
          setSearch(v)
          setIsOpen(true)
          if (!isOpen) setIsOpen(true)
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="pr-10"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('transition-transform', isOpen && 'rotate-180')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>

      {isOpen && (
        <ul
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg py-1"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">No results</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={cn(
                  'cursor-pointer px-4 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                  opt.value === value && 'bg-accent/50'
                )}
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
