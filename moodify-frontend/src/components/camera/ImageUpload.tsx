"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { EmotionResult } from "@/types"
import { emotionDetectionService } from "@/lib/emotionDetection"
import { LoadingSpinner } from "@/components/ui/Loading"
import { 
  PhotoIcon, 
  XMarkIcon, 
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from "@heroicons/react/24/outline"

interface ImageUploadProps {
  onImageUpload: (file: File) => void
  onEmotionDetected: (emotion: EmotionResult) => void
  onError?: (error: string) => void
  acceptedFormats?: string[]
  maxSize?: number // in MB
  previewWidth?: number
  previewHeight?: number
}

export function ImageUpload({
  onImageUpload,
  onEmotionDetected,
  onError,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSize = 10, // 10MB
  previewWidth = 400,
  previewHeight = 300
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `File type not supported. Please upload: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return `File too large. Maximum size is ${maxSize}MB`
    }

    return null
  }, [acceptedFormats, maxSize])

  const processFile = useCallback(async (file: File) => {
    if (!isInitialized) {
      setError("Emotion detection not ready")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Analyze emotions
      const emotionResult = await emotionDetectionService.detectEmotionsFromFile(file)
      
      if (emotionResult) {
        setUploadedFile(file)
        onImageUpload(file)
        onEmotionDetected(emotionResult)
      } else {
        throw new Error("No face detected in the uploaded image")
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze emotions"
      setError(errorMessage)
      onError?.(errorMessage)
      setUploadedImage(null)
      setUploadedFile(null)
    } finally {
      setIsAnalyzing(false)
    }
  }, [validateFile, onImageUpload, onEmotionDetected, onError, isInitialized])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }, [processFile])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }, [handleFileSelect])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const clearUpload = useCallback(() => {
    setUploadedImage(null)
    setUploadedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Initializing emotion detection...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      {!uploadedImage && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              {isAnalyzing ? (
                <LoadingSpinner size="md" />
              ) : (
                <PhotoIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            {isAnalyzing ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Analyzing your image...</h3>
                <p className="text-gray-600">Please wait while we detect emotions</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {dragActive ? "Drop your image here" : "Upload an image"}
                </h3>
                <p className="text-gray-600">
                  Drag and drop or click to select a photo of your face
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} (max {maxSize}MB)
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={isAnalyzing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              Choose File
            </button>
          </div>

          {dragActive && (
            <div className="absolute inset-0 bg-purple-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <div className="text-purple-600 font-medium">Drop to upload</div>
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {uploadedImage && (
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={uploadedImage}
              alt="Uploaded preview"
              className="w-full h-auto max-h-96 object-contain"
              style={{ maxWidth: previewWidth, maxHeight: previewHeight }}
            />
            
            {/* Success indicator */}
            {uploadedFile && !isAnalyzing && !error && (
              <div className="absolute top-4 right-4 bg-green-100 rounded-full p-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            )}

            {/* Remove button */}
            <button
              onClick={clearUpload}
              className="absolute top-4 left-4 bg-red-100 hover:bg-red-200 rounded-full p-2 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-red-600" />
            </button>
          </div>

          {/* File info */}
          {uploadedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={openFileDialog}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Change Image
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-red-900 font-medium">Upload Error</h4>
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
          <li>• Use a clear, well-lit photo of your face</li>
          <li>• Ensure your face is clearly visible and not obscured</li>
          <li>• Avoid using photos with multiple faces</li>
          <li>• Remove glasses, masks, or other facial coverings if possible</li>
          <li>• Use recent photos that reflect your current mood</li>
        </ul>
      </div>
    </div>
  )
}