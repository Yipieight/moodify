"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Loading } from "@/components/ui/Loading"
import { RecommendationList } from "@/components/music/RecommendationList"
import { TrackModal } from "@/components/music/TrackModal"
import { useHistory } from "@/hooks/useHistory"
import { useToast, toast } from "@/components/ui/Toast"
import { EmotionType, Track, MusicRecommendation } from "@/types"
import { 
  ArrowLeftIcon, 
  MusicalNoteIcon,
  FaceSmileIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  PlayIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline"

// Utility function to format time (mm:ss)
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function RecommendationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { saveTrack } = useHistory()
  const { addToast } = useToast()
  
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get emotion data from URL params
  const emotion = searchParams.get('emotion') as EmotionType || 'neutral'
  const confidence = parseFloat(searchParams.get('confidence') || '0.5')
  const emotionAnalysisId = searchParams.get('emotionAnalysisId')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && emotion) {
      loadRecommendations()
    }
  }, [status, emotion])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/music/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emotion,
          confidence,
          limit: 20
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get recommendations')
      }

      setTracks(data.data.tracks || [])
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations'
      setError(errorMessage)
      console.error('Error loading recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackSelect = (track: Track) => {
    // Set the selected track and open the modal
    setCurrentTrack(track)
    setIsModalOpen(true)
    console.log('Selected track:', track)
  }

  const handleSaveTrack = async (track: Track) => {
    try {
      await saveTrack(track, emotion as EmotionType, emotionAnalysisId);
      addToast(toast.success('Track Saved', `'${track.name}' has been added to your history.`));
    } catch (error) {
      console.error('Failed to save track to history:', error);
      addToast(toast.error('Failed to Save Track', 'There was an issue saving this track. Please try again.'));
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const goBack = () => {
    router.back()
  }

  if (status === "loading") {
    return (
      <MainLayout>
        <Loading message="Loading recommendations..." />
      </MainLayout>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <FaceSmileIcon className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-medium text-gray-700">
                Feeling: <span className="capitalize font-semibold text-gray-900">{emotion}</span>
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Music Recommendations
          </h1>
          <p className="text-gray-600">
            Discover music that matches your {emotion} mood
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-red-900 font-medium">Unable to Load Recommendations</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={loadRecommendations}
                  className="mt-3 inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <MusicalNoteIcon className="w-6 h-6 text-purple-600 animate-pulse" />
              <span className="text-lg text-gray-600">Finding perfect tracks for your mood...</span>
            </div>
          </div>
        )}

        {/* Selected Track Information */}
        {/* Removed - now showing in modal dialog */}

        {/* Recommendations List */}
        {!loading && tracks.length > 0 && (
          <div className="mt-8">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-900 font-medium mb-1">Track Selection</h4>
                  <p className="text-blue-700 text-sm">
                    Select any track below to view detailed information. 
                    Due to Spotify API limitations, tracks can only be played through Spotify.
                  </p>
                </div>
              </div>
            </div>
            
            <RecommendationList
              tracks={tracks}
              onTrackSelect={handleTrackSelect}
              onSaveTrack={handleSaveTrack}
              selectedTrack={currentTrack}
              loading={loading}
              showPlayer={false} // Don't show the embedded player
              isModalOpen={isModalOpen}
              emotion={emotion}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tracks.length === 0 && (
          <div className="text-center py-12">
            <MusicalNoteIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Recommendations Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any music recommendations for your current mood. Try analyzing your emotion again.
            </p>
            <button
              onClick={() => router.push('/capture')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Analyze Emotion Again
            </button>
          </div>
        )}
      </div>
      <TrackModal 
        track={currentTrack} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </MainLayout>
  )
}