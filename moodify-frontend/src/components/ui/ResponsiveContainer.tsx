"use client"

import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  mobileFullWidth?: boolean
}

export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'lg',
  padding = 'md',
  mobileFullWidth = false
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4',
    md: 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
    lg: 'px-4 sm:px-6 lg:px-8 py-8 sm:py-12'
  }

  const mobileClasses = mobileFullWidth 
    ? 'w-full mx-auto'
    : 'w-full mx-auto'

  return (
    <div className={`
      ${mobileClasses}
      ${maxWidthClasses[maxWidth]}
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface MobileNavProps {
  children: ReactNode
  className?: string
}

export function MobileNav({ children, className = '' }: MobileNavProps) {
  return (
    <nav className={`
      mobile-nav
      flex items-center justify-around
      bg-white border-t border-gray-200
      px-4 py-2
      safe-area-bottom
      ${className}
    `}>
      {children}
    </nav>
  )
}

interface TouchTargetProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  ariaLabel?: string
}

export function TouchTarget({
  children,
  onClick,
  className = '',
  disabled = false,
  ariaLabel
}: TouchTargetProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        touch-target
        focus-visible:focus
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    mobile: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  }

  const gridCols = `
    grid-cols-${cols.mobile}
    ${cols.tablet ? `sm:grid-cols-${cols.tablet}` : ''}
    ${cols.desktop ? `lg:grid-cols-${cols.desktop}` : ''}
  `

  return (
    <div className={`
      grid
      ${gridCols}
      ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface ResponsiveCardProps {
  children: ReactNode
  variant?: 'default' | 'mobile-full' | 'elevated'
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function ResponsiveCard({
  children,
  variant = 'default',
  className = '',
  padding = 'md'
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  const variantClasses = {
    default: 'card-mobile bg-white border border-gray-200',
    'mobile-full': 'card-mobile bg-white border border-gray-200 sm:rounded-lg',
    elevated: 'bg-white rounded-lg shadow-lg border border-gray-100'
  }

  return (
    <div className={`
      ${variantClasses[variant]}
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface StackProps {
  children: ReactNode
  spacing?: 'sm' | 'md' | 'lg'
  direction?: 'vertical' | 'horizontal'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  className?: string
  responsive?: boolean
}

export function Stack({
  children,
  spacing = 'md',
  direction = 'vertical',
  align = 'stretch',
  justify = 'start',
  className = '',
  responsive = false
}: StackProps) {
  const spacingClasses = {
    sm: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6'
  }

  const directionClass = direction === 'vertical' ? 'flex-col' : 'flex-row'
  const responsiveClass = responsive ? 'flex-col sm:flex-row' : directionClass

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  }

  return (
    <div className={`
      flex
      ${responsiveClass}
      ${spacingClasses[spacing]}
      ${alignClasses[align]}
      ${justifyClasses[justify]}
      ${className}
    `}>
      {children}
    </div>
  )
}