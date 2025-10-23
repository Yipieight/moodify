"use client"

import { useState } from 'react'
import { HistoryFilters as HistoryFiltersType } from '@/lib/historyService'
import { EmotionType } from '@/types'

interface HistoryFiltersProps {
  filters: HistoryFiltersType
  onFiltersChange: (filters: Partial<HistoryFiltersType>) => void
}

export function HistoryFilters({ filters, onFiltersChange }: HistoryFiltersProps) {
  const [localFilters, setLocalFilters] = useState({
    type: filters.type || ('all' as const),
    emotion: '',
    startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : '',
    endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : '',
    limit: filters.limit || 20
  })

  const emotionOptions: Array<{ value: EmotionType; label: string }> = [
    { value: 'happy', label: 'Happy' },
    { value: 'sad', label: 'Sad' },
    { value: 'angry', label: 'Angry' },
    { value: 'surprised', label: 'Surprised' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'fear', label: 'Fear' },
    { value: 'disgust', label: 'Disgust' }
  ]

  const timeRangeOptions = [
    { value: '', label: 'All time' },
    { value: '1', label: 'Last 24 hours' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ]

  const handleApplyFilters = () => {
    const updatedFilters: Partial<HistoryFiltersType> = {
      type: localFilters.type === 'all' ? undefined : localFilters.type as 'emotion' | 'recommendation',
      emotion: localFilters.emotion ? localFilters.emotion as EmotionType : undefined,
      startDate: localFilters.startDate ? new Date(localFilters.startDate) : undefined,
      endDate: localFilters.endDate ? new Date(localFilters.endDate) : undefined,
      limit: localFilters.limit,
      page: 1 // Reset to first page when applying filters
    }

    onFiltersChange(updatedFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      type: 'all' as const,
      emotion: '',
      startDate: '',
      endDate: '',
      limit: 20
    }
    
    setLocalFilters(resetFilters)
    onFiltersChange({
      type: undefined,
      emotion: undefined,
      startDate: undefined,
      endDate: undefined,
      limit: 20,
      page: 1
    })
  }

  const handleTimeRangeChange = (days: string) => {
    if (!days) {
      setLocalFilters(prev => ({
        ...prev,
        startDate: '',
        endDate: ''
      }))
      return
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    setLocalFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Filter Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Content Type
          </label>
          <select
            value={localFilters.type}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, type: e.target.value as 'emotion' | 'recommendation' | 'all' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            <option value="all" className="text-gray-900">All Types</option>
            <option value="emotion" className="text-gray-900">Emotions Only</option>
            <option value="recommendation" className="text-gray-900">Recommendations Only</option>
          </select>
        </div>

        {/* Emotion Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Specific Emotion
          </label>
          <select
            value={localFilters.emotion}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, emotion: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            <option value="" className="text-gray-900">All Emotions</option>
            {emotionOptions.map(option => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Time Range */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Time Range
          </label>
          <select
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Items per page */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Items per page
          </label>
          <select
            value={localFilters.limit}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            <option value={10} className="text-gray-900">10</option>
            <option value={20} className="text-gray-900">20</option>
            <option value={50} className="text-gray-900">50</option>
            <option value={100} className="text-gray-900">100</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={localFilters.startDate}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={localFilters.endDate}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Reset
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}