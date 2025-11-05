import { POST } from '@/app/api/music/recommendations/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { spotifyService } from '@/lib/spotify'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    music_recommendations: {
      create: jest.fn()
    },
    user_statistics: {
      upsert: jest.fn()
    }
  }
}))

jest.mock('@/lib/spotify', () => ({
  spotifyService: {
    getRecommendationsByEmotion: jest.fn()
  }
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@example.com' }
  }))
}))

describe('POST /api/music/recommendations', () => {
  const mockTracks = [
    {
      id: '123',
      name: 'Happy Song',
      artist: 'Test Artist',
      album: 'Test Album',
      spotifyUrl: 'https://spotify.com/track/123',
      imageUrl: 'https://example.com/image.jpg',
      duration: 180,
      popularity: 75
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue(mockTracks)
    ;(prisma.music_recommendations.create as jest.Mock).mockResolvedValue({
      id: 'rec-123',
      user_id: 'test-user-id',
      emotion: 'happy',
      track_id: '123'
    })
    ;(prisma.user_statistics.upsert as jest.Mock).mockResolvedValue({})
  })

  it('should return recommendations for valid emotion', async () => {
    const request = new NextRequest('http://localhost:3000/api/music/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emotion: 'happy',
        confidence: 0.85,
        limit: 10
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.emotion).toBe('happy')
    expect(data.data.tracks).toHaveLength(1)
    expect(spotifyService.getRecommendationsByEmotion).toHaveBeenCalledWith('happy', 10)
  })

  it('should save recommendation to database', async () => {
    const request = new NextRequest('http://localhost:3000/api/music/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        emotion: 'sad',
        confidence: 0.90,
        limit: 5
      })
    })

    await POST(request)

    expect(prisma.music_recommendations.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: 'test-user-id',
        emotion: 'sad',
        track_id: '123'
      })
    })
  })

  it('should reject invalid emotion', async () => {
    const request = new NextRequest('http://localhost:3000/api/music/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        emotion: 'invalid-emotion',
        limit: 10
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toContain('Invalid input')
  })

  it('should reject unauthenticated requests', async () => {
    // Mock no session
    const { getServerSession } = require('next-auth/next')
    getServerSession.mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost:3000/api/music/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        emotion: 'happy',
        limit: 10
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('Unauthorized')
  })

  it('should update user statistics', async () => {
    const request = new NextRequest('http://localhost:3000/api/music/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        emotion: 'happy',
        limit: 10
      })
    })

    await POST(request)

    expect(prisma.user_statistics.upsert).toHaveBeenCalledWith({
      where: { user_id: 'test-user-id' },
      update: expect.objectContaining({
        total_recommendations: { increment: 1 }
      }),
      create: expect.objectContaining({
        user_id: 'test-user-id',
        total_recommendations: 1
      })
    })
  })
})

