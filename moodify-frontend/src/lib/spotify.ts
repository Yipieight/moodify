import { Track, EmotionType } from "@/types"

interface SpotifyAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string; height: number; width: number }[]
  }
  duration_ms: number
  preview_url: string | null
  external_urls: {
    spotify: string
  }
  popularity: number
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

interface SpotifyRecommendationsResponse {
  tracks: SpotifyTrack[]
}

export class SpotifyService {
  private static instance: SpotifyService
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  private constructor() {}

  public static getInstance(): SpotifyService {
    if (!SpotifyService.instance) {
      SpotifyService.instance = new SpotifyService()
    }
    return SpotifyService.instance
  }

  /**
   * Get emotion-to-genre mapping for music recommendations
   * Using only verified Spotify genre seeds
   */
  private getEmotionGenres(emotion: EmotionType): string[] {
    // Using only verified Spotify genre seeds
    const emotionGenreMap: Record<EmotionType, string[]> = {
      happy: ['pop', 'dance', 'electronic', 'funk', 'disco'],
      sad: ['acoustic', 'indie', 'blues', 'folk', 'country'],
      angry: ['rock', 'metal', 'punk', 'alternative', 'grunge'],
      surprised: ['electronic', 'ambient', 'techno', 'house', 'drum-and-bass'],
      neutral: ['indie', 'alternative', 'pop', 'rock', 'folk'],
      fear: ['ambient', 'classical', 'soundtrack', 'indie', 'alternative'],
      disgust: ['grunge', 'alternative', 'rock', 'indie', 'punk']
    }
    
    return emotionGenreMap[emotion] || emotionGenreMap.neutral
  }

  /**
   * Get audio features based on emotion
   */
  private getEmotionAudioFeatures(emotion: EmotionType) {
    const emotionFeatures: Record<EmotionType, {
      valence: number // 0.0 = sad/angry, 1.0 = happy/euphoric
      energy: number // 0.0 = low energy, 1.0 = high energy
      danceability?: number // 0.0 = not danceable, 1.0 = very danceable
      tempo?: number // BPM
    }> = {
      happy: { valence: 0.8, energy: 0.7, danceability: 0.8, tempo: 120 },
      sad: { valence: 0.2, energy: 0.3, danceability: 0.3, tempo: 80 },
      angry: { valence: 0.3, energy: 0.9, danceability: 0.5, tempo: 140 },
      surprised: { valence: 0.6, energy: 0.6, danceability: 0.6, tempo: 110 },
      neutral: { valence: 0.5, energy: 0.5, danceability: 0.5, tempo: 100 },
      fear: { valence: 0.2, energy: 0.4, danceability: 0.2, tempo: 90 },
      disgust: { valence: 0.3, energy: 0.6, danceability: 0.3, tempo: 95 }
    }
    
    return emotionFeatures[emotion] || emotionFeatures.neutral
  }

