/**
 * Error Scenario Tests
 * Tests critical error handling paths and edge cases in the application
 */

import { spotifyService } from '@/lib/spotify'
import { emotionService } from '@/lib/emotionDetection'
import { historyService } from '@/lib/historyService'

// Mock fetch for API testing
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Error Scenarios', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    jest.clearAllMocks()
  })

  describe('Spotify Service Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network timeout'))

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      // Should return fallback recommendations instead of throwing
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle 401 Unauthorized responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response)

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      // Should fallback to offline recommendations
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle 429 Rate Limit responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({
          'Retry-After': '60'
        })
      } as Response)

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      // Should return fallback recommendations
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle 500 Internal Server Error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response)

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Response)

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle empty track responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          tracks: []
        })
      } as Response)

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      // Should return fallback recommendations when API returns empty
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle missing environment variables', async () => {
      // Mock missing environment variables
      const originalClientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
      const originalClientSecret = process.env.SPOTIFY_CLIENT_SECRET
      
      delete process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
      delete process.env.SPOTIFY_CLIENT_SECRET

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      // Should fallback to offline recommendations
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)

      // Restore environment variables
      process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID = originalClientId
      process.env.SPOTIFY_CLIENT_SECRET = originalClientSecret
    })
  })

  describe('Emotion Detection Error Handling', () => {
    it('should handle models failing to load', async () => {
      const mockError = new Error('Failed to load models')
      
      // Mock face-api to throw error during model loading
      const faceApi = require('face-api.js')
      faceApi.nets.tinyFaceDetector.loadFromUri.mockRejectedValue(mockError)

      await expect(emotionService.loadModels())
        .rejects.toThrow('Failed to load face detection models')
    })

    it('should handle corrupted image data', async () => {
      await emotionService.loadModels()

      const corruptedImage = {
        width: 0,
        height: 0,
        tagName: 'IMG'
      } as HTMLImageElement

      const faceApi = require('face-api.js')
      faceApi.detectAllFaces.mockReturnValue({
        withFaceExpressions: jest.fn().mockRejectedValue(new Error('Corrupted image'))
      })

      await expect(emotionService.analyzeImage(corruptedImage))
        .rejects.toThrow('Failed to analyze emotions')
    })

    it('should handle no face detected in image', async () => {
      await emotionService.loadModels()

      const imageElement = {
        width: 640,
        height: 480,
        tagName: 'IMG'
      } as HTMLImageElement

      const faceApi = require('face-api.js')
      faceApi.detectAllFaces.mockReturnValue({
        withFaceExpressions: jest.fn().mockResolvedValue([])
      })

      await expect(emotionService.analyzeImage(imageElement))
        .rejects.toThrow('No face detected in the image')
    })

    it('should handle multiple faces in image', async () => {
      await emotionService.loadModels()

      const imageElement = {
        width: 640,
        height: 480,
        tagName: 'IMG'
      } as HTMLImageElement

      const multipleFaces = [
        {
          expressions: {
            happy: 0.8,
            sad: 0.1,
            angry: 0.05,
            surprised: 0.03,
            neutral: 0.01,
            fear: 0.005,
            disgust: 0.005
          }
        },
        {
          expressions: {
            happy: 0.2,
            sad: 0.7,
            angry: 0.05,
            surprised: 0.03,
            neutral: 0.01,
            fear: 0.005,
            disgust: 0.005
          }
        }
      ]

      const faceApi = require('face-api.js')
      faceApi.detectAllFaces.mockReturnValue({
        withFaceExpressions: jest.fn().mockResolvedValue(multipleFaces)
      })

      // Should analyze the first detected face
      const result = await emotionService.analyzeImage(imageElement)

      expect(result).toBeDefined()
      expect(result.emotion).toBe('happy')
      expect(result.confidence).toBe(0.8)
    })

    it('should handle webcam access denied', async () => {
      // Mock getUserMedia to simulate permission denied
      const mockGetUserMedia = jest.fn().mockRejectedValue(
        new Error('Permission denied')
      )

      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: mockGetUserMedia
        }
      })

      // This would be tested in a component test, but we're testing the error case
      expect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
      }).rejects.toThrow('Permission denied')
    })
  })

  describe('History Service Error Handling', () => {
    it('should handle localStorage quota exceeded', async () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError')
      })

      const emotionResult = {
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
      } as const

      await expect(historyService.saveEmotionResult(emotionResult))
        .rejects.toThrow()

      localStorage.setItem = originalSetItem
    })

    it('should handle corrupted localStorage data', async () => {
      localStorage.setItem('moodify_history', 'invalid json data')

      const result = await historyService.getHistory({})

      // Should return empty history instead of throwing
      expect(result.history).toEqual([])
      expect(result.pagination.total).toBe(0)
    })

    it('should handle missing localStorage support', async () => {
      const originalLocalStorage = global.localStorage
      
      // @ts-ignore
      delete global.localStorage

      const emotionResult = {
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
      } as const

      await expect(historyService.saveEmotionResult(emotionResult))
        .rejects.toThrow()

      global.localStorage = originalLocalStorage
    })
  })

  describe('Network and Connectivity Errors', () => {
    it('should handle offline scenarios', async () => {
      // Mock network offline
      mockFetch.mockRejectedValue(new Error('Network request failed'))

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      // Should provide offline fallback
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle slow network connections', async () => {
      // Mock slow response
      mockFetch.mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ tracks: [] })
            } as Response)
          }, 5000) // 5 second delay
        })
      )

      // Should timeout gracefully
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      })

      await expect(Promise.race([
        spotifyService.getRecommendationsByEmotion('happy'),
        timeoutPromise
      ])).rejects.toThrow('Request timeout')
    })
  })

  describe('Data Validation Errors', () => {
    it('should handle invalid emotion types', () => {
      const invalidEmotions = {
        invalid_emotion: 0.8,
        another_invalid: 0.2
      }

      expect(() => {
        emotionService.getDominantEmotion(invalidEmotions as any)
      }).toThrow()
    })

    it('should handle confidence values outside valid range', () => {
      const invalidConfidence = {
        happy: 1.5, // > 1.0
        sad: -0.1   // < 0.0
      }

      // Should handle gracefully or normalize values
      expect(() => {
        emotionService.getDominantEmotion(invalidConfidence as any)
      }).not.toThrow()
    })

    it('should handle malformed track data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          tracks: [
            {
              // Missing required fields
              id: 'track-1',
              name: 'Test Song'
              // Missing artists, album, etc.
            }
          ]
        })
      } as Response)

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      // Should handle gracefully and not crash
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Security Error Scenarios', () => {
    it('should handle Content Security Policy violations', () => {
      // Mock CSP violation
      const cspError = new Error('Content Security Policy violation')
      cspError.name = 'SecurityError'

      mockFetch.mockRejectedValue(cspError)

      // Should handle security errors gracefully
      expect(async () => {
        await spotifyService.getRecommendationsByEmotion('happy')
      }).not.toThrow()
    })

    it('should handle CORS errors', async () => {
      mockFetch.mockRejectedValue(new Error('CORS error'))

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      // Should fallback to offline recommendations
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle XSS attempts in user data', async () => {
      const maliciousData = {
        emotion: '<script>alert("xss")</script>',
        confidence: 0.8,
        allEmotions: {
          '<script>': 0.8,
          'alert("xss")': 0.2
        }
      }

      // Should reject or sanitize malicious data
      await expect(historyService.saveEmotionResult(maliciousData as any))
        .rejects.toThrow()
    })
  })

  describe('Resource Loading Errors', () => {
    it('should handle failed model downloads', async () => {
      const faceApi = require('face-api.js')
      faceApi.nets.tinyFaceDetector.loadFromUri.mockRejectedValue(
        new Error('Failed to download model files')
      )

      await expect(emotionService.loadModels())
        .rejects.toThrow('Failed to load face detection models')
    })

    it('should handle insufficient device memory', async () => {
      // Simulate out of memory error
      const faceApi = require('face-api.js')
      faceApi.detectAllFaces.mockRejectedValue(
        new Error('Out of memory')
      )

      await emotionService.loadModels()

      const imageElement = {
        width: 640,
        height: 480,
        tagName: 'IMG'
      } as HTMLImageElement

      await expect(emotionService.analyzeImage(imageElement))
        .rejects.toThrow('Failed to analyze emotions')
    })
  })
})