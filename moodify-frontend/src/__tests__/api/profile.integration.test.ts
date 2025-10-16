/**
 * @jest-environment node
 * 
 * Integration tests for User Profile API endpoints
 * 
 * Tests cover:
 * - Profile retrieval (GET /api/user/profile)
 * - Profile updates (PUT /api/user/profile)
 * - Input validation
 * - Authentication requirements
 * - Error handling
 */

import { GET as ProfileGET, PUT as ProfilePUT } from '@/app/api/user/profile/route'
import { getServerSession } from 'next-auth/next'
import {
  createMockRequest,
  parseResponse,
  createMockSession,
} from '../utils/testHelpers'
import {
  validUser,
  userWithSpotify,
  mockSession,
  mockSessionWithSpotify,
} from '../fixtures/users'

// Mock Next-Auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

describe('User Profile API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/user/profile', () => {
    describe('Success Cases', () => {
      it('should retrieve profile for authenticated user', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/user/profile',
        })

        const response = await ProfileGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('user')
        expect(data.user).toMatchObject({
          id: validUser.id,
          name: validUser.name,
          email: validUser.email,
        })
        expect(data.user).toHaveProperty('bio')
        expect(data.user).toHaveProperty('favoriteGenres')
        expect(data.user).toHaveProperty('joinDate')
      })

      it('should retrieve profile for user with Spotify connection', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSessionWithSpotify)

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/user/profile',
        })

        const response = await ProfileGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.user).toMatchObject({
          id: userWithSpotify.id,
          name: userWithSpotify.name,
          email: userWithSpotify.email,
        })
      })

      it('should return empty arrays for optional fields when not set', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/user/profile',
        })

        const response = await ProfileGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.user.bio).toBe('')
        expect(Array.isArray(data.user.favoriteGenres)).toBe(true)
        expect(data.user.favoriteGenres).toHaveLength(0)
      })
    })

    describe('Authentication Errors', () => {
      it('should return 401 when no session exists', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null)

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/user/profile',
        })

        const response = await ProfileGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(401)
        expect(data).toHaveProperty('message', 'Unauthorized')
      })

      it('should return 401 when session has no user', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({ expires: '2025-12-31' })

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/user/profile',
        })

        const response = await ProfileGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(401)
        expect(data).toHaveProperty('message', 'Unauthorized')
      })
    })

    describe('Error Handling', () => {
      it('should handle server errors gracefully', async () => {
        (getServerSession as jest.Mock).mockRejectedValue(new Error('Session service unavailable'))

        const req = createMockRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/user/profile',
        })

        const response = await ProfileGET(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(500)
        expect(data).toHaveProperty('message', 'Internal server error')
      })
    })
  })

  describe('PUT /api/user/profile', () => {
    describe('Success Cases', () => {
      it('should update profile with valid data', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
          bio: 'This is my new bio',
          favoriteGenres: ['Rock', 'Jazz', 'Electronic'],
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('message', 'Profile updated successfully')
        expect(data.user).toMatchObject({
          id: validUser.id,
          name: updateData.name,
          email: updateData.email,
          bio: updateData.bio,
          favoriteGenres: updateData.favoriteGenres,
        })
      })

      it('should update only name and email when optional fields not provided', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'New Name',
          email: 'newemail@example.com',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.user.name).toBe(updateData.name)
        expect(data.user.email).toBe(updateData.email)
      })

      it('should update profile with empty bio', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'Test User',
          email: 'test@example.com',
          bio: '',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.user.bio).toBe('')
      })

      it('should update profile with empty favorite genres', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'Test User',
          email: 'test@example.com',
          favoriteGenres: [],
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.user.favoriteGenres).toEqual([])
      })
    })

    describe('Validation Errors', () => {
      it('should reject name that is too short', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'X',
          email: 'valid@example.com',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid input data')
        // errors field is returned by Zod validation
        if (data.errors) {
          expect(Array.isArray(data.errors)).toBe(true)
        }
      })

      it('should reject name that is too long', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'A'.repeat(51),
          email: 'valid@example.com',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid input data')
      })

      it('should reject invalid email format', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'Valid Name',
          email: 'invalid-email-format',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid input data')
      })

      it('should reject bio that exceeds maximum length', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'Valid Name',
          email: 'valid@example.com',
          bio: 'A'.repeat(201),
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid input data')
      })

      it('should reject when favoriteGenres is not an array', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'Valid Name',
          email: 'valid@example.com',
          favoriteGenres: 'not-an-array',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid input data')
      })

      it('should reject when required fields are missing', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          bio: 'Bio without name and email',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('message', 'Invalid input data')
      })
    })

    describe('Authentication Errors', () => {
      it('should return 401 when no session exists', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null)

        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(401)
        expect(data).toHaveProperty('message', 'Unauthorized')
      })

      it('should return 401 when session has no user', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({ expires: '2025-12-31' })

        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(401)
        expect(data).toHaveProperty('message', 'Unauthorized')
      })
    })

    describe('Error Handling', () => {
      it('should handle malformed JSON gracefully', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const req = new Request('http://localhost:3000/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: 'invalid-json{',
        })

        const response = await ProfilePUT(req as any)
        const data = await parseResponse(response)

        expect(response.status).toBe(500)
        expect(data).toHaveProperty('message', 'Internal server error')
      })

      it('should handle session service errors', async () => {
        (getServerSession as jest.Mock).mockRejectedValue(new Error('Session service down'))

        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(500)
        expect(data).toHaveProperty('message', 'Internal server error')
      })
    })

    describe('Edge Cases', () => {
      it('should handle maximum valid bio length', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'Valid Name',
          email: 'valid@example.com',
          bio: 'A'.repeat(200), // Exactly 200 chars
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.user.bio).toHaveLength(200)
      })

      it('should handle special characters in name', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: "O'Brien-Smith",
          email: 'valid@example.com',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.user.name).toBe("O'Brien-Smith")
      })

      it('should handle unicode characters in bio', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'Valid Name',
          email: 'valid@example.com',
          bio: 'I love music 🎵🎶 and coding 💻',
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.user.bio).toBe('I love music 🎵🎶 and coding 💻')
      })

      it('should handle large number of favorite genres', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession)

        const updateData = {
          name: 'Valid Name',
          email: 'valid@example.com',
          favoriteGenres: [
            'Rock', 'Jazz', 'Classical', 'Electronic', 'Hip Hop',
            'R&B', 'Country', 'Blues', 'Reggae', 'Folk',
            'Metal', 'Punk', 'Soul', 'Funk', 'Disco',
          ],
        }

        const req = createMockRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/user/profile',
          body: updateData,
        })

        const response = await ProfilePUT(req)
        const data = await parseResponse(response)

        expect(response.status).toBe(200)
        expect(data.user.favoriteGenres).toHaveLength(15)
      })
    })
  })
})
