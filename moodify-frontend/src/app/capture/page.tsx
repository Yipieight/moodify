"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Loading } from "@/components/ui/Loading"
import { WebcamCapture } from "@/components/camera/WebcamCapture"
import { ImageUpload } from "@/components/camera/ImageUpload"
import { EmotionDisplay } from "@/components/emotion/EmotionDisplay"
import { EmotionResult } from "@/types"
import { useHistory } from "@/hooks/useHistory"
import { CameraIcon, PhotoIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"

type CaptureMode = 'select' | 'camera' | 'upload'
type AnalysisStep = 'capture' | 'results'

export default function CapturePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { saveEmotion, error: historyError } = useHistory()
  const [captureMode, setCaptureMode] = useState<CaptureMode>('select')
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('capture')
  const [emotionResult, setEmotionResult] = useState<EmotionResult | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <MainLayout>
        <Loading message="Loading capture page..." />
      </MainLayout>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect
  }

  const handleWebcamCapture = (imageData: string) => {
    setCapturedImage(imageData)
  }

  const handleImageUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleEmotionDetected = async (emotion: EmotionResult) => {
    try {
      setSaveError(null)
      
      // Add captured image URL to emotion result if available
      const emotionWithImage = {
        ...emotion,
        imageUrl: capturedImage || (uploadedFile ? URL.createObjectURL(uploadedFile) : undefined)
      }
      
      setEmotionResult(emotionWithImage)
      setAnalysisStep('results')
      
      // Save to history automatically
      await saveEmotion(emotionWithImage)
    } catch (error) {
      console.error('Failed to save emotion to history:', error)
      setSaveError('Failed to save your emotion analysis to history. You can still view the results.')
      
      // Still show the results even if saving fails
      setEmotionResult(emotion)
      setAnalysisStep('results')
    }
  }

  const handleError = (error: string) => {
    setSaveError('Failed to capture your image. Please try again.')
  }

  const resetCapture = () => {
    setCaptureMode('select')
    setAnalysisStep('capture')
    setEmotionResult(null)
    setCapturedImage(null)
    setUploadedFile(null)
    setSaveError(null)
  }

  const goBack = () => {
    if (analysisStep === 'results') {
      setAnalysisStep('capture')
      setEmotionResult(null)
    } else if (captureMode !== 'select') {
      setCaptureMode('select')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with navigation */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {analysisStep === 'results' ? 'Your Emotion Analysis' : 'Capture Your Mood'}
          </h1>
          <p className="text-gray-600">
            {analysisStep === 'results' 
              ? 'Here are your emotion analysis results' 
              : 'Choose how you&apos;d like to capture your photo for emotion analysis'
            }
          </p>
        </div>

        {analysisStep === 'capture' && (
          <>
            {/* Mode Selection */}
            {captureMode === 'select' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => setCaptureMode('camera')}>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CameraIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Use Camera</h3>
                  <p className="text-gray-600 mb-6">
                    Capture your expression in real-time using your device&apos;s camera
                  </p>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                    Start Camera
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => setCaptureMode('upload')}>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhotoIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Image</h3>
                  <p className="text-gray-600 mb-6">
                    Upload a photo from your device to analyze your emotional state
                  </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                    Choose File
                  </button>
                </div>
              </div>
            )}

            {/* Camera Capture */}
            {captureMode === 'camera' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <WebcamCapture
                    onCapture={handleWebcamCapture}
                    onEmotionDetected={handleEmotionDetected}
                    onError={handleError}
                    width={640}
                    height={480}
                  />
                </div>
              </div>
            )}

            {/* Image Upload */}
            {captureMode === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onEmotionDetected={handleEmotionDetected}
                    onError={handleError}
                    maxSize={10}
                    previewWidth={600}
                    previewHeight={400}
                  />
                </div>
              </div>
            )}

            {/* How It Works - Only show in select mode */}
            {captureMode === 'select' && (
              <div className="mt-12 bg-gray-50 rounded-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Capture</h3>
                    <p className="text-sm text-gray-600">
                      Take a photo or upload an image showing your face
                    </p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Analyze</h3>
                    <p className="text-sm text-gray-600">
                      Our AI detects your emotional state from your facial expression
                    </p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Discover</h3>
                    <p className="text-sm text-gray-600">
                      Get personalized music recommendations that match your mood
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Results Display */}
        {analysisStep === 'results' && emotionResult && (
          <div className="max-w-3xl mx-auto">
            {/* Save Error Display */}
            {saveError && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      History Save Warning
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>{saveError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <EmotionDisplay
              emotions={[emotionResult]}
              primaryEmotion={emotionResult.emotion}
              confidence={emotionResult.confidence}
              imageUrl={capturedImage || (uploadedFile ? URL.createObjectURL(uploadedFile) : undefined)}
              timestamp={emotionResult.timestamp}
              showActions={true}
              showHistory={true}
            />
            
            {/* Try Again Button */}
            <div className="mt-8 text-center">
              <button
                onClick={resetCapture}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                Analyze Another Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}