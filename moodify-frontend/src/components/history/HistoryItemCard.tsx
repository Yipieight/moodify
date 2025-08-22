"use client"

import { useState } from 'react'
import { HistoryEntry } from '@/lib/historyService'
import { EmotionResult, MusicRecommendation, EmotionType } from '@/types'
import { 
  FaceSmileIcon,
  MusicalNoteIcon,
  CalendarIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface HistoryItemCardProps {
  item: HistoryEntry
  selected: boolean
  onSelect: (selected: boolean) => void
  onDelete: () => void
  getEmotionColor: (emotion: EmotionType) => string
}

export function HistoryItemCard({ 
  item, 
  selected, 
  onSelect, 
  onDelete, 
  getEmotionColor 
}: HistoryItemCardProps) {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderEmotionDetails = (emotion: EmotionResult) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaceSmileIcon className="h-6 w-6 text-purple-500" />
          <div>
            <h3 className="font-semibold text-gray-900">Emotion Analysis</h3>
            <p className="text-sm text-gray-600">
              Detected: <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEmotionColor(emotion.emotion)}`}>
                {emotion.emotion}
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {Math.round(emotion.confidence * 100)}% confidence
          </p>
          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${emotion.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {expanded && emotion.imageUrl && (
        <div className="mt-4">
          <img 
            src={emotion.imageUrl} 
            alt="Captured emotion"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  )

  const renderRecommendationDetails = (recommendation: MusicRecommendation) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <MusicalNoteIcon className="h-6 w-6 text-green-500" />
        <div>
          <h3 className="font-semibold text-gray-900">Music Recommendation</h3>
          <p className="text-sm text-gray-600">
            Based on: <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEmotionColor(recommendation.emotion)}`}>
              {recommendation.emotion}
            </span>
          </p>
        </div>
      </div>

      <div className="ml-9">
        <p className="text-sm text-gray-600 mb-2">
          {recommendation.tracks.length} tracks recommended
        </p>
        
        {!expanded && recommendation.tracks.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Top track:</span>
            <span className="font-medium text-gray-900">
              {recommendation.tracks[0].name} by {recommendation.tracks[0].artist}
            </span>
          </div>
        )}

        {expanded && (
          <div className="space-y-2 mt-3">
            <h4 className="text-sm font-medium text-gray-900">All Recommended Tracks:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recommendation.tracks.map((track, index) => (
                <div key={track.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  {track.imageUrl && (
                    <img 
                      src={track.imageUrl} 
                      alt={track.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {track.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {track.artist} • {track.album}
                    </p>
                  </div>
                  {track.previewUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Play preview logic could go here
                      }}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <MusicalNoteIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const data = item.type === 'emotion' 
    ? item.data as EmotionResult 
    : item.data as MusicRecommendation

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header with timestamp */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDate(item.createdAt)}</span>
              <ClockIcon className="h-4 w-4 ml-2" />
              <span>{formatTime(item.createdAt)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-100"
              >
                <EyeIcon className="h-3 w-3 mr-1" />
                {expanded ? 'Less' : 'More'}
                {expanded ? (
                  <ChevronUpIcon className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDownIcon className="h-3 w-3 ml-1" />
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-900 border border-red-300 rounded hover:bg-red-50"
              >
                <TrashIcon className="h-3 w-3 mr-1" />
                Delete
              </button>
            </div>
          </div>

          {/* Content based on type */}
          {item.type === 'emotion' 
            ? renderEmotionDetails(data as EmotionResult)
            : renderRecommendationDetails(data as MusicRecommendation)
          }
        </div>
      </div>
    </div>
  )
}