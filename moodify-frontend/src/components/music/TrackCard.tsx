"use client"

import { useState, useEffect } from "react"
import { Track } from "@/types"
import { formatTime } from "@/lib/utils"
import { 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  ArrowTopRightOnSquareIcon,
  HeartIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  BookmarkIcon
} from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"

interface TrackCardProps {
  track: Track
  isPlaying?: boolean
  isCurrentTrack?: boolean
  onSaveTrack?: (track: Track) => void
  onTrackSelect?: (track: Track) => void
  onAddToPlaylist?: (track: Track) => void
  showIndex?: boolean
  index?: number
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
  isModalOpen?: boolean
}

export function TrackCard({
  track,
  isPlaying = false,
  isCurrentTrack = false,
  onSaveTrack,
  onTrackSelect,
  onAddToPlaylist,
  showIndex = false,
  index,
  variant = 'default',
  className = "",
  isModalOpen = false
}: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isModalOpen) {
      setIsHovered(false)
    }
  }, [isModalOpen])
  const [showMenu, setShowMenu] = useState(false)

  const handleSaveTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveTrack?.(track)
  }

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToPlaylist?.(track)
    setShowMenu(false)
  }

  const openInSpotify = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track.spotifyUrl) {
      window.open(track.spotifyUrl, '_blank')
    }
  }

  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group ${
          isCurrentTrack ? 'bg-purple-50 border border-purple-200' : ''
        } ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onTrackSelect?.(track)}
      >
        {/* Index */}
        <div className="w-8 text-center mr-4 transition-all duration-200">
          <span className="text-gray-500 text-sm transition-opacity duration-200">
              {showIndex && index !== undefined ? index + 1 : '♪'}
            </span>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{track.name}</p>
          <p className="text-sm text-gray-600 truncate">{track.artist}</p>
        </div>

        {/* Duration */}
        <div className="text-sm text-gray-500 mr-4 transition-all duration-200">
          {formatTime(track.duration)}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
          <button
            onClick={openInSpotify}
            className="p-1 text-gray-500 hover:text-green-600 transition-all duration-200"
            title="Open in Spotify"
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 group ${
        isCurrentTrack ? 'ring-2 ring-purple-500' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Track Image */}
        <div className="relative mb-4 cursor-pointer" onClick={() => onTrackSelect?.(track)}>
          {track.imageUrl ? (
            <img
              src={track.imageUrl}
              alt={`${track.album} cover`}
              className="w-full aspect-square object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <SpeakerWaveIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Preview Indicator */}
          {!track.previewUrl && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded transition-opacity duration-200">
              No Preview
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="mb-3 transition-all duration-200">
          <h3 className="font-semibold text-gray-900 truncate mb-1 cursor-pointer" onClick={() => onTrackSelect?.(track)}>{track.name}</h3>
          <p className="text-gray-600 truncate mb-1">{track.artist}</p>
          <p className="text-sm text-gray-500 truncate">{track.album}</p>
        </div>

        {/* Track Details */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4 transition-all duration-200">
          <span>{formatTime(track.duration)}</span>
          {track.popularity && (
            <span className="flex items-center">
              ♪ {track.popularity}%
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between transition-all duration-200">
          <div className="flex items-center space-x-2">
            {onSaveTrack && (
              <button
                onClick={handleSaveTrack}
                className="p-2 text-gray-500 hover:text-purple-600 transition-all duration-200"
                title="Save to History"
              >
                <BookmarkIcon className="w-5 h-5" />
              </button>
            )}
            {onAddToPlaylist && (
              <button
                onClick={handleAddToPlaylist}
                className="p-2 text-gray-500 hover:text-purple-600 transition-all duration-200"
                title="Add to playlist"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            )}

            {/* More options menu */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-2 text-gray-500 hover:text-gray-700 transition-all duration-200"
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                  <button
                    onClick={openInSpotify}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    <span>Open in Spotify</span>
                  </button>
                  {onAddToPlaylist && (
                    <button
                      onClick={handleAddToPlaylist}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add to Playlist</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Spotify Link */}
          <button
            onClick={openInSpotify}
            className="text-green-600 hover:text-green-700 transition-colors duration-200 text-sm font-medium"
          >
            Spotify
          </button>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}