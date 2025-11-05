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
  type?: 'emotions' | 'songs'
}

export function HistoryList({ className = '', type = 'emotions' }: HistoryListProps) {
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
  }, [filters, type])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const historyType = type === 'emotions' ? 'emotion' : 'recommendation';
      const response = await historyService.getHistory({ ...filters, type: historyType })
      
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

  // Remove duplicates by track ID for individual tracks
  const filteredHistory = history.filter(item => {
    if (!searchQuery) return true
    
    try {
      const query = searchQuery.toLowerCase()
      
      if (item.type === 'emotion') {
        const emotion = item.data as EmotionResult
        return emotion?.emotion?.toLowerCase().includes(query)
      } else if (item.type === 'recommendation') {
        const recommendation = item.data as MusicRecommendation
        const tracks = recommendation?.tracks || []
        return (
          recommendation?.emotion?.toLowerCase().includes(query) ||
          tracks.some(track => 
            track?.name?.toLowerCase().includes(query) ||
            track?.artist?.toLowerCase().includes(query)
          )
        )
      } else {
        // For individual tracks
        const track = item.data as Track
        return (
          track?.name?.toLowerCase().includes(query) ||
          track?.artist?.toLowerCase().includes(query) ||
          track?.album?.toLowerCase().includes(query)
        )
      }
    } catch (err) {
      console.warn('Error filtering history item:', item, err)
      return false
    }
  })

  // Remove duplicate tracks by ID, keeping the most recent ones
  const removeDuplicateTracks = (historyItems: HistoryEntry[]): HistoryEntry[] => {
    const seenTrackIds = new Set<string>();
    // Reverse the array to process newest items first
    const reversedHistory = [...historyItems].reverse(); 
    
    const uniqueReversed = reversedHistory.filter(item => {
      if (item.type === 'track') {
        const track = item.data as Track;
        if (seenTrackIds.has(track.id)) {
          return false; // Skip this duplicate (which is the older one)
        }
        seenTrackIds.add(track.id);
        return true;
      }
      return true;
    });

    // Reverse back to original order
    return uniqueReversed.reverse();
  };

  // Apply duplicate removal to the filtered history
  const uniqueHistory = removeDuplicateTracks(filteredHistory);

  // New UX: Separate last saved song and group the rest by emotion
  const lastSavedSong = uniqueHistory.length > 0 && type === 'songs' ? uniqueHistory[0] : null;
  const restOfHistory = uniqueHistory.length > 0 && type === 'songs' ? uniqueHistory.slice(1) : uniqueHistory;

  // Group history by emotion (for the rest of the history)
  const groupedByEmotion = restOfHistory.reduce((acc, item) => {
    let emotion: EmotionType | 'unknown' = 'unknown';
    if (item.type === 'recommendation') {
      const recommendationData = item.data as MusicRecommendation;
      emotion = recommendationData.emotion || 'unknown';
    } else if (item.type === 'emotion') {
      const emotionData = item.data as EmotionResult;
      emotion = emotionData.emotion;
    } else {
      return acc; // Ignore other types
    }

    if (!acc[emotion]) {
      acc[emotion] = [];
    }
    acc[emotion].push(item);

    return acc;
  }, {} as Record<string, HistoryEntry[]>);

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

  const getEmotionDotColor = (emotion: EmotionType): string => {
    const colors = {
      happy: 'bg-yellow-500',
      sad: 'bg-blue-500',
      angry: 'bg-red-500',
      surprised: 'bg-orange-500',
      neutral: 'bg-gray-500',
      fear: 'bg-purple-500',
      disgust: 'bg-green-500'
    };
    return colors[emotion] || colors.neutral;
  };

  if (loading && history.length === 0) {
    return <Loading message="Loading your history..." />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Actions Bar (simplified for now) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
              className="block text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Conditional Rendering based on type */}
      {type === 'songs' ? (
        // New UX for saved songs
        <div className="space-y-12">
          {/* Last Saved Song */}
          {lastSavedSong && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Last Saved Song</h2>
                              <HistoryItemCard
                                item={lastSavedSong}
                                variant="featured"
                                getEmotionColor={getEmotionColor}
                                getEmotionDotColor={getEmotionDotColor}
                              />            </div>
          )}

          {/* Rest of the history grouped by emotion */}
          {Object.keys(groupedByEmotion).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Saved Library</h2>
              <div className="space-y-8">
                {Object.entries(groupedByEmotion).map(([emotion, items]) => (
                  <div key={emotion}>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 capitalize flex items-center">
                      <span className={`w-4 h-4 rounded-full mr-3 ${getEmotionDotColor(emotion as EmotionType)}`}></span>
                      {emotion}
                    </h3>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                      {items.map(item => (
                        <HistoryItemCard
                          key={`${item.type}-${item.id}`}
                          item={item}
                          getEmotionColor={getEmotionColor}
                          getEmotionDotColor={getEmotionDotColor}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uniqueHistory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchQuery ? 'No results found for your search.' : 'No saved songs found.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Simple list view for emotions
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {uniqueHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchQuery ? 'No results found for your search.' : 'No emotion history found.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {uniqueHistory.map((item) => (
                <HistoryItemCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  selected={selectedItems.has(item.id)}
                  onSelect={(selected) => handleSelectItem(item.id, selected)}
                  onDelete={() => handleDeleteItem(item.id)}
                  getEmotionColor={getEmotionColor}
                  getEmotionDotColor={getEmotionDotColor}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}