"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import Webcam from "react-webcam"
import { EmotionResult } from "@/types"
import { emotionDetectionService } from "@/lib/emotionDetection"
import { LoadingSpinner } from "@/components/ui/Loading"
import { 
  CameraIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline"

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void
  onEmotionDetected: (emotion: EmotionResult) => void
  onError?: (error: string) => void
  width?: number
  height?: number
  mirrored?: boolean
}

export function WebcamCapture({
  onCapture,
  onEmotionDetected,
  onError,
  width = 640,
  height = 480,
  mirrored = true
}: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")

  // Initialize emotion detection service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await emotionDetectionService.initialize()
        setIsInitialized(true)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize emotion detection"
        setError(errorMessage)
        onError?.(errorMessage)
      }
    }

    initializeService()
  }, [onError])

  // Get available camera devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput')
        setDevices(videoDevices)
        if (videoDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      } catch (err) {
        console.error("Error getting media devices:", err)
      }
    }

    getDevices()
  }, [selectedDevice])

  const videoConstraints = {
    width,
    height,
    facingMode: "user",
    deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
  }

  const handleUserMedia = useCallback(() => {
    setHasPermission(true)
    setError(null)
  }, [])

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    setHasPermission(false)
    const errorMessage = typeof error === 'string' ? error : error.message
    setError(errorMessage)
    onError?.(errorMessage)
  }, [onError])

  const capturePhoto = useCallback(async () => {
    if (!webcamRef.current || !isInitialized) {
      setError("Camera or emotion detection not ready")
      return
    }

    setIsCapturing(true)
    setIsAnalyzing(true)
    setError(null)

    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) {
        throw new Error("Failed to capture image")
      }

      // Notify parent about the capture
      onCapture(imageSrc)

      // Analyze emotions
      const emotionResult = await emotionDetectionService.detectEmotionsFromBase64(imageSrc)
      
      if (emotionResult) {
        onEmotionDetected(emotionResult)
      } else {
        throw new Error("No face detected in the captured image")
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze emotions"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsCapturing(false)
      setIsAnalyzing(false)
    }
  }, [onCapture, onEmotionDetected, onError, isInitialized])

  const retryCapture = useCallback(() => {
    setError(null)
    setHasPermission(null)
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Initializing emotion detection...</p>
      </div>
    )
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Camera Access Required</h3>
        <p className="text-red-700 text-center mb-4">
          Please allow camera access to capture your photo for emotion analysis.
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
        )}
        <button
          onClick={retryCapture}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Camera Selection */}
      {devices.length > 1 && (
        <div className="flex items-center space-x-2">
          <label htmlFor="camera-select" className="text-sm font-medium text-gray-700">
            Camera:
          </label>
          <select
            id="camera-select"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            {devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Webcam Container */}
      <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          width={width}
          height={height}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          mirrored={mirrored}
          className="w-full h-auto"
        />

        {/* Overlay for capturing state */}
        {isCapturing && (
          <div className="absolute inset-0 bg-purple-900 bg-opacity-75 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Capturing...</p>
            </div>
          </div>
        )}

        {/* Face detection guidance overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-48 h-48 border-2 border-purple-400 border-dashed rounded-full opacity-60"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600">
              <div className="text-center">
                <div className="text-xs font-medium bg-white bg-opacity-90 px-2 py-1 rounded-full">Position your face here</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={capturePhoto}
          disabled={isCapturing || isAnalyzing || !hasPermission}
          className="flex items-center justify-center w-16 h-16 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-full shadow-lg transition-colors"
        >
          {isAnalyzing ? (
            <LoadingSpinner size="sm" />
          ) : (
            <CameraIcon className="w-8 h-8" />
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isAnalyzing 
              ? "Analyzing your emotions..." 
              : "Position your face in the circle and click to capture"
            }
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-red-900 font-medium">Error</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto pl-3"
            >
              <XMarkIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-900 font-medium mb-2">Tips for best results:</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Ensure good lighting on your face</li>
          <li>• Look directly at the camera</li>
          <li>• Keep your face within the circle guide</li>
          <li>• Remove glasses or masks if possible</li>
        </ul>
      </div>
    </div>
  )
}