/**
 * Mock implementation for Spotify API
 * Used in integration tests to simulate Spotify service responses
 */

import { spotifyApiResponses, mockTracks, mockRecommendations } from '../fixtures/tracks'

export class SpotifyApiMock {
  private accessToken: string | null = null
  private shouldFail = false
  private failureMode: 'unauthorized' | 'rate_limit' | 'service_unavailable' | null = null
  private responseDelay = 0

  /**
   * Set the mock to return successful responses
   */
  setSuccess() {
    this.shouldFail = false
    this.failureMode = null
  }

  /**
   * Set the mock to return error responses
   */
  setFailure(mode: 'unauthorized' | 'rate_limit' | 'service_unavailable') {
    this.shouldFail = true
    this.failureMode = mode
  }

  /**
   * Set response delay for testing timeout scenarios
   */
  setDelay(ms: number) {
    this.responseDelay = ms
  }

  /**
   * Set access token
   */
  setAccessToken(token: string) {
    this.accessToken = token
  }

  /**
   * Clear access token
   */
  clearAccessToken() {
    this.accessToken = null
  }

  /**
   * Simulate delay if configured
   */
  private async simulateDelay() {
    if (this.responseDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.responseDelay))
    }
  }

  /**
   * Check for error conditions
   */
  private checkForErrors() {
    if (!this.accessToken) {
      throw {
        response: {
          status: 401,
          data: spotifyApiResponses.error401,
        },
      }
    }

    if (this.shouldFail) {
      switch (this.failureMode) {
        case 'unauthorized':
          throw {
            response: {
              status: 401,
              data: spotifyApiResponses.error401,
            },
          }
        case 'rate_limit':
          throw {
            response: {
              status: 429,
              data: spotifyApiResponses.error429,
            },
          }
        case 'service_unavailable':
          throw {
            response: {
              status: 503,
              data: spotifyApiResponses.error503,
            },
          }
      }
    }
  }

  /**
   * Mock search tracks
   */
  async searchTracks(query: string, options?: { limit?: number; offset?: number }) {
    await this.simulateDelay()
    this.checkForErrors()

    if (!query || query.trim() === '') {
      return { data: spotifyApiResponses.searchEmpty }
    }

    return { data: spotifyApiResponses.searchSuccess }
  }

  /**
   * Mock get recommendations
   */
  async getRecommendations(params: {
    seed_genres?: string[]
    target_valence?: number
    target_energy?: number
    target_danceability?: number
    limit?: number
  }) {
    await this.simulateDelay()
    this.checkForErrors()

    const emotion = this.determineEmotionFromParams(params)
    const recommendations = mockRecommendations[emotion as keyof typeof mockRecommendations]

    if (recommendations && recommendations.tracks.length > 0) {
      return {
        data: {
          tracks: recommendations.tracks.map((track) => ({
            id: track.id.replace('spotify:track:', ''),
            name: track.name,
            artists: [{ name: track.artist }],
            album: {
              name: track.album,
              images: [{ url: track.imageUrl }],
            },
            preview_url: track.previewUrl,
            external_urls: {
              spotify: track.spotifyUrl,
            },
          })),
        },
      }
    }

    return { data: { tracks: [] } }
  }

  /**
   * Mock get audio features
   */
  async getAudioFeatures(trackIds: string[]) {
    await this.simulateDelay()
    this.checkForErrors()

    const features = trackIds.map((id) => {
      const track = Object.values(mockTracks).find((t) => t.id.includes(id))
      return track?.audioFeatures || {
        valence: 0.5,
        energy: 0.5,
        danceability: 0.5,
        tempo: 120,
      }
    })

    return { data: { audio_features: features } }
  }

  /**
   * Mock get current playing track
   */
  async getCurrentPlaying() {
    await this.simulateDelay()
    this.checkForErrors()

    return { data: spotifyApiResponses.currentPlayingSuccess }
  }

  /**
   * Mock create playlist
   */
  async createPlaylist(userId: string, playlistData: { name: string; description: string; public: boolean }) {
    await this.simulateDelay()
    this.checkForErrors()

    return {
      data: {
        id: 'mock_playlist_123',
        name: playlistData.name,
        description: playlistData.description,
        public: playlistData.public,
        external_urls: {
          spotify: 'https://open.spotify.com/playlist/mock_playlist_123',
        },
      },
    }
  }

  /**
   * Mock add tracks to playlist
   */
  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    await this.simulateDelay()
    this.checkForErrors()

    return {
      data: {
        snapshot_id: 'mock_snapshot_123',
      },
    }
  }

  /**
   * Mock get user profile
   */
  async getUserProfile() {
    await this.simulateDelay()
    this.checkForErrors()

    return {
      data: {
        id: 'mock_user_123',
        display_name: 'Mock Spotify User',
        email: 'mock@spotify.com',
        images: [{ url: 'https://i.scdn.co/image/mock_user' }],
      },
    }
  }

  /**
   * Helper to determine emotion from audio feature parameters
   */
  private determineEmotionFromParams(params: any): string {
    const valence = params.target_valence || 0.5
    const energy = params.target_energy || 0.5

    if (valence >= 0.7 && energy >= 0.6) return 'happy'
    if (valence <= 0.3 && energy <= 0.4) return 'sad'
    if (energy >= 0.7 && valence < 0.6) return 'angry'
    if (valence >= 0.5 && valence < 0.8) return 'surprised'
    if (valence >= 0.4 && valence <= 0.6) return 'neutral'
    if (valence <= 0.4 && energy <= 0.5) return 'fear'
    if (valence >= 0.2 && valence <= 0.5) return 'disgust'

    return 'neutral'
  }

  /**
   * Reset all mock state
   */
  reset() {
    this.accessToken = null
    this.shouldFail = false
    this.failureMode = null
    this.responseDelay = 0
  }
}

