/**
 * Integration tests for the history API routes
 * These tests verify the complete API functionality including error scenarios
 */

import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/history/route'

// Mock localStorage for server environment
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// Mock global localStorage
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

describe('/api/history Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('GET /api/history', () => {
    beforeEach(() => {
      // Set up test data
      const testHistory = [
        {
          id: 'test-1',
          type: 'emotion',
          data: {
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
          },
          timestamp: new Date().toISOString()
        },
        {
          id: 'test-2',
          type: 'recommendation',
          data: {
            emotion: 'happy',
            tracks: [
              {
                id: 'track-1',
                name: 'Happy Song',
                artist: 'Artist 1',
                album: 'Album 1',
                imageUrl: 'https://example.com/image.jpg',
                previewUrl: 'https://example.com/preview.mp3',
                spotifyUrl: 'https://open.spotify.com/track/track-1'
              }
            ],
            timestamp: new Date()
          },
          timestamp: new Date().toISOString()
        }
      ]
      
      localStorage.setItem('moodify_history', JSON.stringify(testHistory))
    })

    it('should return all history entries', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      })

      await handler.GET(req)

      expect(res._getStatusCode()).toBe(200)
      
      const data = JSON.parse(res._getData())
      expect(data).toHaveProperty('history')
      expect(data).toHaveProperty('pagination')
      expect(data.history).toHaveLength(2)
      expect(data.pagination.total).toBe(2)
    })

    it('should apply pagination correctly', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: {
          limit: '1',
          page: '1'
        }
      })

      const response = await handler.GET(req)
      const data = await response.json()

      expect(data.history).toHaveLength(1)
      expect(data.pagination.hasMore).toBe(true)
      expect(data.pagination.totalPages).toBe(2)
    })

    it('should filter by type', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: {
          type: 'emotion'
        }
      })

      const response = await handler.GET(req)
      const data = await response.json()

      expect(data.history).toHaveLength(1)
      expect(data.history[0].type).toBe('emotion')
    })

    it('should handle empty history', async () => {
      localStorage.clear()
      
      const { req } = createMocks({
        method: 'GET'
      })

      const response = await handler.GET(req)
      const data = await response.json()

      expect(data.history).toHaveLength(0)
      expect(data.pagination.total).toBe(0)
    })

    it('should handle invalid pagination parameters', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: {
          limit: 'invalid',
          page: 'invalid'
        }
      })

      const response = await handler.GET(req)
      const data = await response.json()

      // Should use default pagination values
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('history')
      expect(data).toHaveProperty('pagination')
    })
  })

  describe('POST /api/history', () => {
    it('should save emotion result successfully', async () => {
      const emotionData = {
        type: 'emotion',
        data: {
          emotion: 'happy',
          confidence: 0.9,
          allEmotions: {
            happy: 0.9,
            sad: 0.05,
            angry: 0.02,
            surprised: 0.02,
            neutral: 0.005,
            fear: 0.003,
            disgust: 0.002
          }
        }
      }

      const { req } = createMocks({
        method: 'POST',
        body: emotionData
      })

      const response = await handler.POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('message', 'History entry saved successfully')

      // Verify it was saved to localStorage
      const history = JSON.parse(localStorage.getItem('moodify_history') || '[]')
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('emotion')
      expect(history[0].data.emotion).toBe('happy')
    })

    it('should save music recommendation successfully', async () => {
      const recommendationData = {
        type: 'recommendation',
        data: {
          emotion: 'sad',
          tracks: [
            {
              id: 'track-1',
              name: 'Sad Song',
              artist: 'Artist 1',
              album: 'Album 1',
              imageUrl: 'https://example.com/image.jpg',
              previewUrl: 'https://example.com/preview.mp3',
              spotifyUrl: 'https://open.spotify.com/track/track-1'
            }
          ],
          timestamp: new Date().toISOString()
        }
      }

      const { req } = createMocks({
        method: 'POST',
        body: recommendationData
      })

      const response = await handler.POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')

      // Verify it was saved
      const history = JSON.parse(localStorage.getItem('moodify_history') || '[]')
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('recommendation')
    })

    it('should handle invalid POST data', async () => {
      const invalidData = {
        type: 'invalid_type',
        data: 'invalid_data'
      }

      const { req } = createMocks({
        method: 'POST',
        body: invalidData
      })

      const response = await handler.POST(req)

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should handle missing required fields', async () => {
      const incompleteData = {
        type: 'emotion'
        // Missing data field
      }

      const { req } = createMocks({
        method: 'POST',
        body: incompleteData
      })

      const response = await handler.POST(req)

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded')
      })

      const emotionData = {
        type: 'emotion',
        data: {
          emotion: 'happy',
          confidence: 0.8,
          allEmotions: {
            happy: 0.8,
            sad: 0.2,
            angry: 0,
            surprised: 0,
            neutral: 0,
            fear: 0,
            disgust: 0
          }
        }
      }

      const { req } = createMocks({
        method: 'POST',
        body: emotionData
      })

      const response = await handler.POST(req)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')

      // Restore original function
      localStorage.setItem = originalSetItem
    })
  })

  describe('DELETE /api/history', () => {
    beforeEach(() => {
      const testHistory = [
        {
          id: 'test-1',
          type: 'emotion',
          data: { emotion: 'happy', confidence: 0.8 },
          timestamp: new Date().toISOString()
        },
        {
          id: 'test-2',
          type: 'emotion', 
          data: { emotion: 'sad', confidence: 0.7 },
          timestamp: new Date().toISOString()
        }
      ]
      
      localStorage.setItem('moodify_history', JSON.stringify(testHistory))
    })

    it('should delete specific history entry', async () => {
      const { req } = createMocks({
        method: 'DELETE',
        query: { id: 'test-1' }
      })

      const response = await handler.DELETE(req)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('message', 'History entry deleted successfully')

      // Verify deletion
      const history = JSON.parse(localStorage.getItem('moodify_history') || '[]')
      expect(history).toHaveLength(1)
      expect(history[0].id).toBe('test-2')
    })

    it('should clear all history when no ID specified', async () => {
      const { req } = createMocks({
        method: 'DELETE'
      })

      const response = await handler.DELETE(req)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('message', 'All history cleared successfully')

      // Verify all entries deleted
      const history = JSON.parse(localStorage.getItem('moodify_history') || '[]')
      expect(history).toHaveLength(0)
    })

    it('should handle deleting non-existent entry', async () => {
      const { req } = createMocks({
        method: 'DELETE',
        query: { id: 'non-existent' }
      })

      const response = await handler.DELETE(req)

      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data).toHaveProperty('error', 'History entry not found')
    })
  })

  describe('Error Scenarios', () => {
    it('should handle unsupported HTTP methods', async () => {
      const { req } = createMocks({
        method: 'PUT'
      })

      const response = await handler(req)

      expect(response.status).toBe(405)
      
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Method not allowed')
    })

    it('should handle malformed JSON in POST request', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: 'invalid json'
      })

      const response = await handler.POST(req)

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should handle localStorage access errors', async () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = jest.fn(() => {
        throw new Error('Storage access denied')
      })

      const { req } = createMocks({
        method: 'GET'
      })

      const response = await handler.GET(req)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')

      // Restore original function
      localStorage.getItem = originalGetItem
    })
  })

  describe('Data Validation', () => {
    it('should validate emotion data structure', async () => {
      const invalidEmotionData = {
        type: 'emotion',
        data: {
          emotion: 'invalid_emotion', // Should be one of the valid emotion types
          confidence: 1.5, // Should be between 0 and 1
          allEmotions: {} // Missing required emotion properties
        }
      }

      const { req } = createMocks({
        method: 'POST',
        body: invalidEmotionData
      })

      const response = await handler.POST(req)

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should validate recommendation data structure', async () => {
      const invalidRecommendationData = {
        type: 'recommendation',
        data: {
          emotion: 'happy',
          tracks: 'not_an_array' // Should be an array
        }
      }

      const { req } = createMocks({
        method: 'POST',
        body: invalidRecommendationData
      })

      const response = await handler.POST(req)

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })
  })
})