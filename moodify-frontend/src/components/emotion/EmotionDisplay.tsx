"use client"

import { EmotionResult, EmotionType, FaceDetection } from "@/types"
import { 
  getEmotionColor, 
  getEmotionBgColor, 
  getEmotionEmoji, 
  getEmotionDescription,
  formatConfidence,
  getEmotionValence,
  formatRelativeTime 
} from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { 
  FaceSmileIcon, 
  MusicalNoteIcon, 
  ClockIcon,
  ShareIcon,
  BookmarkIcon
} from "@heroicons/react/24/outline"

interface EmotionDisplayProps {
  emotions: EmotionResult[]
  primaryEmotion: EmotionType
  confidence: number
  imageUrl?: string
  timestamp?: Date
  showActions?: boolean
  showHistory?: boolean
  detailedData?: FaceDetection | null
}

export function EmotionDisplay({
  emotions,
  primaryEmotion,
  confidence,
  imageUrl,
  timestamp = new Date(),
  showActions = true,
  showHistory = false,
  detailedData
}: EmotionDisplayProps) {
  const router = useRouter()
  const [isSharing, setIsSharing] = useState(false)

  const valence = getEmotionValence(primaryEmotion)
  const emoji = getEmotionEmoji(primaryEmotion)
  const description = getEmotionDescription(primaryEmotion)

  const handleGetRecommendations = () => {
    // Navigate to recommendations page with emotion data
    router.push(`/recommendations?emotion=${primaryEmotion}&confidence=${confidence}`)
  }

  const handleSaveToHistory = async () => {
    // This functionality is now handled automatically in the capture page
    // Navigate to history page to show saved results
    router.push('/history')
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Mood Analysis - Moodify",
          text: `I'm feeling ${primaryEmotion} with ${formatConfidence(confidence)} confidence! Check out Moodify for mood-based music recommendations.`,
          url: window.location.origin
        })
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(
          `I'm feeling ${primaryEmotion} with ${formatConfidence(confidence)} confidence! Check out Moodify: ${window.location.origin}`
        )
        alert("Shared text copied to clipboard!")
      }
    } catch (error) {
      console.error("Failed to share:", error)
    } finally {
      setIsSharing(false)
    }
  }

  // Sort all emotions by confidence for detailed view
  const sortedEmotions = detailedData 
    ? Object.entries(detailedData.expressions)
        .map(([emotion, confidence]) => ({ emotion: emotion as EmotionType, confidence }))
        .sort((a, b) => b.confidence - a.confidence)
    : emotions.sort((a, b) => b.confidence - a.confidence)

  return (
    <div className="space-y-6">
      {/* Main Emotion Display */}
      <div className={`rounded-2xl p-8 text-center ${getEmotionBgColor(primaryEmotion)} border-2`}>
        <div className="space-y-4">
          {/* Emoji and Emotion */}
          <div className="text-6xl mb-4">{emoji}</div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-900 capitalize mb-2">
              {primaryEmotion}
            </h2>
            <p className="text-lg text-gray-800 dark:text-gray-900 mb-2">{description}</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl font-semibold text-gray-900 dark:text-gray-900">
                {formatConfidence(confidence)}
              </span>
              <span className="text-gray-700 dark:text-gray-900">confidence</span>
            </div>
          </div>

          {/* Valence Indicator - Updated to ensure visibility */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white bg-opacity-90 text-gray-800">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              valence === 'positive' ? 'bg-green-500' :
              valence === 'negative' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="capitalize font-medium">{valence} emotion</span>
          </div>

          {timestamp && (
            <p className="text-sm text-gray-600 dark:text-gray-700 mt-4">
              Analyzed {formatRelativeTime(timestamp)}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleGetRecommendations}
            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <MusicalNoteIcon className="w-5 h-5" />
            <span>Get Music Recommendations</span>
          </button>

          <button
            onClick={handleSaveToHistory}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors"
          >
            <BookmarkIcon className="w-5 h-5" />
            <span>View in History</span>
          </button>

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            <span>{isSharing ? "Sharing..." : "Share Result"}</span>
          </button>
        </div>
      )}

      {/* Detailed Emotion Breakdown */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaceSmileIcon className="w-5 h-5 mr-2" />
          Emotion Breakdown
        </h3>
        
        <div className="space-y-3">
          {sortedEmotions.map(({ emotion, confidence }) => (
            <div key={emotion} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getEmotionEmoji(emotion)}</span>
                <span className="font-medium text-gray-900 capitalize">{emotion}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      emotion === primaryEmotion ? 'bg-purple-600' : 'bg-gray-400'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                  {formatConfidence(confidence)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview */}
      {imageUrl && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyzed Image</h3>
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Analyzed image"
              className="max-w-sm max-h-64 object-contain rounded-lg border border-gray-200"
            />
          </div>
        </div>
      )}

      {/* Analysis Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Primary Emotion:</span>
            <span className="ml-2 text-gray-900 capitalize">{primaryEmotion}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Confidence Level:</span>
            <span className="ml-2 text-gray-900">{formatConfidence(confidence)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Emotional Valence:</span>
            <span className="ml-2 text-gray-900 capitalize">{valence}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Analysis Time:</span>
            <span className="ml-2 text-gray-900">{formatRelativeTime(timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Recent History Link */}
      {showHistory && (
        <div className="text-center">
          <button
            onClick={() => router.push("/history")}
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <ClockIcon className="w-4 h-4" />
            <span>View Analysis History</span>
          </button>
        </div>
      )}

      {/* Tips for Better Results */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-900 font-medium mb-2">Understanding Your Results</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Higher confidence scores indicate more reliable emotion detection</li>
          <li>• Multiple emotions can be present simultaneously</li>
          <li>• Lighting and image quality affect detection accuracy</li>
          <li>• Results reflect your facial expression at the moment of analysis</li>
        </ul>
      </div>
    </div>
  )
}