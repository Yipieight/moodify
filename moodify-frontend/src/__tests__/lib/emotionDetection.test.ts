import { emotionService } from '@/lib/emotionDetection'

// Mock face-api.js completely
jest.mock('face-api.js', () => ({
  nets: {
    tinyFaceDetector: {
      loadFromUri: jest.fn().mockResolvedValue(true),
    },
    faceExpressionNet: {
      loadFromUri: jest.fn().mockResolvedValue(true),
    },
  },
  detectAllFaces: jest.fn(),
  TinyFaceDetectorOptions: jest.fn().mockImplementation(() => ({})),
  withFaceExpressions: jest.fn(),
}))

describe('EmotionDetection Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loadModels', () => {
    it('should load face detection models successfully', async () => {
      const faceApi = require('face-api.js')
      faceApi.nets.tinyFaceDetector.loadFromUri.mockResolvedValue(true)
      faceApi.nets.faceExpressionNet.loadFromUri.mockResolvedValue(true)

      await expect(emotionService.loadModels()).resolves.not.toThrow()
      
      expect(faceApi.nets.tinyFaceDetector.loadFromUri).toHaveBeenCalledWith('/models')
      expect(faceApi.nets.faceExpressionNet.loadFromUri).toHaveBeenCalledWith('/models')
    })

    it('should handle model loading errors gracefully', async () => {
      const faceApi = require('face-api.js')
      const mockError = new Error('Failed to load models')
      faceApi.nets.tinyFaceDetector.loadFromUri.mockRejectedValue(mockError)

      await expect(emotionService.loadModels()).rejects.toThrow('Failed to load face detection models: Failed to load models')
    })

    it('should not reload models if already loaded', async () => {
      const faceApi = require('face-api.js')
      
      // First call - should load models
      await emotionService.loadModels()
      expect(faceApi.nets.tinyFaceDetector.loadFromUri).toHaveBeenCalledTimes(1)
      
      // Second call - should not reload
      await emotionService.loadModels()
      expect(faceApi.nets.tinyFaceDetector.loadFromUri).toHaveBeenCalledTimes(1)
    })
  })

  describe('analyzeImage', () => {
    const mockImageElement = {
      width: 640,
      height: 480,
      tagName: 'IMG'
    } as HTMLImageElement

    it('should analyze emotions from image successfully', async () => {
      const faceApi = require('face-api.js')
      
      const mockDetections = [{
        expressions: {
          happy: 0.8,
          sad: 0.1,
          angry: 0.05,
          surprised: 0.03,
          neutral: 0.01,
          fear: 0.005,
          disgust: 0.005
        }
      }]

      faceApi.detectAllFaces.mockReturnValue({
        withFaceExpressions: jest.fn().mockResolvedValue(mockDetections)
      })

      const result = await emotionService.analyzeImage(mockImageElement)

      expect(result).toEqual({
        emotion: 'happy',
        confidence: 0.8,
        allEmotions: {
          happy: 0.8,
          sad: 0.1,
          angry: 0.05,
          surprised: 0.03,
          neutral: 0.01,
          fear: 0.005,
          disgust: 0.005
        }
      })
    })

    it('should handle no face detected', async () => {
      const faceApi = require('face-api.js')
      
      faceApi.detectAllFaces.mockReturnValue({
        withFaceExpressions: jest.fn().mockResolvedValue([])
      })

      await expect(emotionService.analyzeImage(mockImageElement))
        .rejects.toThrow('No face detected in the image')
    })

    it('should handle detection errors', async () => {
      const faceApi = require('face-api.js')
      const mockError = new Error('Detection failed')
      
      faceApi.detectAllFaces.mockReturnValue({
        withFaceExpressions: jest.fn().mockRejectedValue(mockError)
      })

      await expect(emotionService.analyzeImage(mockImageElement))
        .rejects.toThrow('Failed to analyze emotions: Detection failed')
    })

    it('should require models to be loaded first', async () => {
      // Reset the service state
      emotionService['modelsLoaded'] = false

      await expect(emotionService.analyzeImage(mockImageElement))
        .rejects.toThrow('Models not loaded. Call loadModels() first.')
    })

    it('should find dominant emotion correctly', async () => {
      const faceApi = require('face-api.js')
      
      const mockDetections = [{
        expressions: {
          happy: 0.1,
          sad: 0.9,  // Highest value
          angry: 0.05,
          surprised: 0.03,
          neutral: 0.01,
          fear: 0.005,
          disgust: 0.005
        }
      }]

      faceApi.detectAllFaces.mockReturnValue({
        withFaceExpressions: jest.fn().mockResolvedValue(mockDetections)
      })

      const result = await emotionService.analyzeImage(mockImageElement)

      expect(result.emotion).toBe('sad')
      expect(result.confidence).toBe(0.9)
    })
  })

  describe('getDominantEmotion', () => {
    it('should find the emotion with highest confidence', () => {
      const emotions = {
        happy: 0.2,
        sad: 0.1,
        angry: 0.8,  // Highest
        surprised: 0.05,
        neutral: 0.01,
        fear: 0.005,
        disgust: 0.005
      }

      const result = emotionService.getDominantEmotion(emotions)
      
      expect(result).toEqual({
        emotion: 'angry',
        confidence: 0.8
      })
    })

    it('should handle empty emotions object', () => {
      const emotions = {}
      
      expect(() => emotionService.getDominantEmotion(emotions))
        .toThrow('No emotions provided')
    })

    it('should handle emotions with equal values', () => {
      const emotions = {
        happy: 0.5,
        sad: 0.5,
        angry: 0.3,
        surprised: 0.3,
        neutral: 0.1,
        fear: 0.1,
        disgust: 0.1
      }

      const result = emotionService.getDominantEmotion(emotions)
      
      // Should return one of the tied emotions (implementation dependent)
      expect(['happy', 'sad']).toContain(result.emotion)
      expect(result.confidence).toBe(0.5)
    })
  })
})