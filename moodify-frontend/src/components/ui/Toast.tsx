"use client"

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction = 
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'CLEAR_ALL' }

const ToastContext = createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
} | null>(null)

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast]
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.id)
      }
    case 'CLEAR_ALL':
      return {
        ...state,
        toasts: []
      }
    default:
      return state
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] })

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    }
    
    dispatch({ type: 'ADD_TOAST', toast: newToast })

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id })
      }, newToast.duration)
    }
  }

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id })
  }

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' })
  }

  return (
    <ToastContext.Provider value={{ 
      toasts: state.toasts, 
      addToast, 
      removeToast, 
      clearAll 
    }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast()

  const iconConfig = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      borderColor: 'border-red-200'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
      borderColor: 'border-yellow-200'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    }
  }

  const config = iconConfig[toast.type]
  const Icon = config.icon

  return (
    <div 
      role="alert"
      data-testid={`toast-${toast.type}`}
      className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-lg p-4 shadow-lg
        animate-slideIn transition-all duration-300
        max-w-sm w-full
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} data-testid={`${toast.type}-icon`} />
        </div>
        
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${config.titleColor}`}>
            {toast.title}
          </p>
          
          {toast.message && (
            <p className={`mt-1 text-sm ${config.messageColor}`}>
              {toast.message}
            </p>
          )}
          
          {toast.action && (
            <div className="mt-3">
              <button
                type="button"
                onClick={toast.action.onClick}
                className={`
                  text-sm font-medium ${config.titleColor}
                  hover:underline focus:outline-none
                `}
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            aria-label="Close toast"
            className={`
              inline-flex rounded-md ${config.bgColor}
              ${config.titleColor} hover:${config.messageColor}
              focus:outline-none focus:ring-2 focus:ring-offset-2
              transition-colors
            `}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper functions for common toast types
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => ({
    type: 'success' as const,
    title,
    message,
    ...options
  }),
  
  error: (title: string, message?: string, options?: Partial<Toast>) => ({
    type: 'error' as const,
    title,
    message,
    duration: 7000, // Errors show longer
    ...options
  }),
  
  warning: (title: string, message?: string, options?: Partial<Toast>) => ({
    type: 'warning' as const,
    title,
    message,
    ...options
  }),
  
  info: (title: string, message?: string, options?: Partial<Toast>) => ({
    type: 'info' as const,
    title,
    message,
    ...options
  }),
  
  loading: (title: string, message?: string) => ({
    type: 'info' as const,
    title,
    message,
    duration: 0 // Loading toasts don't auto-dismiss
  })
}