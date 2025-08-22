import { historyService } from '@/lib/historyService'
import { EmotionResult, MusicRecommendation } from '@/types'

// Mock localStorage
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('History Service', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('saveEmotionResult', () => {
    it('should save emotion result to localStorage', async () => {
      const mockEmotion: EmotionResult = {
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
      }

      const id = await historyService.saveEmotionResult(mockEmotion)

      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)

      const stored = localStorage.getItem('moodify_history')
      expect(stored).toBeTruthy()
      
      const history = JSON.parse(stored!)
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        id,
        type: 'emotion',
        data: mockEmotion,
        timestamp: expect.any(String)
      })
    })

    it('should append to existing history', async () => {
      const emotion1: EmotionResult = {
        emotion: 'happy',
        confidence: 0.8,
        allEmotions: { happy: 0.8, sad: 0.2, angry: 0, surprised: 0, neutral: 0, fear: 0, disgust: 0 }
      }
      
      const emotion2: EmotionResult = {
        emotion: 'sad',
        confidence: 0.7,
        allEmotions: { happy: 0.1, sad: 0.7, angry: 0.1, surprised: 0.05, neutral: 0.03, fear: 0.01, disgust: 0.01 }
      }

      await historyService.saveEmotionResult(emotion1)
      await historyService.saveEmotionResult(emotion2)

      const stored = localStorage.getItem('moodify_history')
      const history = JSON.parse(stored!)
      
      expect(history).toHaveLength(2)
      expect(history[0].data.emotion).toBe('happy')
      expect(history[1].data.emotion).toBe('sad')
    })
  })

  describe('saveMusicRecommendation', () => {
    it('should save music recommendation to localStorage', async () => {
      const mockRecommendation: MusicRecommendation = {
        emotion: 'happy',
        tracks: [
          {
            id: 'track1',
            name: 'Happy Song',
            artist: 'Artist 1',
            album: 'Album 1',
            imageUrl: 'https://example.com/image.jpg',
            previewUrl: 'https://example.com/preview.mp3',
            spotifyUrl: 'https://open.spotify.com/track/track1'
          }
        ],
        timestamp: new Date()
      }

      const id = await historyService.saveMusicRecommendation(mockRecommendation)

      expect(typeof id).toBe('string')
      
      const stored = localStorage.getItem('moodify_history')
      const history = JSON.parse(stored!)
      
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        id,
        type: 'recommendation',
        data: expect.objectContaining({
          emotion: 'happy',
          tracks: expect.arrayContaining([
            expect.objectContaining({
              name: 'Happy Song',
              artist: 'Artist 1'
            })
          ])
        })
      })
    })
  })

  describe('getHistory', () => {
    beforeEach(async () => {
      // Set up some test data
      const emotion: EmotionResult = {
        emotion: 'happy',
        confidence: 0.8,
        allEmotions: { happy: 0.8, sad: 0.2, angry: 0, surprised: 0, neutral: 0, fear: 0, disgust: 0 }
      }
      
      const recommendation: MusicRecommendation = {
        emotion: 'sad',
        tracks: [{
          id: 'track1',
          name: 'Sad Song',
          artist: 'Artist 1',
          album: 'Album 1',
          imageUrl: 'https://example.com/image.jpg',
          previewUrl: 'https://example.com/preview.mp3',
          spotifyUrl: 'https://open.spotify.com/track/track1'
        }],
        timestamp: new Date()
      }

      await historyService.saveEmotionResult(emotion)
      await historyService.saveMusicRecommendation(recommendation)
    })

    it('should return all history by default', async () => {
      const result = await historyService.getHistory({})

      expect(result.history).toHaveLength(2)
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.hasMore).toBe(false)
    })

    it('should filter by type', async () => {
      const emotionResult = await historyService.getHistory({ type: 'emotion' })
      const recommendationResult = await historyService.getHistory({ type: 'recommendation' })

      expect(emotionResult.history).toHaveLength(1)
      expect(emotionResult.history[0].type).toBe('emotion')

      expect(recommendationResult.history).toHaveLength(1)
      expect(recommendationResult.history[0].type).toBe('recommendation')
    })

    it('should apply pagination', async () => {
      const result = await historyService.getHistory({ limit: 1, page: 1 })

      expect(result.history).toHaveLength(1)
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.hasMore).toBe(true)
      expect(result.pagination.totalPages).toBe(2)
    })

    it('should filter by date range', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const result = await historyService.getHistory({
        startDate: yesterday,
        endDate: tomorrow
      })

      expect(result.history).toHaveLength(2)
    })

    it('should return empty result for future date range', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const dayAfter = new Date()
      dayAfter.setDate(dayAfter.getDate() + 2)

      const result = await historyService.getHistory({
        startDate: tomorrow,
        endDate: dayAfter
      })

      expect(result.history).toHaveLength(0)
    })
  })

  describe('deleteHistoryEntry', () => {
    it('should delete specific history entry', async () => {
      const emotion: EmotionResult = {
        emotion: 'happy',
        confidence: 0.8,
        allEmotions: { happy: 0.8, sad: 0.2, angry: 0, surprised: 0, neutral: 0, fear: 0, disgust: 0 }
      }

      const id = await historyService.saveEmotionResult(emotion)
      
      // Verify entry exists
      let result = await historyService.getHistory({})
      expect(result.history).toHaveLength(1)

      // Delete entry
      await historyService.deleteHistoryEntry(id)

      // Verify entry is deleted
      result = await historyService.getHistory({})
      expect(result.history).toHaveLength(0)
    })

    it('should handle deleting non-existent entry', async () => {
      await expect(historyService.deleteHistoryEntry('non-existent-id'))
        .rejects.toThrow('History entry not found')
    })
  })

  describe('clearHistory', () => {
    it('should clear all history', async () => {
      const emotion: EmotionResult = {
        emotion: 'happy',
        confidence: 0.8,
        allEmotions: { happy: 0.8, sad: 0.2, angry: 0, surprised: 0, neutral: 0, fear: 0, disgust: 0 }
      }

      await historyService.saveEmotionResult(emotion)
      
      // Verify history exists
      let result = await historyService.getHistory({})
      expect(result.history).toHaveLength(1)

      // Clear history
      await historyService.clearHistory()

      // Verify history is cleared
      result = await historyService.getHistory({})
      expect(result.history).toHaveLength(0)
    })
  })

  describe('exportHistory', () => {
    beforeEach(async () => {
      const emotion: EmotionResult = {
        emotion: 'happy',
        confidence: 0.8,
        allEmotions: { happy: 0.8, sad: 0.2, angry: 0, surprised: 0, neutral: 0, fear: 0, disgust: 0 }
      }

      await historyService.saveEmotionResult(emotion)
    })

    it('should export history as JSON', async () => {
      const blob = await historyService.exportHistory('json')
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/json')
      
      const text = await blob.text()
      const data = JSON.parse(text)
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(data[0].type).toBe('emotion')
    })

    it('should export history as CSV', async () => {
      const blob = await historyService.exportHistory('csv')
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('text/csv')
      
      const text = await blob.text()
      
      expect(text).toContain('Type,Emotion,Confidence,Timestamp')
      expect(text).toContain('emotion,happy,0.8')
    })

    it('should handle empty history export', async () => {
      await historyService.clearHistory()
      
      const jsonBlob = await historyService.exportHistory('json')
      const jsonText = await jsonBlob.text()
      
      expect(JSON.parse(jsonText)).toEqual([])
    })
  })

  describe('getAnalyticsData', () => {
    beforeEach(async () => {
      // Add multiple entries for analytics
      const emotions = ['happy', 'sad', 'angry', 'happy', 'neutral'] as const
      
      for (const emotion of emotions) {
        const emotionResult: EmotionResult = {
          emotion,
          confidence: 0.8,
          allEmotions: { [emotion]: 0.8, happy: 0.1, sad: 0.1, angry: 0, surprised: 0, neutral: 0, fear: 0, disgust: 0 }
        }
        await historyService.saveEmotionResult(emotionResult)
      }
    })

    it('should return analytics data', async () => {
      const analytics = await historyService.getAnalyticsData(30)

      expect(analytics).toHaveProperty('dailyTrends')
      expect(analytics).toHaveProperty('emotionDistribution')
      expect(analytics).toHaveProperty('weeklyData')

      expect(analytics.emotionDistribution.happy).toBe(2)
      expect(analytics.emotionDistribution.sad).toBe(1)
      expect(analytics.emotionDistribution.angry).toBe(1)
      expect(analytics.emotionDistribution.neutral).toBe(1)
    })

    it('should filter by date range', async () => {
      const analytics = await historyService.getAnalyticsData(0) // No days back
      
      // Should have no data since we're looking at 0 days back
      expect(analytics.dailyTrends).toHaveLength(0)
    })
  })
})