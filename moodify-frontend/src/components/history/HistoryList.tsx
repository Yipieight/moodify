"use client"

import { useState, useEffect } from 'react'
import { historyService, HistoryEntry, HistoryFilters } from '@/lib/historyService'
import { EmotionResult, MusicRecommendation, EmotionType } from '@/types'
import { HistoryItemCard } from './HistoryItemCard'
import { HistoryFilters as HistoryFiltersComponent } from './HistoryFilters'
import { Loading } from '@/components/ui/Loading'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface HistoryListProps {
  className?: string
}

export function HistoryList({ className = '' }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<HistoryFilters>({
    limit: 20,
    page: 1
  })
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    hasMore: false,
    totalPages: 0
  })
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadHistory()
  }, [filters])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await historyService.getHistory(filters)
      
      if (filters.page === 1) {
        setHistory(response.history)
      } else {
        // Append for pagination
        setHistory(prev => [...prev, ...response.history])
      }
      
      setPagination(response.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<HistoryFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      setFilters(prev => ({
        ...prev,
        page: prev.page! + 1
      }))
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await historyService.deleteHistoryEntry(itemId)
      setHistory(prev => prev.filter(item => item.id !== itemId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return
    
    try {
      setLoading(true)
      const deletePromises = Array.from(selectedItems).map(id => 
        historyService.deleteHistoryEntry(id)
      )
      
      await Promise.all(deletePromises)
      setHistory(prev => prev.filter(item => !selectedItems.has(item.id)))
      setSelectedItems(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete selected items')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectItem = (itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(itemId)
      } else {
        newSet.delete(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(new Set(history.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const blob = await historyService.exportHistory(format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `moodify-history.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export history')
    }
  }

  // Filter history based on search query
  const filteredHistory = history.filter(item => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    
    if (item.type === 'emotion') {
      const emotion = item.data as EmotionResult
      return emotion.emotion.toLowerCase().includes(query)
    } else {
      const recommendation = item.data as MusicRecommendation
      return (
        recommendation.emotion.toLowerCase().includes(query) ||
        recommendation.tracks.some(track => 
          track.name.toLowerCase().includes(query) ||
          track.artist.toLowerCase().includes(query)
        )
      )
    }
  })

  const getEmotionColor = (emotion: EmotionType): string => {
    const colors = {
      happy: 'text-yellow-600 bg-yellow-50',
      sad: 'text-blue-600 bg-blue-50',
      angry: 'text-red-600 bg-red-50',
      surprised: 'text-orange-600 bg-orange-50',
      neutral: 'text-gray-600 bg-gray-50',
      fear: 'text-purple-600 bg-purple-50',
      disgust: 'text-green-600 bg-green-50'
    }
    return colors[emotion] || colors.neutral
  }

  if (loading && history.length === 0) {
    return <Loading message="Loading your history..." />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search your history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <div className="relative">
              <button
                onClick={() => handleExport('json')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>

            {selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete ({selectedItems.size})
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <HistoryFiltersComponent
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Total Entries
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {pagination.total}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Emotions Analyzed
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {history.filter(item => item.type === 'emotion').length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recommendations
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {history.filter(item => item.type === 'recommendation').length}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No results found for your search.' : 'No history entries found.'}
            </p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredHistory.length && filteredHistory.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Select all ({filteredHistory.length} items)
                </span>
              </label>
            </div>

            {/* History Items */}
            <div className="divide-y divide-gray-200">
              {filteredHistory.map((item) => (
                <HistoryItemCard
                  key={item.id}
                  item={item}
                  selected={selectedItems.has(item.id)}
                  onSelect={(selected) => handleSelectItem(item.id, selected)}
                  onDelete={() => handleDeleteItem(item.id)}
                  getEmotionColor={getEmotionColor}
                />
              ))}
            </div>

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="p-6 text-center border-t border-gray-200">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}