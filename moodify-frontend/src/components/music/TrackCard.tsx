"use client"

import { useState } from "react"
import { Track } from "@/types"
import { formatTime } from "@/lib/utils"
import { 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  ArrowTopRightOnSquareIcon,
  HeartIcon,
  PlusIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"

interface TrackCardProps {
  track: Track
  isPlaying?: boolean
  isCurrentTrack?: boolean
  onPlay: (track: Track) => void
  onPause: () => void
  onAddToPlaylist?: (track: Track) => void
  onLike?: (track: Track) => void
  isLiked?: boolean
  showIndex?: boolean
  index?: number
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export function TrackCard({
  track,
  isPlaying = false,
  isCurrentTrack = false,
  onPlay,
  onPause,
  onAddToPlaylist,
  onLike,
  isLiked = false,
  showIndex = false,
  index,
  variant = 'default',
  className = ""
}: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handlePlayPause = () => {
    if (isCurrentTrack && isPlaying) {
      onPause()
    } else {
      onPlay(track)
    }
  }

  const handleLike = () => {
    onLike?.(track)
  }

  const handleAddToPlaylist = () => {
    onAddToPlaylist?.(track)
    setShowMenu(false)
  }

  const openInSpotify = () => {
    if (track.spotifyUrl) {
      window.open(track.spotifyUrl, '_blank')
    }
  }

  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group ${
          isCurrentTrack ? 'bg-purple-50 border border-purple-200' : ''
        } ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Index or Play Button */}
        <div className="w-8 text-center mr-4">
          {isHovered || isCurrentTrack ? (
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              {isCurrentTrack && isPlaying ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="text-gray-500 text-sm">
              {showIndex && index !== undefined ? index + 1 : '♪'}
            </span>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{track.name}</p>
          <p className="text-sm text-gray-600 truncate">{track.artist}</p>
        </div>

        {/* Duration */}
        <div className="text-sm text-gray-500 mr-4">
          {formatTime(track.duration)}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onLike && (
            <button
              onClick={handleLike}
              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              {isLiked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
          )}
          
          <button
            onClick={openInSpotify}
            className="p-1 text-gray-500 hover:text-green-600 transition-colors"
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
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all group ${
        isCurrentTrack ? 'ring-2 ring-purple-500' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Track Image and Play Button */}
        <div className="relative mb-4">
          {track.imageUrl ? (
            <img
              src={track.imageUrl}
              alt={`${track.album} cover`}
              className="w-full aspect-square object-cover rounded-lg"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <SpeakerWaveIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Play/Pause Overlay */}
          <div className={`absolute inset-0 bg-purple-900 bg-opacity-60 rounded-lg flex items-center justify-center transition-opacity ${
            isHovered || isCurrentTrack ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              {isCurrentTrack && isPlaying ? (
                <PauseIcon className="w-6 h-6 text-gray-900" />
              ) : (
                <PlayIcon className="w-6 h-6 text-gray-900 ml-0.5" />
              )}
            </button>
          </div>

          {/* Preview Indicator */}
          {!track.previewUrl && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              No Preview
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 truncate mb-1">{track.name}</h3>
          <p className="text-gray-600 truncate mb-1">{track.artist}</p>
          <p className="text-sm text-gray-500 truncate">{track.album}</p>
        </div>

        {/* Track Details */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>{formatTime(track.duration)}</span>
          {track.popularity && (
            <span className="flex items-center">
              ♪ {track.popularity}%
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {onLike && (
              <button
                onClick={handleLike}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title={isLiked ? "Unlike" : "Like"}
              >
                {isLiked ? (
                  <HeartIconSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </button>
            )}

            {onAddToPlaylist && (
              <button
                onClick={handleAddToPlaylist}
                className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                title="Add to playlist"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            )}

            {/* More options menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                  <button
                    onClick={openInSpotify}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    <span>Open in Spotify</span>
                  </button>
                  {onAddToPlaylist && (
                    <button
                      onClick={handleAddToPlaylist}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
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
            className="text-green-600 hover:text-green-700 transition-colors text-sm font-medium"
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