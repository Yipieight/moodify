/**
 * @jest-environment node
 * 
 * Integration tests for Music Search API endpoints
 * 
 * Tests cover:
 * - Track search functionality (GET /api/music/search)
 * - Query parameter validation
 * - Authentication requirements
 * - Spotify API integration
 * - Error handling
 */

import { GET as SearchGET } from '@/app/api/music/search/route'
import {
  createMockRequest,
  parseResponse,
} from '../utils/testHelpers'
import {
  mockSession,
} from '../fixtures/users'
import { mockRecommendations, mockTracks } from '../fixtures/tracks'

// Mock Next-Auth
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
    searchTracks: jest.fn(),
  },
}))

import { getServerSession } from 'next-auth/next'
import { spotifyService } from '@/lib/spotify'

describe('Music Search API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/music/search', () => {
    describe('Success Cases', () => {
      it('should search tracks successfully with valid query', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([
          mockRecommendations.happy.tracks[0],
          mockRecommendations.happy.tracks[1],
        ]);

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'happy' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('query', 'happy')
        expect(data.data).toHaveProperty('tracks')
        expect(Array.isArray(data.data.tracks)).toBe(true)
        expect(data.data.tracks).toHaveLength(2)
        expect(data.data).toHaveProperty('totalTracks', 2)
        expect(data.data).toHaveProperty('searchedAt')
      })

      it('should accept query parameter as "q"', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([mockRecommendations.happy.tracks[0]])

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'rock music' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.data.query).toBe('rock music')
        expect(spotifyService.searchTracks).toHaveBeenCalledWith('rock music', 20)
      })

      it('should accept query parameter as "query"', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([mockRecommendations.sad.tracks[0]])

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { query: 'blues' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.data.query).toBe('blues')
      })

      it('should respect custom limit parameter', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue(mockRecommendations.happy.tracks.slice(0, 2))

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'pop', limit: '10' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(spotifyService.searchTracks).toHaveBeenCalledWith('pop', 10)
        expect(data.data.totalTracks).toBe(2)
      })

      it('should use default limit when not specified', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue(mockRecommendations.happy.tracks)

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'jazz' },
        })

        const response = await SearchGET(req)

        expect(response.status).toBe(200)
        expect(spotifyService.searchTracks).toHaveBeenCalledWith('jazz', 20)
      })

      it('should handle empty search results', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'nonexistent-track-xyz' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.tracks).toEqual([])
        expect(data.data.totalTracks).toBe(0)
      })

      it('should search with special characters', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([mockRecommendations.happy.tracks[0]])

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'rock & roll' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(spotifyService.searchTracks).toHaveBeenCalledWith('rock & roll', 20)
      })

      it('should handle maximum limit of 50', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        const allTracks = [
          ...mockRecommendations.happy.tracks,
          ...mockRecommendations.sad.tracks,
          ...mockRecommendations.angry.tracks,
        ];
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue(allTracks);

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'popular', limit: '50' },
        })

        const response = await SearchGET(req)

        expect(response.status).toBe(200)
        expect(spotifyService.searchTracks).toHaveBeenCalledWith('popular', 50)
      })
    })

    describe('Validation Errors', () => {
      it('should reject empty query', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: '' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid search parameters')
      })

      it('should reject missing query parameter', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: {},
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid search parameters')
      })

      it('should reject query exceeding maximum length', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'A'.repeat(101) },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid search parameters')
      })

      it('should reject limit less than 1', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'music', limit: '0' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid search parameters')
      })

      it('should reject limit greater than 50', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'music', limit: '51' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid search parameters')
      })

      it('should reject invalid limit format', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'music', limit: 'not-a-number' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid search parameters')
      })
    })

    describe('Authentication Errors', () => {
      it('should return 401 when no session exists', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null)

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'music' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(401)
        expect(data).toHaveProperty('message', 'Unauthorized')
        expect(spotifyService.searchTracks).not.toHaveBeenCalled()
      })

      it('should return 401 when session has no user', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({ expires: '2025-12-31' })

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'music' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(401)
        expect(data).toHaveProperty('message', 'Unauthorized')
      })
    })

    describe('Spotify Service Errors', () => {
      it('should handle Spotify service failure', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockRejectedValue(
          new Error('Spotify API unavailable')
        )

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'music' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(500)
        expect(data).toHaveProperty('message', 'Failed to search tracks')
      })

      it('should handle Spotify unauthorized error', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockRejectedValue(
          new Error('Unauthorized: Invalid access token')
        )

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'music' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(500)
        expect(data).toHaveProperty('message', 'Failed to search tracks')
      })

      it('should handle Spotify rate limit error', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockRejectedValue(
          new Error('Rate limit exceeded')
        )

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'music' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(500)
        expect(data).toHaveProperty('message', 'Failed to search tracks')
      })
    })

    describe('Edge Cases', () => {
      it('should handle minimum query length of 1', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([mockRecommendations.happy.tracks[0]])

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'a' },
        })

        const response = await SearchGET(req)

        expect(response.status).toBe(200)
        expect(spotifyService.searchTracks).toHaveBeenCalledWith('a', 20)
      })

      it('should handle maximum query length of 100', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([mockRecommendations.happy.tracks[0]])

        const longQuery = 'A'.repeat(100)
        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: longQuery },
        })

        const response = await SearchGET(req)

        expect(response.status).toBe(200)
        expect(spotifyService.searchTracks).toHaveBeenCalledWith(longQuery, 20)
      })

      it('should handle numeric query strings', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([])

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: '2024' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.data.query).toBe('2024')
      })

      it('should handle unicode characters in query', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([mockRecommendations.happy.tracks[0]])

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'música española' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.data.query).toBe('música española')
      })

      it('should handle query with multiple spaces', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        (spotifyService.searchTracks as jest.Mock).mockResolvedValue([mockRecommendations.happy.tracks[0]])

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/music/search',
          searchParams: { q: 'the   beatles' },
        })

        const response = await SearchGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.data.query).toBe('the   beatles')
      })
    })
  })
})
