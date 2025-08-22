"use client"

import { ReactNode } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline'

interface FormFieldProps {
  label: string
  error?: string
  success?: string
  info?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({ 
  label, 
  error, 
  success, 
  info, 
  required = false, 
  children, 
  className = "" 
}: FormFieldProps) {
  const hasError = !!error
  const hasSuccess = !!success && !error
  const hasInfo = !!info && !error && !success

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
        
        {/* Status icon */}
        {(hasError || hasSuccess) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {hasError && (
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            )}
            {hasSuccess && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Feedback messages */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="text-sm text-green-600 flex items-center">
          <CheckCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {success}
        </p>
      )}
      
      {info && !error && !success && (
        <p className="text-sm text-gray-600 flex items-center">
          <InformationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {info}
        </p>
      )}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

export function Input({ 
  error = false, 
  success = false, 
  className = "", 
  ...props 
}: InputProps) {
  const baseClasses = "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
  
  const statusClasses = error 
    ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500" 
    : success
    ? "border-green-300 text-green-900 focus:border-green-500"
    : "border-gray-300 focus:border-purple-500"

  return (
    <input
      className={`${baseClasses} ${statusClasses} ${className}`}
      {...props}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  success?: boolean
}

export function Textarea({ 
  error = false, 
  success = false, 
  className = "", 
  ...props 
}: TextareaProps) {
  const baseClasses = "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-vertical"
  
  const statusClasses = error 
    ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500" 
    : success
    ? "border-green-300 text-green-900 focus:border-green-500"
    : "border-gray-300 focus:border-purple-500"

  return (
    <textarea
      className={`${baseClasses} ${statusClasses} ${className}`}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  success?: boolean
}

export function Select({ 
  error = false, 
  success = false, 
  className = "", 
  children,
  ...props 
}: SelectProps) {
  const baseClasses = "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white"
  
  const statusClasses = error 
    ? "border-red-300 text-red-900 focus:border-red-500" 
    : success
    ? "border-green-300 text-green-900 focus:border-green-500"
    : "border-gray-300 focus:border-purple-500"

  return (
    <select
      className={`${baseClasses} ${statusClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'purple' | 'blue' | 'green' | 'red' | 'yellow'
  className?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  showPercentage = false,
  size = 'md',
  color = 'purple',
  className = "" 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }
  
  const colorClasses = {
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  }

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  completedSteps?: number[]
  className?: string
}

export function StepIndicator({ 
  steps, 
  currentStep, 
  completedSteps = [],
  className = "" 
}: StepIndicatorProps) {
  return (
    <nav className={`flex items-center justify-center ${className}`}>
      <ol className="flex items-center space-x-5">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep && !isCompleted
          
          return (
            <li key={step} className="flex items-center">
              {/* Step circle */}
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                ${isCompleted 
                  ? 'bg-green-600 border-green-600 text-white' 
                  : isCurrent
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
                }
              `}>
                {isCompleted ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              {/* Step label */}
              <span className={`
                ml-2 text-sm font-medium
                ${isCompleted 
                  ? 'text-green-600' 
                  : isCurrent
                  ? 'text-purple-600'
                  : 'text-gray-500'
                }
              `}>
                {step}
              </span>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  w-5 h-0.5 ml-5
                  ${index < currentStep || completedSteps.includes(index + 1)
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                  }
                `} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'info'
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  const typeStyles = {
    danger: {
      icon: ExclamationCircleIcon,
      iconColor: 'text-red-600',
      confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    warning: {
      icon: ExclamationCircleIcon,
      iconColor: 'text-yellow-600',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    info: {
      icon: InformationCircleIcon,
      iconColor: 'text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  }

  const style = typeStyles[type]
  const Icon = style.icon

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-${type === 'danger' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-100 sm:mx-0 sm:h-10 sm:w-10`}>
                <Icon className={`h-6 w-6 ${style.iconColor}`} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${style.confirmButton} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors`}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}