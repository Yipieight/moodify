import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Toast, ToastProvider, useToast } from '@/components/ui/Toast'

// Test component to use the toast hook
const TestComponent = () => {
  const { addToast } = useToast()

  return (
    <div>
      <button onClick={() => addToast({ title: 'Success', message: 'Success message', type: 'success' })}>
        Add Success Toast
      </button>
      <button onClick={() => addToast({ title: 'Error', message: 'Error message', type: 'error' })}>
        Add Error Toast
      </button>
      <button onClick={() => addToast({ title: 'Warning', message: 'Warning message', type: 'warning' })}>
        Add Warning Toast
      </button>
      <button onClick={() => addToast({ title: 'Info', message: 'Info message', type: 'info' })}>
        Add Info Toast
      </button>
      <button onClick={() => addToast({ title: 'Long Toast', message: 'Message with long duration', type: 'info', duration: 10000 })}>
        Add Long Toast
      </button>
    </div>
  )
}

describe('Toast Components', () => {
  describe('ToastProvider and useToast', () => {
    it('should add and display toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const successButton = screen.getByText('Add Success Toast')
      fireEvent.click(successButton)
      
      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByTestId('toast-success')).toBeInTheDocument()
    })

    it('should handle multiple toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByText('Add Success Toast'))
      fireEvent.click(screen.getByText('Add Error Toast'))
      fireEvent.click(screen.getByText('Add Warning Toast'))
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.getByText('Warning message')).toBeInTheDocument()
    })

    it('should auto-remove toasts after duration', async () => {
      jest.useFakeTimers()
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByText('Add Success Toast'))
      expect(screen.getByText('Success')).toBeInTheDocument()
      
      jest.advanceTimersByTime(3000) // Default duration
      
      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument()
      })
      
      jest.useRealTimers()
    })

    it('should respect custom duration', async () => {
      jest.useFakeTimers()
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByText('Add Long Toast'))
      expect(screen.getByText('Long Toast')).toBeInTheDocument()
      
      jest.advanceTimersByTime(3000) // Default duration
      expect(screen.getByText('Long Toast')).toBeInTheDocument()
      
      jest.advanceTimersByTime(7000) // Additional time to reach 10s total
      
      await waitFor(() => {
        expect(screen.queryByText('Long Toast')).not.toBeInTheDocument()
      })
      
      jest.useRealTimers()
    })

    it('should remove toast when close button is clicked', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByText('Add Success Toast'))
      expect(screen.getByText('Success')).toBeInTheDocument()
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)
      
      expect(screen.queryByText('Success')).not.toBeInTheDocument()
    })

    it('should limit number of toasts', () => {
      render(
        <ToastProvider maxToasts={2}>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByText('Add Success Toast'))
      fireEvent.click(screen.getByText('Add Error Toast'))
      fireEvent.click(screen.getByText('Add Warning Toast'))
      
      // Should only show 2 toasts (latest ones)
      expect(screen.queryByText('Success')).not.toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
    })

    it('should throw error when useToast is used outside provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const TestComponentWithoutProvider = () => {
        useToast()
        return <div>Test</div>
      }

      expect(() => {
        render(<TestComponentWithoutProvider />)
      }).toThrow('useToast must be used within a ToastProvider')
      
      consoleError.mockRestore()
    })
  })
})