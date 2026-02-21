/**
 * Button Component
 * Tailwind CSS implementation
 */

import * as React from "react"
import { cn } from "@/lib/utils"

const variantStyles: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  outline: "border border-input bg-background hover:bg-muted/50 hover:border-input",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
  ghost: "hover:bg-muted/80",
  link: "text-primary underline-offset-4 hover:underline",
}

const sizeStyles: Record<string, string> = {
  default: "h-11 px-5 py-2",
  sm: "h-9 rounded-lg px-3",
  lg: "h-12 rounded-lg px-8",
  icon: "h-10 w-10",
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

function getButtonClasses(
  variant: keyof typeof variantStyles = "default",
  size: keyof typeof sizeStyles = "default",
  className?: string
) {
  return cn(
    baseStyles,
    variantStyles[variant] ?? variantStyles.default,
    sizeStyles[size] ?? sizeStyles.default,
    className
  )
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  className?: string
}) {
  return getButtonClasses(variant, size, className)
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={getButtonClasses(variant, size, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
