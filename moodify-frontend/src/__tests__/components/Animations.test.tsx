import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { 
  FadeIn, 
  SlideIn, 
  ScaleIn, 
  StaggeredList, 
  Pulse,
  Bounce,
  CardHover,
  ProgressiveBlur,
  Typewriter,
  Counter
} from '@/components/ui/Animations'

describe('Animation Components', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('FadeIn', () => {
    it('should render children with fade-in animation', () => {
      render(
        <FadeIn>
          <div>Test content</div>
        </FadeIn>
      )
      
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should apply initial hidden state and then fade in', () => {
      const { container } = render(
        <FadeIn delay={100}>
          <div>Test content</div>
        </FadeIn>
      )
      
      const fadeElement = container.firstChild as HTMLElement
      expect(fadeElement).toHaveClass('opacity-0')
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      expect(fadeElement).toHaveClass('opacity-100')
    })

    it('should apply different directions', () => {
      const { container, rerender } = render(
        <FadeIn direction="up">
          <div>Test content</div>
        </FadeIn>
      )
      
      expect(container.firstChild).toHaveClass('translate-y-4')
      
      rerender(
        <FadeIn direction="down">
          <div>Test content</div>
        </FadeIn>
      )
      
      expect(container.firstChild).toHaveClass('-translate-y-4')
      
      rerender(
        <FadeIn direction="left">
          <div>Test content</div>
        </FadeIn>
      )
      
      expect(container.firstChild).toHaveClass('translate-x-4')
      
      rerender(
        <FadeIn direction="right">
          <div>Test content</div>
        </FadeIn>
      )
      
      expect(container.firstChild).toHaveClass('-translate-x-4')
    })

    it('should apply custom duration', () => {
      const { container } = render(
        <FadeIn duration={500}>
          <div>Test content</div>
        </FadeIn>
      )
      
      const fadeElement = container.firstChild as HTMLElement
      expect(fadeElement.style.transitionDuration).toBe('500ms')
    })

    it('should apply custom className', () => {
      const { container } = render(
        <FadeIn className="custom-class">
          <div>Test content</div>
        </FadeIn>
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('SlideIn', () => {
    it('should render with slide animation', () => {
      render(
        <SlideIn direction="left" isVisible={true}>
          <div>Sliding content</div>
        </SlideIn>
      )
      
      expect(screen.getByText('Sliding content')).toBeInTheDocument()
    })

    it('should apply correct transform classes based on visibility and direction', () => {
      const { container, rerender } = render(
        <SlideIn direction="left" isVisible={false}>
          <div>Content</div>
        </SlideIn>
      )
      
      expect(container.firstChild).toHaveClass('-translate-x-full')
      
      rerender(
        <SlideIn direction="left" isVisible={true}>
          <div>Content</div>
        </SlideIn>
      )
      
      expect(container.firstChild).toHaveClass('translate-x-0')
    })

    it('should handle all slide directions', () => {
      const directions = ['left', 'right', 'up', 'down'] as const
      
      directions.forEach(direction => {
        const { container } = render(
          <SlideIn direction={direction} isVisible={false}>
            <div>Content</div>
          </SlideIn>
        )
        
        expect(container.firstChild).toHaveClass('transition-transform')
      })
    })
  })

  describe('ScaleIn', () => {
    it('should apply scale animation based on visibility', () => {
      const { container, rerender } = render(
        <ScaleIn isVisible={false}>
          <div>Scaling content</div>
        </ScaleIn>
      )
      
      expect(container.firstChild).toHaveClass('scale-95', 'opacity-0')
      
      rerender(
        <ScaleIn isVisible={true}>
          <div>Scaling content</div>
        </ScaleIn>
      )
      
      expect(container.firstChild).toHaveClass('scale-100', 'opacity-100')
    })

    it('should apply custom duration', () => {
      const { container } = render(
        <ScaleIn isVisible={true} duration={300}>
          <div>Content</div>
        </ScaleIn>
      )
      
      expect((container.firstChild as HTMLElement).style.transitionDuration).toBe('300ms')
    })
  })

  describe('StaggeredList', () => {
    it('should render all children with staggered delays', () => {
      const children = [
        <div key="1">Item 1</div>,
        <div key="2">Item 2</div>,
        <div key="3">Item 3</div>
      ]
      
      render(
        <StaggeredList staggerDelay={100}>
          {children}
        </StaggeredList>
      )
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should apply custom className to container', () => {
      const { container } = render(
        <StaggeredList className="staggered-container">
          {[<div key="1">Item</div>]}
        </StaggeredList>
      )
      
      expect(container.firstChild).toHaveClass('staggered-container')
    })
  })

  describe('Pulse', () => {
    it('should apply pulse animation when active', () => {
      const { container, rerender } = render(
        <Pulse isActive={true}>
          <div>Pulsing content</div>
        </Pulse>
      )
      
      expect(container.firstChild).toHaveClass('animate-pulse')
      
      rerender(
        <Pulse isActive={false}>
          <div>Pulsing content</div>
        </Pulse>
      )
      
      expect(container.firstChild).not.toHaveClass('animate-pulse')
    })

    it('should apply different intensity levels', () => {
      const { container, rerender } = render(
        <Pulse intensity="light">
          <div>Content</div>
        </Pulse>
      )
      
      expect(container.firstChild).toHaveClass('animate-pulse')
      
      rerender(
        <Pulse intensity="medium">
          <div>Content</div>
        </Pulse>
      )
      
      expect(container.firstChild).toHaveClass('animate-pulse', 'opacity-75')
      
      rerender(
        <Pulse intensity="strong">
          <div>Content</div>
        </Pulse>
      )
      
      expect(container.firstChild).toHaveClass('animate-pulse', 'opacity-50')
    })
  })

  describe('Bounce', () => {
    it('should apply bounce animation when triggered', () => {
      const { container, rerender } = render(
        <Bounce trigger={false}>
          <div>Bouncing content</div>
        </Bounce>
      )
      
      expect(container.firstChild).not.toHaveClass('animate-bounce')
      
      rerender(
        <Bounce trigger={true}>
          <div>Bouncing content</div>
        </Bounce>
      )
      
      expect(container.firstChild).toHaveClass('animate-bounce')
    })
  })

  describe('CardHover', () => {
    it('should render with hover effects', () => {
      render(
        <CardHover>
          <div>Card content</div>
        </CardHover>
      )
      
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should apply hover classes', () => {
      const { container } = render(
        <CardHover hoverShadow={true}>
          <div>Card content</div>
        </CardHover>
      )
      
      expect(container.firstChild).toHaveClass('transition-all', 'hover:shadow-lg', 'cursor-pointer')
    })
  })

  describe('ProgressiveBlur', () => {
    it('should apply blur based on state', () => {
      const { container, rerender } = render(
        <ProgressiveBlur isBlurred={false}>
          <div>Content</div>
        </ProgressiveBlur>
      )
      
      expect(container.firstChild).toHaveClass('blur-0')
      
      rerender(
        <ProgressiveBlur isBlurred={true}>
          <div>Content</div>
        </ProgressiveBlur>
      )
      
      expect(container.firstChild).toHaveClass('blur-md')
    })

    it('should apply different blur intensities', () => {
      const { container, rerender } = render(
        <ProgressiveBlur isBlurred={true} intensity="light">
          <div>Content</div>
        </ProgressiveBlur>
      )
      
      expect(container.firstChild).toHaveClass('blur-sm')
      
      rerender(
        <ProgressiveBlur isBlurred={true} intensity="strong">
          <div>Content</div>
        </ProgressiveBlur>
      )
      
      expect(container.firstChild).toHaveClass('blur-lg')
    })
  })

  describe('Typewriter', () => {
    it('should progressively type out text', () => {
      render(<Typewriter text="Hello World" speed={50} />)
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      expect(screen.getByText(/H/)).toBeInTheDocument()
      
      act(() => {
        jest.advanceTimersByTime(500)
      })
      
      expect(screen.getByText(/Hello/)).toBeInTheDocument()
    })

    it('should apply delay before starting', () => {
      render(<Typewriter text="Test" speed={50} delay={200} />)
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      expect(screen.queryByText('T')).not.toBeInTheDocument()
      
      act(() => {
        jest.advanceTimersByTime(200)
      })
      
      expect(screen.getByText(/T/)).toBeInTheDocument()
    })

    it('should call onComplete when finished', () => {
      const onComplete = jest.fn()
      
      render(<Typewriter text="Hi" speed={50} onComplete={onComplete} />)
      
      act(() => {
        jest.advanceTimersByTime(200)
      })
      
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('Counter', () => {
    it('should animate from start to end value', () => {
      render(<Counter from={0} to={100} duration={1000} />)
      
      expect(screen.getByText('0')).toBeInTheDocument()
      
      act(() => {
        jest.advanceTimersByTime(500)
      })
      
      // Should be somewhere between 0 and 100
      const text = screen.getByText(/\d+/).textContent
      const value = parseInt(text || '0')
      expect(value).toBeGreaterThan(0)
      expect(value).toBeLessThan(100)
      
      act(() => {
        jest.advanceTimersByTime(500)
      })
      
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should handle negative values', () => {
      render(<Counter from={100} to={0} duration={1000} />)
      
      expect(screen.getByText('100')).toBeInTheDocument()
      
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should apply delay before starting', () => {
      render(<Counter from={0} to={10} duration={100} delay={200} />)
      
      expect(screen.getByText('0')).toBeInTheDocument()
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      expect(screen.getByText('0')).toBeInTheDocument()
      
      act(() => {
        jest.advanceTimersByTime(200)
      })
      
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })
})