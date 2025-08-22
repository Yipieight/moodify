import React from 'react'
import { render, screen } from '@testing-library/react'
import { Loading, LoadingSkeleton, ProgressBar } from '@/components/ui/Loading'

describe('Loading Components', () => {
  describe('Loading', () => {
    it('should render default loading component', () => {
      render(<Loading />)
      
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render with custom message', () => {
      render(<Loading message="Loading your data..." />)
      
      expect(screen.getByText('Loading your data...')).toBeInTheDocument()
    })

    it('should render different variants', () => {
      const { rerender } = render(<Loading variant="spinner" />)
      expect(screen.getByRole('status')).toHaveClass('animate-spin')

      rerender(<Loading variant="dots" />)
      expect(screen.getByRole('status')).toBeInTheDocument()

      rerender(<Loading variant="pulse" />)
      expect(screen.getByRole('status')).toHaveClass('animate-pulse')

      rerender(<Loading variant="bars" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Loading className="custom-class" />)
      
      expect(screen.getByRole('status').parentElement).toHaveClass('custom-class')
    })

    it('should render in different sizes', () => {
      const { rerender } = render(<Loading size="sm" />)
      expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')

      rerender(<Loading size="md" />)
      expect(screen.getByRole('status')).toHaveClass('w-6', 'h-6')

      rerender(<Loading size="lg" />)
      expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8')
    })

    it('should center content when centered prop is true', () => {
      render(<Loading centered />)
      
      expect(screen.getByRole('status').parentElement).toHaveClass('justify-center')
    })
  })

  describe('LoadingSkeleton', () => {
    it('should render skeleton with default props', () => {
      render(<LoadingSkeleton />)
      
      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should render multiple lines', () => {
      render(<LoadingSkeleton lines={3} />)
      
      const skeletons = screen.getAllByTestId('loading-skeleton')
      expect(skeletons).toHaveLength(3)
    })

    it('should apply custom width and height', () => {
      render(<LoadingSkeleton width="200px" height="50px" />)
      
      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toHaveStyle({ width: '200px', height: '50px' })
    })

    it('should render circle variant', () => {
      render(<LoadingSkeleton variant="circle" />)
      
      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toHaveClass('rounded-full')
    })

    it('should apply custom className', () => {
      render(<LoadingSkeleton className="custom-skeleton" />)
      
      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toHaveClass('custom-skeleton')
    })
  })

  describe('ProgressBar', () => {
    it('should render progress bar with value', () => {
      render(<ProgressBar value={50} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })

    it('should show percentage when showValue is true', () => {
      render(<ProgressBar value={75} showValue />)
      
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should render with custom label', () => {
      render(<ProgressBar value={30} label="Processing..." />)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('should apply different colors', () => {
      const { rerender } = render(<ProgressBar value={50} color="blue" />)
      expect(screen.getByRole('progressbar').firstChild).toHaveClass('bg-blue-600')

      rerender(<ProgressBar value={50} color="green" />)
      expect(screen.getByRole('progressbar').firstChild).toHaveClass('bg-green-600')

      rerender(<ProgressBar value={50} color="red" />)
      expect(screen.getByRole('progressbar').firstChild).toHaveClass('bg-red-600')
    })

    it('should handle edge values correctly', () => {
      const { rerender } = render(<ProgressBar value={0} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

      rerender(<ProgressBar value={100} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')

      rerender(<ProgressBar value={150} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')

      rerender(<ProgressBar value={-10} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    })

    it('should be indeterminate when no value is provided', () => {
      render(<ProgressBar />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).not.toHaveAttribute('aria-valuenow')
      expect(progressBar.firstChild).toHaveClass('animate-pulse')
    })

    it('should apply custom className', () => {
      render(<ProgressBar value={50} className="custom-progress" />)
      
      expect(screen.getByRole('progressbar')).toHaveClass('custom-progress')
    })
  })
})