import { spotifyService } from '@/lib/spotify'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Spotify Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset any cached tokens
    spotifyService['accessToken'] = null
    spotifyService['tokenExpiresAt'] = 0
  })

  describe('getAccessToken', () => {
    it('should get access token successfully', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'mock-access-token',
          expires_in: 3600,
          token_type: 'Bearer'
        }
      }

      mockedAxios.post.mockResolvedValue(mockTokenResponse)

      const token = await spotifyService.getAccessToken()

      expect(token).toBe('mock-access-token')
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': expect.stringContaining('Basic ')
          }
        })
      )
    })

    it('should cache access token and reuse if not expired', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'cached-token',
          expires_in: 3600
        }
      }

      mockedAxios.post.mockResolvedValue(mockTokenResponse)

      // First call - should make API request
      const token1 = await spotifyService.getAccessToken()
      expect(mockedAxios.post).toHaveBeenCalledTimes(1)

      // Second call - should use cached token
      const token2 = await spotifyService.getAccessToken()
      expect(mockedAxios.post).toHaveBeenCalledTimes(1)
      expect(token1).toBe(token2)
    })

    it('should refresh token if expired', async () => {
      const mockTokenResponse1 = {
        data: {
          access_token: 'token-1',
          expires_in: 1 // Very short expiry
        }
      }
      const mockTokenResponse2 = {
        data: {
          access_token: 'token-2',
          expires_in: 3600
        }
      }

      mockedAxios.post
        .mockResolvedValueOnce(mockTokenResponse1)
        .mockResolvedValueOnce(mockTokenResponse2)

      // First call
      const token1 = await spotifyService.getAccessToken()
      
      // Wait for token to expire and make second call
      await new Promise(resolve => setTimeout(resolve, 1100))
      const token2 = await spotifyService.getAccessToken()

      expect(mockedAxios.post).toHaveBeenCalledTimes(2)
      expect(token1).toBe('token-1')
      expect(token2).toBe('token-2')
    })

    it('should handle token request errors', async () => {
      const mockError = new Error('Network error')
      mockedAxios.post.mockRejectedValue(mockError)

      await expect(spotifyService.getAccessToken())
        .rejects.toThrow('Failed to get Spotify access token: Network error')
    })
  })

  describe('searchTracks', () => {
    const mockAccessToken = 'mock-token'
    
    beforeEach(() => {
      spotifyService['accessToken'] = mockAccessToken
      spotifyService['tokenExpiresAt'] = Date.now() + 3600000
    })

    it('should search tracks successfully', async () => {
      const mockSearchResponse = {
        data: {
          tracks: {
            items: [
              {
                id: 'track1',
                name: 'Happy Song',
                artists: [{ name: 'Artist 1' }],
                album: { 
                  name: 'Happy Album',
                  images: [{ url: 'https://example.com/image.jpg' }]
                },
                preview_url: 'https://example.com/preview.mp3',
                external_urls: { spotify: 'https://open.spotify.com/track/track1' },
                audio_features: {
                  valence: 0.8,
                  energy: 0.7,
                  danceability: 0.6
                }
              }
            ]
          }
        }
      }

      mockedAxios.get.mockResolvedValue(mockSearchResponse)

      const result = await spotifyService.searchTracks('happy songs', 'happy')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'track1',
        name: 'Happy Song',
        artist: 'Artist 1',
        album: 'Happy Album',
        imageUrl: 'https://example.com/image.jpg',
        previewUrl: 'https://example.com/preview.mp3',
        spotifyUrl: 'https://open.spotify.com/track/track1'
      })

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://api.spotify.com/v1/search'),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`
          }
        })
      )
    })

    it('should handle search errors gracefully', async () => {
      const mockError = new Error('API error')
      mockedAxios.get.mockRejectedValue(mockError)

      await expect(spotifyService.searchTracks('test', 'happy'))
        .rejects.toThrow('Failed to search tracks: API error')
    })

    it('should return empty array for no results', async () => {
      const mockSearchResponse = {
        data: {
          tracks: {
            items: []
          }
        }
      }

      mockedAxios.get.mockResolvedValue(mockSearchResponse)

      const result = await spotifyService.searchTracks('nonexistent', 'happy')
      expect(result).toEqual([])
    })
  })

  describe('getRecommendationsByEmotion', () => {
    beforeEach(() => {
      spotifyService['accessToken'] = 'mock-token'
      spotifyService['tokenExpiresAt'] = Date.now() + 3600000
    })

    it('should get recommendations for happy emotion', async () => {
      const mockRecommendationResponse = {
        data: {
          tracks: [
            {
              id: 'rec1',
              name: 'Upbeat Song',
              artists: [{ name: 'Happy Artist' }],
              album: { 
                name: 'Upbeat Album',
                images: [{ url: 'https://example.com/happy.jpg' }]
              },
              preview_url: 'https://example.com/happy-preview.mp3',
              external_urls: { spotify: 'https://open.spotify.com/track/rec1' }
            }
          ]
        }
      }

      mockedAxios.get.mockResolvedValue(mockRecommendationResponse)

      const result = await spotifyService.getRecommendationsByEmotion('happy')

      expect(result.emotion).toBe('happy')
      expect(result.tracks).toHaveLength(1)
      expect(result.tracks[0].name).toBe('Upbeat Song')

      // Check that correct audio features are used for happy emotion
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('recommendations'),
        expect.objectContaining({
          params: expect.objectContaining({
            target_valence: 0.8,
            target_energy: 0.7,
            target_danceability: 0.6
          })
        })
      )
    })

    it('should get recommendations for sad emotion', async () => {
      const mockRecommendationResponse = {
        data: {
          tracks: [
            {
              id: 'sad1',
              name: 'Melancholy Song',
              artists: [{ name: 'Sad Artist' }],
              album: { 
                name: 'Blue Album',
                images: [{ url: 'https://example.com/sad.jpg' }]
              },
              preview_url: 'https://example.com/sad-preview.mp3',
              external_urls: { spotify: 'https://open.spotify.com/track/sad1' }
            }
          ]
        }
      }

      mockedAxios.get.mockResolvedValue(mockRecommendationResponse)

      const result = await spotifyService.getRecommendationsByEmotion('sad')

      expect(result.emotion).toBe('sad')
      expect(result.tracks).toHaveLength(1)

      // Check that correct audio features are used for sad emotion
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('recommendations'),
        expect.objectContaining({
          params: expect.objectContaining({
            target_valence: 0.2,
            target_energy: 0.3,
            target_danceability: 0.3
          })
        })
      )
    })

    it('should handle all emotion types', async () => {
      const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']
      
      mockedAxios.get.mockResolvedValue({
        data: { tracks: [] }
      })

      for (const emotion of emotions) {
        await spotifyService.getRecommendationsByEmotion(emotion as any)
        expect(mockedAxios.get).toHaveBeenCalled()
      }
    })

    it('should include seed genres in recommendation request', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { tracks: [] }
      })

      await spotifyService.getRecommendationsByEmotion('happy')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            seed_genres: expect.stringContaining('pop')
          })
        })
      )
    })
  })

  describe('emotion to audio features mapping', () => {
    it('should have correct mappings for all emotions', () => {
      const emotionMappings = spotifyService['getAudioFeaturesForEmotion']

      // Test a few key mappings
      expect(emotionMappings('happy')).toEqual({
        target_valence: 0.8,
        target_energy: 0.7,
        target_danceability: 0.6
      })

      expect(emotionMappings('sad')).toEqual({
        target_valence: 0.2,
        target_energy: 0.3,
        target_danceability: 0.3
      })

      expect(emotionMappings('angry')).toEqual({
        target_valence: 0.3,
        target_energy: 0.9,
        target_danceability: 0.4
      })
    })
  })
})