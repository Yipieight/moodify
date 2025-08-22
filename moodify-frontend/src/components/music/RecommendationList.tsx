"use client"

import { useState, useMemo } from "react"
import { Track, EmotionType } from "@/types"
import { TrackCard } from "./TrackCard"
import { MusicPlayer } from "./MusicPlayer"
import { LoadingSpinner } from "@/components/ui/Loading"
import { getEmotionEmoji, getEmotionColor, capitalize } from "@/lib/utils"
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  QueueListIcon
} from "@heroicons/react/24/outline"

interface RecommendationListProps {
  tracks: Track[]
  onTrackSelect: (track: Track) => void
  loading?: boolean
  emotion?: EmotionType
  title?: string
  showPlayer?: boolean
  showFilters?: boolean
  variant?: 'grid' | 'list'
  className?: string
}

type SortOption = 'name' | 'artist' | 'popularity' | 'duration'
type FilterOption = 'all' | 'with-preview' | 'popular'

export function RecommendationList({
  tracks,
  onTrackSelect,
  loading = false,
  emotion,
  title,
  showPlayer = true,
  showFilters = true,
  variant = 'grid',
  className = ""
}: RecommendationListProps) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>('popularity')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set())

  // Filter and sort tracks
  const filteredAndSortedTracks = useMemo(() => {
    let filtered = tracks.filter(track => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          track.name.toLowerCase().includes(query) ||
          track.artist.toLowerCase().includes(query) ||
          track.album.toLowerCase().includes(query)
        )
      }
      return true
    }).filter(track => {
      // Additional filters
      switch (filterBy) {
        case 'with-preview':
          return track.previewUrl
        case 'popular':
          return track.popularity && track.popularity > 70
        default:
          return true
      }
    })

    // Sort tracks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'artist':
          return a.artist.localeCompare(b.artist)
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0)
        case 'duration':
          return a.duration - b.duration
        default:
          return 0
      }
    })

    return filtered
  }, [tracks, searchQuery, sortBy, filterBy])

  const handleTrackPlay = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    onTrackSelect(track)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleNext = () => {
    if (!currentTrack) return
    
    const currentIndex = filteredAndSortedTracks.findIndex(t => t.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % filteredAndSortedTracks.length
    const nextTrack = filteredAndSortedTracks[nextIndex]
    
    if (nextTrack) {
      handleTrackPlay(nextTrack)
    }
  }

  const handlePrevious = () => {
    if (!currentTrack) return
    
    const currentIndex = filteredAndSortedTracks.findIndex(t => t.id === currentTrack.id)
    const prevIndex = currentIndex === 0 ? filteredAndSortedTracks.length - 1 : currentIndex - 1
    const prevTrack = filteredAndSortedTracks[prevIndex]
    
    if (prevTrack) {
      handleTrackPlay(prevTrack)
    }
  }

  const handleShuffle = () => {
    if (filteredAndSortedTracks.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * filteredAndSortedTracks.length)
    const randomTrack = filteredAndSortedTracks[randomIndex]
    handleTrackPlay(randomTrack)
  }

  const handleLike = (track: Track) => {
    const newLikedTracks = new Set(likedTracks)
    if (likedTracks.has(track.id)) {
      newLikedTracks.delete(track.id)
    } else {
      newLikedTracks.add(track.id)
    }
    setLikedTracks(newLikedTracks)
  }

  const playAll = () => {
    if (filteredAndSortedTracks.length > 0) {
      handleTrackPlay(filteredAndSortedTracks[0])
    }
  }

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Finding the perfect music for your mood...</p>
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className={`text-center p-12 ${className}`}>
        <div className="text-6xl mb-4">🎵</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations available</h3>
        <p className="text-gray-600">Try analyzing your mood again or check your internet connection.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {title && <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>}
          {emotion && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getEmotionEmoji(emotion)}</span>
              <span className={`text-lg font-semibold ${getEmotionColor(emotion)}`}>
                {capitalize(emotion)} Music
              </span>
              <span className="text-gray-600">• {filteredAndSortedTracks.length} tracks</span>
            </div>
          )}
        </div>

        {/* Play Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={playAll}
            disabled={filteredAndSortedTracks.length === 0}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            <span>Play All</span>
          </button>
          
          <button
            onClick={handleShuffle}
            disabled={filteredAndSortedTracks.length === 0}
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tracks, artists, or albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="popularity">Sort by Popularity</option>
            <option value="name">Sort by Name</option>
            <option value="artist">Sort by Artist</option>
            <option value="duration">Sort by Duration</option>
          </select>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Tracks</option>
            <option value="with-preview">With Preview</option>
            <option value="popular">Popular (70%+)</option>
          </select>

          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => {/* Toggle to grid view */}}
              className={`px-3 py-2 text-sm ${variant === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
            >
              <QueueListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Toggle to list view */}}
              className={`px-3 py-2 text-sm ${variant === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
            >
              <FunnelIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {filteredAndSortedTracks.length === 0 && (searchQuery || filterBy !== 'all') && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tracks found</h3>
          <p className="text-gray-600">Try adjusting your search or filters.</p>
          <button
            onClick={() => {
              setSearchQuery("")
              setFilterBy('all')
            }}
            className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Track List */}
      {filteredAndSortedTracks.length > 0 && (
        <div className={variant === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-2"
        }>
          {filteredAndSortedTracks.map((track, index) => (
            <TrackCard
              key={track.id}
              track={track}
              isPlaying={isPlaying}
              isCurrentTrack={currentTrack?.id === track.id}
              onPlay={handleTrackPlay}
              onPause={handlePause}
              onLike={handleLike}
              isLiked={likedTracks.has(track.id)}
              showIndex={variant === 'list'}
              index={index}
              variant={variant === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>
      )}

      {/* Music Player */}
      {showPlayer && currentTrack && (
        <div className="sticky bottom-4">
          <MusicPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={handlePause}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>
      )}
    </div>
  )
}