  /**
   * Get Client Credentials access token
   */
  public async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured')
    }

    // For testing purposes, if fetch is not defined properly, throw error to avoid Node fetch
    if (typeof fetch === 'undefined') {
      throw new Error('Global fetch is undefined')
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error('Spotify authentication failed')
    }

    const data: SpotifyAuthResponse = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety
    
    return this.accessToken
  }

  /**
   * Convert Spotify track to our Track interface
   */
  private formatTrack(spotifyTrack: SpotifyTrack): Track {
    return {
      id: spotifyTrack.id,
      name: spotifyTrack.name,
      artist: spotifyTrack.artists.map(a => a.name).join(', '),
      album: spotifyTrack.album.name,
      duration: Math.round(spotifyTrack.duration_ms / 1000),
      previewUrl: spotifyTrack.preview_url || undefined,
      imageUrl: spotifyTrack.album.images[0]?.url,
      spotifyUrl: spotifyTrack.external_urls.spotify,
      popularity: spotifyTrack.popularity
    }
  }

  /**
   * Get music recommendations based on emotion
   */
  public async getRecommendationsByEmotion(
    emotion: EmotionType, 
    limit: number = 20
  ): Promise<Track[]> {
    try {
      const accessToken = await this.getAccessToken()
      
      // Try method 1: Recommendations API with genres
      try {
        return await this.getRecommendationsWithGenres(emotion, limit, accessToken)
      } catch (genreError) {
        console.warn('Genres method failed, trying search method:', genreError)
      }
      
      // Try method 2: Search API with emotion-based queries
      try {
        return await this.getRecommendationsWithSearch(emotion, limit, accessToken)
      } catch (searchError) {
        console.warn('Search method failed:', searchError)
      }
      
      // Fallback: Return curated tracks
      console.warn('All Spotify methods failed, using fallback recommendations')
      return this.getFallbackRecommendations(emotion, limit)
      
    } catch (error) {
      console.error('Error getting Spotify recommendations:', error)
      return this.getFallbackRecommendations(emotion, limit)
    }
  }
  
  /**
   * Try to get recommendations using genres
   */
  private async getRecommendationsWithGenres(
    emotion: EmotionType, 
    limit: number, 
    accessToken: string
  ): Promise<Track[]> {
    const genres = this.getEmotionGenres(emotion)
    const audioFeatures = this.getEmotionAudioFeatures(emotion)
    
    // Use only first 3 genres to reduce chance of invalid combinations
    const seedGenres = genres.slice(0, 3).join(',')
    const params = new URLSearchParams({
      seed_genres: seedGenres,
      limit: limit.toString(),
      target_valence: audioFeatures.valence.toString(),
      target_energy: audioFeatures.energy.toString(),
      market: 'US'
    })

    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      let errorText = 'Unknown error'
      if (response.text) {
        errorText = await response.text()
      } else {
        // For test environments
        errorText = `HTTP ${response.status}`
      }
      console.error('Spotify Recommendations API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: `https://api.spotify.com/v1/recommendations?${params}`,
        error: errorText
      })
      throw new Error(`Spotify API error: ${response.status} - ${errorText}`)
    }

    const data: SpotifyRecommendationsResponse = await response.json()
    return data.tracks.map(track => this.formatTrack(track))
  }
  
  /**
   * Try to get recommendations using search queries
   */
  private async getRecommendationsWithSearch(
    emotion: EmotionType, 
    limit: number, 
    accessToken: string
  ): Promise<Track[]> {
    const searchQueries = this.getEmotionSearchQueries(emotion)
    const tracks: Track[] = []
    
    for (const query of searchQueries) {
      if (tracks.length >= limit) break
      
      try {
        const params = new URLSearchParams({
          q: query,
          type: 'track',
          limit: Math.min(10, limit - tracks.length).toString(),
          market: 'US'
        })

        const response = await fetch(
          `https://api.spotify.com/v1/search?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        )

        if (response.ok) {
          const data: SpotifySearchResponse = await response.json()
          const searchTracks = data.tracks.items.map(track => this.formatTrack(track))
          tracks.push(...searchTracks)
        }
      } catch (error) {
        console.warn(`Search query "${query}" failed:`, error)
      }
    }
    
    if (tracks.length === 0) {
      throw new Error('No tracks found through search')
    }
    
    return tracks.slice(0, limit)
  }
  
  /**
   * Get search queries for emotions
   */
  private getEmotionSearchQueries(emotion: EmotionType): string[] {
    const queryMap: Record<EmotionType, string[]> = {
      happy: ['happy music', 'upbeat songs', 'feel good hits', 'dance music'],
      sad: ['sad songs', 'melancholy music', 'heartbreak songs', 'emotional ballads'],
      angry: ['rock music', 'metal songs', 'aggressive music', 'punk rock'],
      surprised: ['electronic music', 'experimental songs', 'unique music', 'ambient'],
      neutral: ['chill music', 'relaxing songs', 'indie music', 'background music'],
      fear: ['calm music', 'soothing songs', 'peaceful music', 'meditation'],
      disgust: ['alternative music', 'grunge songs', 'underground music', 'indie rock']
    }
    
    return queryMap[emotion] || queryMap.neutral
  }

  /**
   * Search for tracks by query
   */
  public async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    try {
      const accessToken = await this.getAccessToken()
      
      const params = new URLSearchParams({
        q: query,
        type: 'track',
        limit: limit.toString(),
        market: 'US'
      })

      const response = await fetch(
        `https://api.spotify.com/v1/search?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        let errorText = `Spotify search error: ${response.status}`
        if (response.text) {
          errorText = `Spotify search error: ${response.status} - ${await response.text()}`
        }
        throw new Error(errorText)
      }

      const data: SpotifySearchResponse = await response.json()
      return data.tracks.items.map(track => this.formatTrack(track))
    } catch (error) {
      console.error('Error searching Spotify tracks:', error)
      return []
    }
  }

  /**
   * Get track details by ID
   */
  public async getTrackDetails(trackId: string): Promise<Track | null> {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        let errorText = `Spotify track error: ${response.status}`
        if (response.text) {
          errorText = `Spotify track error: ${response.status} - ${await response.text()}`
        }
        throw new Error(errorText)
      }

      const track: SpotifyTrack = await response.json()
      return this.formatTrack(track)
    } catch (error) {
      console.error('Error getting track details:', error)
      return null
    }
  }

  /**
   * Fallback recommendations when Spotify API fails
   */
  private getFallbackRecommendations(emotion: EmotionType, limit: number): Track[] {
    const fallbackTracks: Record<EmotionType, Track[]> = {
      happy: [
        {
          id: 'fallback-happy-1',
          name: 'Happy',
          artist: 'Pharrell Williams',
          album: 'G I R L',
          duration: 232,
          spotifyUrl: '#',
          popularity: 85
        },
        {
          id: 'fallback-happy-2',
          name: "Can't Stop the Feeling!",
          artist: 'Justin Timberlake',
          album: 'Trolls (Original Motion Picture Soundtrack)',
          duration: 236,
          spotifyUrl: '#',
          popularity: 80
        }
      ],
      sad: [
        {
          id: 'fallback-sad-1',
          name: 'Someone Like You',
          artist: 'Adele',
          album: '21',
          duration: 285,
          spotifyUrl: '#',
          popularity: 85
        }
      ],
      angry: [
        {
          id: 'fallback-angry-1',
          name: 'Break Stuff',
          artist: 'Limp Bizkit',
          album: 'Significant Other',
          duration: 167,
          spotifyUrl: '#',
          popularity: 70
        }
      ],
      surprised: [
        {
          id: 'fallback-surprised-1',
          name: 'Bohemian Rhapsody',
          artist: 'Queen',
          album: 'A Night at the Opera',
          duration: 355,
          spotifyUrl: '#',
          popularity: 90
        }
      ],
      neutral: [
        {
          id: 'fallback-neutral-1',
          name: 'Weightless',
          artist: 'Marconi Union',
          album: 'Weightless',
          duration: 485,
          spotifyUrl: '#',
          popularity: 60
        }
      ],
      fear: [
        {
          id: 'fallback-fear-1',
          name: 'Breathe Me',
          artist: 'Sia',
          album: 'Colour the Small One',
          duration: 269,
          spotifyUrl: '#',
          popularity: 75
        }
      ],
      disgust: [
        {
          id: 'fallback-disgust-1',
          name: 'Smells Like Teen Spirit',
          artist: 'Nirvana',
          album: 'Nevermind',
          duration: 301,
          spotifyUrl: '#',
          popularity: 85
        }
      ]
    }

    const emotionTracks = fallbackTracks[emotion] || fallbackTracks.neutral
    return emotionTracks.slice(0, limit)
  }

  /**\n   * Clear the cached access token (for testing purposes)\n   */
  public clearTokenCache(): void {
    this.accessToken = null
    this.tokenExpiry = 0
  }
}

// Export singleton instance
export const spotifyService = SpotifyService.getInstance()