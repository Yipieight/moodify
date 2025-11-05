"use client"

import { useState } from 'react'
import { HistoryEntry } from '@/lib/historyService'
import { 
  EmotionResult, MusicRecommendation, Track, EmotionType 
} from '@/types'
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
  selected?: boolean
  onSelect?: (selected: boolean) => void
  onDelete?: () => void
  getEmotionColor: (emotion: EmotionType) => string
  getEmotionDotColor?: (emotion: EmotionType) => string
  variant?: 'default' | 'featured'
}

export function HistoryItemCard({ 
  item, 
  selected = false, 
  onSelect = () => {},
  onDelete = () => {},
  getEmotionColor,
  getEmotionDotColor = () => 'bg-gray-500',
  variant = 'default'
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

  if (variant === 'featured') {
    if (item.type !== 'recommendation') return null;

    const recommendation = item.data as MusicRecommendation;
    const track = recommendation.tracks[0];
    const emotion = recommendation.emotion;

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        {track.imageUrl && (
            <img src={track.imageUrl} alt={track.name} className="w-32 h-32 rounded-lg object-cover shadow-md"/>
        )}
        <div className="flex-1 text-center md:text-left">
            <p className="text-sm text-gray-500">Your last saved song</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{track.name}</h3>
            <p className="text-lg text-gray-700">{track.artist}</p>
            <div className="mt-3 inline-flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <span className={`w-3 h-3 rounded-full ${getEmotionDotColor(emotion)}`}></span>
                <span className="text-sm font-medium text-gray-800">Saved with emotion: <span className="font-bold capitalize">{emotion}</span></span>
            </div>
        </div>
        <div className="flex flex-col items-center">
             <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                <MusicalNoteIcon className="w-5 h-5" />
                <span>Open in Spotify</span>
            </a>
        </div>
      </div>
    )
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

  const renderRecommendationDetails = (recommendation: MusicRecommendation) => {
    // Ensure tracks array exists and has proper structure
    const tracks = recommendation.tracks || []
    
    return (
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
          {tracks.length} tracks recommended
        </p>
        
        {!expanded && tracks.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Top track:</span>
            <span className="font-medium text-gray-900">
              {tracks[0].name} by {tracks[0].artist}
            </span>
          </div>
        )}

        {expanded && tracks.length > 0 && (
          <div className="space-y-2 mt-3">
            <h4 className="text-sm font-medium text-gray-900">All Recommended Tracks:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {tracks.map((track, index) => (
                <div key={track.id || index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  {track.imageUrl && (
                    <img 
                      src={track.imageUrl} 
                      alt={track.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {track.name || 'Unknown Track'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {track.artist || 'Unknown Artist'} • {track.album || 'Unknown Album'}
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
        
        {expanded && tracks.length === 0 && (
          <div className="text-sm text-gray-500 mt-3">
            No tracks available for this recommendation.
          </div>
        )}
      </div>
    </div>
  )}

  const renderTrackDetails = (track: Track & { emotion?: EmotionType }, emotion?: EmotionType) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <MusicalNoteIcon className="h-6 w-6 text-green-500" />
        <div>
          <h3 className="font-semibold text-gray-900">Favorite Track</h3>
          {emotion && (
            <p className="text-sm text-gray-600">
              Based on: <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEmotionColor(emotion)}`}>
                {emotion}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="ml-9">
        <div className="flex items-center space-x-4">
          {track.imageUrl && (
            <img 
              src={track.imageUrl} 
              alt={track.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{track.name}</h4>
            <p className="text-gray-600 truncate">{track.artist}</p>
            <p className="text-sm text-gray-500 truncate">{track.album}</p>
            <div className="flex items-center mt-1 space-x-4">
              <span className="text-sm text-gray-500">{track.duration} sec</span>
              {track.popularity && (
                <span className="text-sm text-gray-500">Popularity: {track.popularity}/100</span>
              )}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 flex space-x-3">
            {track.spotifyUrl && (
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MusicalNoteIcon className="h-4 w-4 mr-1" />
                Open in Spotify
              </a>
            )}
            {track.previewUrl && (
              <a
                href={track.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MusicalNoteIcon className="h-4 w-4 mr-1" />
                Preview
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const data = item.data

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
            : item.type === 'recommendation'
            ? renderRecommendationDetails(data as MusicRecommendation)
            : renderTrackDetails(data as Track & { emotion?: EmotionType }, (data as Track & { emotion?: EmotionType }).emotion)
          }
        </div>
      </div>
    </div>
  )
}

export default HistoryItemCard
