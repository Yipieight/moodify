"use client"

import { useState, useRef, useEffect } from "react"
import { Track } from "@/types"
import { formatTime } from "@/lib/utils"
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline"

interface MusicPlayerProps {
  track: Track | null
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
  onEnded?: () => void // Callback opcional para manejar el final de la canción
  onVolumeChange?: (volume: number) => void
  showPlaylist?: boolean
  className?: string
}

export function MusicPlayer({
  track,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onEnded,
  onVolumeChange,
  showPlaylist = false,
  className = ""
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update audio element when track changes
  useEffect(() => {
    if (audioRef.current && track?.previewUrl) {
      audioRef.current.src = track.previewUrl
      audioRef.current.load()
      setCurrentTime(0)
      setError(null)
    }
  }, [track])

  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && track?.previewUrl) {
        audioRef.current.play().catch((err) => {
          setError("Failed to play audio")
          console.error("Audio play error:", err)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, track])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
    setIsLoading(false)
  }

  const handleEnded = () => {
    if (onEnded) {
      onEnded() // Usar el callback personalizado si está disponible
    } else {
      onNext() // Comportamiento por defecto
    }
  }

  const handleLoadStart = () => {
    setIsLoading(true)
  }

  const handleError = () => {
    setError("Failed to load audio")
    setIsLoading(false)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percentage = (e.clientX - rect.left) / rect.width
      const newTime = percentage * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    onVolumeChange?.(newVolume)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      onPause()
    } else {
      onPlay()
    }
  }

  const openInSpotify = () => {
    if (track?.spotifyUrl) {
      window.open(track.spotifyUrl, '_blank')
    }
  }

  if (!track) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-500">
          <SpeakerWaveIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No track selected</p>
        </div>
      </div>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onLoadStart={handleLoadStart}
        onError={handleError}
        preload="metadata"
      />

      <div className="p-6">
        {/* Track Info */}
        <div className="flex items-center space-x-4 mb-6">
          {track.imageUrl ? (
            <img
              src={track.imageUrl}
              alt={`${track.album} cover`}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <SpeakerWaveIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{track.name}</h3>
            <p className="text-gray-600 truncate">{track.artist}</p>
            <p className="text-sm text-gray-500 truncate">{track.album}</p>
          </div>

          <button
            onClick={openInSpotify}
            className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
            title="Open in Spotify"
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Spotify</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Preview Notice */}
        {!track.previewUrl && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Preview not available for this track. Click "Spotify" to listen on Spotify.
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {track.previewUrl && (
          <div className="mb-4">
            <div 
              className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(Math.floor(currentTime))}</span>
              <span>{formatTime(Math.floor(duration) || track.duration)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-4">
          <button
            onClick={onPrevious}
            className="text-gray-600 hover:text-purple-600 transition-colors"
            disabled={isLoading}
          >
            <BackwardIcon className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlayPause}
            disabled={!track.previewUrl || isLoading}
            className="w-12 h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6 ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="text-gray-600 hover:text-purple-600 transition-colors"
            disabled={isLoading}
          >
            <ForwardIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Volume Controls */}
        {track.previewUrl && (
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMute}
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <span className="text-xs text-gray-500 w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        )}

        {/* Track Details */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Duration:</span>
              <span className="ml-2 text-gray-900">{formatTime(track.duration)}</span>
            </div>
            {track.popularity && (
              <div>
                <span className="text-gray-500">Popularity:</span>
                <span className="ml-2 text-gray-900">{track.popularity}/100</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

