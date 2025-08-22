"use client"

import { ReactNode, useState, useEffect } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 300, 
  direction = 'up',
  className = "" 
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const directionClasses = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4',
    none: ''
  }

  return (
    <div 
      className={`
        transition-all ease-out
        ${isVisible 
          ? 'opacity-100 translate-x-0 translate-y-0' 
          : `opacity-0 ${directionClasses[direction]}`
        }
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

interface SlideInProps {
  children: ReactNode
  direction: 'left' | 'right' | 'up' | 'down'
  isVisible: boolean
  duration?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction, 
  isVisible, 
  duration = 300,
  className = "" 
}: SlideInProps) {
  const directionClasses = {
    left: isVisible ? 'translate-x-0' : '-translate-x-full',
    right: isVisible ? 'translate-x-0' : 'translate-x-full',
    up: isVisible ? 'translate-y-0' : '-translate-y-full',
    down: isVisible ? 'translate-y-0' : 'translate-y-full'
  }

  return (
    <div 
      className={`
        transition-transform ease-out
        ${directionClasses[direction]}
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

interface ScaleInProps {
  children: ReactNode
  isVisible: boolean
  duration?: number
  className?: string
}

export function ScaleIn({ 
  children, 
  isVisible, 
  duration = 200,
  className = "" 
}: ScaleInProps) {
  return (
    <div 
      className={`
        transition-all ease-out origin-center
        ${isVisible 
          ? 'scale-100 opacity-100' 
          : 'scale-95 opacity-0'
        }
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

interface StaggeredListProps {
  children: ReactNode[]
  staggerDelay?: number
  itemDuration?: number
  className?: string
}

export function StaggeredList({ 
  children, 
  staggerDelay = 100, 
  itemDuration = 300,
  className = "" 
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn 
          key={index}
          delay={index * staggerDelay}
          duration={itemDuration}
          direction="up"
        >
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

interface PulseProps {
  children: ReactNode
  isActive?: boolean
  intensity?: 'light' | 'medium' | 'strong'
  className?: string
}

export function Pulse({ 
  children, 
  isActive = true, 
  intensity = 'medium',
  className = "" 
}: PulseProps) {
  const intensityClasses = {
    light: 'animate-pulse',
    medium: 'animate-pulse opacity-75',
    strong: 'animate-pulse opacity-50'
  }

  return (
    <div className={`
      ${isActive ? intensityClasses[intensity] : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface BounceProps {
  children: ReactNode
  trigger?: boolean
  className?: string
}

export function Bounce({ children, trigger = false, className = "" }: BounceProps) {
  return (
    <div className={`
      transition-transform duration-200 ease-out
      ${trigger ? 'animate-bounce' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface FloatingProps {
  children: ReactNode
  duration?: number
  intensity?: number
  className?: string
}

export function Floating({ 
  children, 
  duration = 3000, 
  intensity = 10,
  className = "" 
}: FloatingProps) {
  return (
    <div 
      className={`animate-pulse ${className}`}
      style={{
        animation: `float ${duration}ms ease-in-out infinite`,
        '--float-intensity': `${intensity}px`
      } as React.CSSProperties}
    >
      {children}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(var(--float-intensity)); }
        }
      `}</style>
    </div>
  )
}

interface CardHoverProps {
  children: ReactNode
  className?: string
  hoverScale?: number
  hoverShadow?: boolean
}

export function CardHover({ 
  children, 
  className = "",
  hoverScale = 1.02,
  hoverShadow = true
}: CardHoverProps) {
  return (
    <div className={`
      transition-all duration-200 ease-out cursor-pointer
      hover:scale-${Math.round(hoverScale * 100)}
      ${hoverShadow ? 'hover:shadow-lg' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface ProgressiveBlurProps {
  children: ReactNode
  isBlurred: boolean
  intensity?: 'light' | 'medium' | 'strong'
  className?: string
}

export function ProgressiveBlur({ 
  children, 
  isBlurred, 
  intensity = 'medium',
  className = "" 
}: ProgressiveBlurProps) {
  const intensityClasses = {
    light: 'blur-sm',
    medium: 'blur-md',
    strong: 'blur-lg'
  }

  return (
    <div className={`
      transition-all duration-300 ease-out
      ${isBlurred ? intensityClasses[intensity] : 'blur-0'}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface TypewriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
}

export function Typewriter({ 
  text, 
  speed = 50, 
  delay = 0,
  className = "",
  onComplete 
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex])
          setCurrentIndex(prev => prev + 1)
        }, speed)

        return () => clearTimeout(timer)
      } else if (onComplete) {
        onComplete()
      }
    }, delay)

    return () => clearTimeout(startTimer)
  }, [currentIndex, text, speed, delay, onComplete])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

interface CounterProps {
  from: number
  to: number
  duration?: number
  delay?: number
  className?: string
}

export function Counter({ 
  from, 
  to, 
  duration = 1000, 
  delay = 0,
  className = "" 
}: CounterProps) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      const increment = (to - from) / (duration / 16) // 60fps
      let current = from

      const timer = setInterval(() => {
        current += increment
        if ((increment > 0 && current >= to) || (increment < 0 && current <= to)) {
          setCount(to)
          clearInterval(timer)
        } else {
          setCount(Math.round(current))
        }
      }, 16)

      return () => clearInterval(timer)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [from, to, duration, delay])

  return <span className={className}>{count}</span>
}

interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function Parallax({ children, speed = 0.5, className = "" }: ParallaxProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div 
      className={className}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  )
}