import { EmotionResult, MusicRecommendation, EmotionType } from '@/types'

export interface HistoryEntry {
  id: string
  userId: string
  type: 'emotion' | 'recommendation'
  data: EmotionResult | MusicRecommendation
  createdAt: Date
}

export interface HistoryFilters {
  type?: 'emotion' | 'recommendation' | 'all'
  startDate?: Date
  endDate?: Date
  timeRange?: string  // For special time ranges like '24hours'
  emotion?: EmotionType
  limit?: number
  page?: number
}

export interface HistoryResponse {
  history: HistoryEntry[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
    totalPages: number
  }
}

export interface AnalyticsData {
  totalAnalyses: number
  totalRecommendations: number
  averageAnalysesPerDay: number
  emotionDistribution: Record<EmotionType, number>
  mostCommonEmotion: EmotionType
  sentimentAnalysis: {
    positive: number
    negative: number
    neutral: number
  }
  weeklyData: Array<{
    week: string
    count: number
    emotions: Record<EmotionType, number>
  }>
  dailyTrends: Array<{
    date: string
    count: number
    primaryEmotion: EmotionType
  }>
  musicPreferences: {
    genresByEmotion: Record<EmotionType, string[]>
    popularTracks: Array<{
      name: string
      artist: string
      playCount: number
    }>
  }
  activityPatterns: {
    hourlyDistribution: number[]
    dayOfWeekDistribution: number[]
    peakActivityHour: number
    peakActivityDay: string
  }
}

class HistoryService {
  private readonly baseUrl = '/api/history'

  /**
   * Save an emotion detection result to history
   */
  async saveEmotionResult(emotionResult: EmotionResult): Promise<HistoryEntry> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'emotion',
        data: emotionResult
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save emotion result')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to save emotion result')
    }

    return result.data
  }

  /**
   * Save a music recommendation to history
   */
  async saveRecommendation(recommendation: MusicRecommendation): Promise<HistoryEntry> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'recommendation',
        data: recommendation
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save recommendation')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to save recommendation')
    }

    return result.data
  }

  /**
   * Get user history with optional filters
   */
  async getHistory(filters: HistoryFilters = {}): Promise<HistoryResponse> {
    const params = new URLSearchParams()
    
    if (filters.type) params.append('type', filters.type)
    if (filters.emotion) params.append('emotion', filters.emotion)
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString())
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString())
    if (filters.timeRange) params.append('timeRange', filters.timeRange)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.page) params.append('page', filters.page.toString())

    const response = await fetch(`${this.baseUrl}?${params}`)

    if (!response.ok) {
      throw new Error('Failed to fetch history')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch history')
    }

    return result.data
  }

  /**
   * Get emotion history only
   */
  async getEmotionHistory(filters: Omit<HistoryFilters, 'type'> = {}): Promise<EmotionResult[]> {
    const response = await this.getHistory({ ...filters, type: 'emotion' })
    return response.history.map(entry => entry.data as EmotionResult)
  }

  /**
   * Get recommendation history only
   */
  async getRecommendationHistory(filters: Omit<HistoryFilters, 'type'> = {}): Promise<MusicRecommendation[]> {
    const response = await this.getHistory({ ...filters, type: 'recommendation' })
    return response.history.map(entry => entry.data as MusicRecommendation)
  }

  /**
   * Delete a history entry
   */
  async deleteHistoryEntry(entryId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${entryId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete history entry')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete history entry')
    }
  }

  /**
   * Get analytics data for the user
   */
  async getAnalytics(timeRange: number = 30): Promise<AnalyticsData> {
    const response = await fetch(`${this.baseUrl}/analytics?timeRange=${timeRange}`)

    if (!response.ok) {
      throw new Error('Failed to fetch analytics')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch analytics')
    }

    return result.data
  }

  /**
   * Get recent activity (last 10 entries)
   */
  async getRecentActivity(): Promise<HistoryEntry[]> {
    const response = await this.getHistory({ limit: 10 })
    return response.history
  }

  /**
   * Get emotion statistics for a specific time period
   */
  async getEmotionStats(startDate: Date, endDate: Date): Promise<{
    totalDetections: number
    emotionBreakdown: Record<EmotionType, number>
    averageConfidence: number
  }> {
    const emotions = await this.getEmotionHistory({ startDate, endDate })
    
    const totalDetections = emotions.length
    const emotionBreakdown: Record<EmotionType, number> = {
      happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0, fear: 0, disgust: 0
    }
    
    let totalConfidence = 0

    emotions.forEach(emotion => {
      emotionBreakdown[emotion.emotion]++
      totalConfidence += emotion.confidence
    })

    const averageConfidence = totalDetections > 0 ? totalConfidence / totalDetections : 0

    return {
      totalDetections,
      emotionBreakdown,
      averageConfidence: Math.round(averageConfidence * 100) / 100
    }
  }

  /**
   * Clear all history for the user
   */
  async clearHistory(): Promise<void> {
    // Note: This would need to be implemented in the API
    // For now, we'll throw an error indicating it's not implemented
    throw new Error('Clear history functionality not implemented yet')
  }

  /**
   * Export history data
   */
  async exportHistory(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const history = await this.getHistory({ limit: 1000 }) // Get all history
    
    if (format === 'json') {
      const jsonData = JSON.stringify(history, null, 2)
      return new Blob([jsonData], { type: 'application/json' })
    } else {
      // Convert to CSV format
      const csvHeaders = 'ID,Type,Date,Emotion,Confidence,Tracks\n'
      const csvRows = history.history.map(entry => {
        const date = new Date(entry.createdAt).toISOString()
        if (entry.type === 'emotion') {
          const emotion = entry.data as EmotionResult
          return `${entry.id},emotion,${date},${emotion.emotion},${emotion.confidence},`
        } else {
          const recommendation = entry.data as MusicRecommendation
          const tracks = recommendation.tracks.map(t => t.name).join(';')
          return `${entry.id},recommendation,${date},${recommendation.emotion},,${tracks}`
        }
      }).join('\n')
      
      const csvData = csvHeaders + csvRows
      return new Blob([csvData], { type: 'text/csv' })
    }
  }
}

// Singleton instance
export const historyService = new HistoryService()