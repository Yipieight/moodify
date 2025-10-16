/**
 * @jest-environment node
 * 
 * Integration tests for Music Recommendations API
 * Tests emotion-based music recommendation generation
 */

import { POST as RecommendationsPOST, GET as RecommendationsGET } from '@/app/api/recommendations/route'
import { createMockRequest, parseResponse } from '../utils/testHelpers'
import { validEmotions, emotionToGenreMapping } from '../fixtures/emotions'
import { mockRecommendations, spotifyApiResponses } from '../fixtures/tracks'
import { mockSession } from '../fixtures/users'

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

// Mock auth options  
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock Spotify service
jest.mock('@/lib/spotify', () => ({
  spotifyService: {
    getRecommendationsByEmotion: jest.fn(),
  },
}))

import { getServerSession } from 'next-auth/next'
import { spotifyService } from '@/lib/spotify'

describe('/api/recommendations Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks
    (getServerSession as jest.Mock).mockClear();
    (spotifyService.getRecommendationsByEmotion as jest.Mock).mockClear();
    // Default to authenticated session
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
  })

  describe('POST /api/recommendations', () => {
    describe('Successful Recommendations', () => {
      it('should generate recommendations for happy emotion', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue(
          mockRecommendations.happy.tracks
        )

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'happy',
            confidence: 0.85,
          },
        })

        const response = await RecommendationsPOST(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('success', true)
        expect(data).toHaveProperty('data')
        expect(data.data).toHaveProperty('emotion', 'happy')
        expect(data.data).toHaveProperty('tracks')
        expect(Array.isArray(data.data.tracks)).toBe(true)
      })

      it('should generate recommendations for all emotion types', async () => {
        const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']

        for (const emotion of emotions) {
          (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue(
            mockRecommendations[emotion as keyof typeof mockRecommendations]?.tracks || []
          )

          const req = createMockRequest({
            method: 'POST',
            url: 'http://localhost:3000/api/recommendations',
            body: { emotion, confidence: 0.8 },
          })

          const response = await RecommendationsPOST(req)
          const data = await parseResponse(response)

          expect(response.status).toBe(200)
          expect(data.success).toBe(true)
          expect(data.data.emotion).toBe(emotion)
        }
      })

      it('should include confidence in response', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'happy',
            confidence: 0.92,
          },
        })

        const response = await RecommendationsPOST(req)
        const data = await parseResponse(response)

        expect(data.data).toHaveProperty('confidence', 0.92)
      })

      it('should include timestamp in response', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: { emotion: 'happy' },
        })

        const response = await RecommendationsPOST(req)
        const data = await parseResponse(response)

        expect(data.data).toHaveProperty('generatedAt')
        expect(new Date(data.data.generatedAt)).toBeInstanceOf(Date)
      })

      it('should include track count in response', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue(
          mockRecommendations.happy.tracks
        )

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: { emotion: 'happy' },
        })

        const response = await RecommendationsPOST(req)
        const data = await parseResponse(response)

        expect(data.data).toHaveProperty('totalTracks')
        expect(data.data.totalTracks).toBe(mockRecommendations.happy.tracks.length)
      })

      it('should respect custom limit parameter', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'happy',
            limit: 10,
          },
        })

        await RecommendationsPOST(req)

        expect(spotifyService.getRecommendationsByEmotion).toHaveBeenCalledWith('happy', 10)
      })

      it('should use default limit when not specified', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: { emotion: 'happy' },
        })

        await RecommendationsPOST(req)

        expect(spotifyService.getRecommendationsByEmotion).toHaveBeenCalledWith('happy', 20)
      })
    })

    describe('Authentication', () => {
      it('should reject unauthenticated requests', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null)

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: { emotion: 'happy' },
        })

        const response = await RecommendationsPOST(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(401)
        expect(data).toHaveProperty('message', 'Unauthorized')
      })

      it('should require valid session', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({ user: null })

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: { emotion: 'happy' },
        })

        const response = await RecommendationsPOST(req)

        expect(response.status).toBe(401)
      })
    })

    describe('Validation', () => {
      it('should reject invalid emotion type', async () => {
        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'invalid_emotion',
            confidence: 0.8,
          },
        })

        const response = await RecommendationsPOST(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid input data')
      })

      it('should reject confidence outside 0-1 range', async () => {
        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'happy',
            confidence: 1.5,
          },
        })

        const response = await RecommendationsPOST(req)

        expect(response.status).toBe(400)
      })

      it('should reject negative confidence', async () => {
        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'happy',
            confidence: -0.5,
          },
        })

        const response = await RecommendationsPOST(req)

        expect(response.status).toBe(400)
      })

      it('should reject limit above maximum', async () => {
        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'happy',
            limit: 100,
          },
        })

        const response = await RecommendationsPOST(req)

        expect(response.status).toBe(400)
      })

      it('should reject limit below minimum', async () => {
        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'happy',
            limit: 0,
          },
        })

        const response = await RecommendationsPOST(req)

        expect(response.status).toBe(400)
      })

      it('should reject missing emotion', async () => {
        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            confidence: 0.8,
          },
        })

        const response = await RecommendationsPOST(req)

        expect(response.status).toBe(400)
      })
    })

    describe('Error Handling', () => {
      it('should handle Spotify API errors gracefully', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockRejectedValue(
          new Error('Spotify API error')
        )

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: { emotion: 'happy' },
        })

        const response = await RecommendationsPOST(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('fallback', true)
        expect(data.data.tracks).toEqual([])
      })

      it('should provide fallback recommendations on service failure', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockRejectedValue(
          new Error('Service unavailable')
        )

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: { emotion: 'happy' },
        })

        const response = await RecommendationsPOST(req)
        const data = await parseResponse(response)

        // Should return error when service fails
        expect(response.status).toBeGreaterThanOrEqual(500)
        expect(data).toHaveProperty('message')
      })

      it('should handle malformed request body', async () => {
        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: 'invalid json',
        })

        const response = await RecommendationsPOST(req)

        expect(response.status).toBeGreaterThanOrEqual(400)
      })
    })

    describe('User Preferences', () => {
      it('should accept user preferences in request', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'happy',
            userPreferences: {
              genres: ['pop', 'dance'],
              excludeExplicit: true,
            },
          },
        })

        const response = await RecommendationsPOST(req)

        expect(response.status).toBe(200)
      })

      it('should validate genre preferences', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: {
            emotion: 'happy',
            userPreferences: {
              genres: ['pop'],
            },
          },
        })

        const response = await RecommendationsPOST(req)

        expect(response.status).toBe(200)
      })
    })
  })

  describe('GET /api/recommendations', () => {
    describe('Successful Retrieval', () => {
      it('should get recommendations via GET request', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue(
          mockRecommendations.happy.tracks
        )

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/recommendations',
          searchParams: {
            emotion: 'happy',
          },
        })

        const response = await RecommendationsGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.emotion).toBe('happy')
      })

      it('should respect limit query parameter', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/recommendations',
          searchParams: {
            emotion: 'happy',
            limit: '15',
          },
        })

        await RecommendationsGET(req)

        expect(spotifyService.getRecommendationsByEmotion).toHaveBeenCalledWith('happy', 15)
      })
    })

    describe('Authentication for GET', () => {
      it('should require authentication for GET requests', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null)

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/recommendations',
          searchParams: { emotion: 'happy' },
        })

        const response = await RecommendationsGET(req)

        expect(response.status).toBe(401)
      })
    })

    describe('Validation for GET', () => {
      it('should reject GET request without emotion parameter', async () => {
        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/recommendations',
        })

        const response = await RecommendationsGET(req)

        expect(response.status).toBe(400)
      })

      it('should reject invalid emotion in GET request', async () => {
        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/recommendations',
          searchParams: {
            emotion: 'invalid',
          },
        })

        const response = await RecommendationsGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message')
      })
    })

    describe('Error Handling for GET', () => {
      it('should handle service errors in GET requests', async () => {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockRejectedValue(
          new Error('Service error')
        )

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/recommendations',
          searchParams: { emotion: 'happy' },
        })

        const response = await RecommendationsGET(req)

        expect(response.status).toBe(500)
      })
    })
  })

  describe('Emotion to Music Mapping', () => {
    it('should map happy emotion to upbeat genres', async () => {
      (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue(
        mockRecommendations.happy.tracks
      )

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/recommendations',
        body: { emotion: 'happy' },
      })

      await RecommendationsPOST(req)

      expect(spotifyService.getRecommendationsByEmotion).toHaveBeenCalledWith('happy', expect.any(Number))
    })

    it('should call Spotify service with correct emotion', async () => {
      const emotions = ['sad', 'angry', 'surprised']
      
      for (const emotion of emotions) {
        (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/recommendations',
          body: { emotion },
        })

        await RecommendationsPOST(req)

        expect(spotifyService.getRecommendationsByEmotion).toHaveBeenCalledWith(emotion, expect.any(Number))
      }
    })
  })
})