// Export singleton instance
export const spotifyApiMock = new SpotifyApiMock()

/**
 * Mock axios instance that simulates Spotify API
 */
export const createMockAxiosInstance = () => {
  return {
    get: jest.fn((url: string, config?: any) => {
      if (url.includes('/me/player/currently-playing')) {
        return spotifyApiMock.getCurrentPlaying()
      }
      if (url.includes('/search')) {
        const params = new URLSearchParams(url.split('?')[1] || '')
        return spotifyApiMock.searchTracks(params.get('q') || '')
      }
      if (url.includes('/audio-features')) {
        const trackIds = url.match(/ids=([^&]+)/)?.[1]?.split(',') || []
        return spotifyApiMock.getAudioFeatures(trackIds)
      }
      if (url.includes('/me')) {
        return spotifyApiMock.getUserProfile()
      }
      throw new Error(`Unmocked GET URL: ${url}`)
    }),
    post: jest.fn((url: string, data?: any) => {
      if (url.includes('/users/') && url.includes('/playlists')) {
        return spotifyApiMock.createPlaylist('mock_user', data)
      }
      if (url.includes('/playlists/') && url.includes('/tracks')) {
        return spotifyApiMock.addTracksToPlaylist('mock_playlist', data.uris)
      }
      throw new Error(`Unmocked POST URL: ${url}`)
    }),
  }
}

/**
 * Jest mock setup for Spotify service
 */
export const setupSpotifyMocks = () => {
  jest.mock('@/lib/spotify', () => ({
    getSpotifyRecommendations: jest.fn(async (emotion: string) => {
      const recommendations = mockRecommendations[emotion as keyof typeof mockRecommendations]
      return recommendations?.tracks || []
    }),
    searchSpotifyTracks: jest.fn(async (query: string) => {
      if (!query) return []
      return [mockTracks.happyTrack1, mockTracks.happyTrack2]
    }),
    getCurrentPlayingTrack: jest.fn(async () => {
      return {
        id: 'current1',
        name: 'Currently Playing Song',
        artist: 'Current Artist',
        album: 'Current Album',
        imageUrl: 'https://i.scdn.co/image/current1',
        previewUrl: 'https://p.scdn.co/mp3-preview/current1',
        spotifyUrl: 'https://open.spotify.com/track/current1',
      }
    }),
  }))
}
