/**
 * History fixtures for testing history management features
 */

import { validEmotions } from './emotions'
import { mockTracks } from './tracks'

export const historyEntries = {
  emotion1: {
    id: 'hist_emotion_001',
    type: 'emotion' as const,
    data: {
      emotion: 'happy',
      confidence: 0.85,
      allEmotions: validEmotions.happy.allEmotions,
    },
    timestamp: '2025-01-15T10:30:00.000Z',
  },
  emotion2: {
    id: 'hist_emotion_002',
    type: 'emotion' as const,
    data: {
      emotion: 'sad',
      confidence: 0.78,
      allEmotions: validEmotions.sad.allEmotions,
    },
    timestamp: '2025-01-14T15:20:00.000Z',
  },
  emotion3: {
    id: 'hist_emotion_003',
    type: 'emotion' as const,
    data: {
      emotion: 'angry',
      confidence: 0.82,
      allEmotions: validEmotions.angry.allEmotions,
    },
    timestamp: '2025-01-13T09:45:00.000Z',
  },
  recommendation1: {
    id: 'hist_rec_001',
    type: 'recommendation' as const,
    data: {
      emotion: 'happy',
      tracks: [mockTracks.happyTrack1, mockTracks.happyTrack2],
      timestamp: new Date('2025-01-15T10:31:00.000Z'),
    },
    timestamp: '2025-01-15T10:31:00.000Z',
  },
  recommendation2: {
    id: 'hist_rec_002',
    type: 'recommendation' as const,
    data: {
      emotion: 'sad',
      tracks: [mockTracks.sadTrack1, mockTracks.sadTrack2],
      timestamp: new Date('2025-01-14T15:21:00.000Z'),
    },
    timestamp: '2025-01-14T15:21:00.000Z',
  },
  recommendation3: {
    id: 'hist_rec_003',
    type: 'recommendation' as const,
    data: {
      emotion: 'angry',
      tracks: [mockTracks.angryTrack1],
      timestamp: new Date('2025-01-13T09:46:00.000Z'),
    },
    timestamp: '2025-01-13T09:46:00.000Z',
  },
}

export const mockHistoryList = [
  historyEntries.emotion1,
  historyEntries.recommendation1,
  historyEntries.emotion2,
  historyEntries.recommendation2,
  historyEntries.emotion3,
  historyEntries.recommendation3,
]

// Generate a larger history set for pagination testing
export const generateMockHistory = (count: number) => {
  const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']
  const history = []
  
  for (let i = 0; i < count; i++) {
    const emotion = emotions[i % emotions.length]
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Add emotion entry
    history.push({
      id: `hist_emotion_${String(i).padStart(3, '0')}`,
      type: 'emotion' as const,
      data: {
        emotion,
        confidence: 0.7 + Math.random() * 0.25,
        allEmotions: {
          happy: emotion === 'happy' ? 0.8 : 0.1,
          sad: emotion === 'sad' ? 0.8 : 0.1,
          angry: emotion === 'angry' ? 0.8 : 0.1,
          surprised: emotion === 'surprised' ? 0.8 : 0.1,
          neutral: emotion === 'neutral' ? 0.8 : 0.1,
          fear: emotion === 'fear' ? 0.8 : 0.1,
          disgust: emotion === 'disgust' ? 0.8 : 0.1,
        },
      },
      timestamp: date.toISOString(),
    })
    
    // Add corresponding recommendation entry
    history.push({
      id: `hist_rec_${String(i).padStart(3, '0')}`,
      type: 'recommendation' as const,
      data: {
        emotion,
        tracks: [mockTracks.happyTrack1], // Simplified for testing
        timestamp: new Date(date.getTime() + 1000),
      },
      timestamp: new Date(date.getTime() + 1000).toISOString(),
    })
  }
  
  return history
}

export const paginationScenarios = {
  page1Limit10: {
    query: { page: 1, limit: 10 },
    expectedTotal: 50,
    expectedPage: 1,
    expectedLimit: 10,
    expectedTotalPages: 5,
    expectedHasMore: true,
  },
  page2Limit10: {
    query: { page: 2, limit: 10 },
    expectedTotal: 50,
    expectedPage: 2,
    expectedLimit: 10,
    expectedTotalPages: 5,
    expectedHasMore: true,
  },
  lastPage: {
    query: { page: 5, limit: 10 },
    expectedTotal: 50,
    expectedPage: 5,
    expectedLimit: 10,
    expectedTotalPages: 5,
    expectedHasMore: false,
  },
  customLimit: {
    query: { page: 1, limit: 25 },
    expectedTotal: 50,
    expectedPage: 1,
    expectedLimit: 25,
    expectedTotalPages: 2,
    expectedHasMore: true,
  },
  outOfBounds: {
    query: { page: 100, limit: 10 },
    expectedTotal: 50,
    expectedPage: 100,
    expectedLimit: 10,
    expectedTotalPages: 5,
    expectedHasMore: false,
    expectedResults: 0,
  },
}

export const filterScenarios = {
  byEmotionType: {
    filter: { type: 'emotion' },
    expectedCount: 3, // From mockHistoryList
    expectedTypes: ['emotion'],
  },
  byRecommendationType: {
    filter: { type: 'recommendation' },
    expectedCount: 3,
    expectedTypes: ['recommendation'],
  },
  byEmotion: {
    filter: { emotion: 'happy' },
    expectedCount: 2, // 1 emotion + 1 recommendation
  },
  byDateRange: {
    filter: {
      startDate: '2025-01-14T00:00:00.000Z',
      endDate: '2025-01-15T23:59:59.999Z',
    },
    expectedCount: 4, // Entries from Jan 14-15
  },
  combined: {
    filter: {
      type: 'emotion',
      emotion: 'happy',
      startDate: '2025-01-15T00:00:00.000Z',
    },
    expectedCount: 1,
  },
}

export const invalidHistoryData = {
  invalidType: {
    type: 'invalid_type',
    data: { some: 'data' },
  },
  missingData: {
    type: 'emotion',
    // Missing data field
  },
  invalidEmotionData: {
    type: 'emotion',
    data: {
      emotion: 'invalid_emotion',
      confidence: 'not_a_number',
    },
  },
  invalidRecommendationData: {
    type: 'recommendation',
    data: {
      emotion: 'happy',
      tracks: 'not_an_array',
    },
  },
}

export const exportFormats = {
  json: {
    format: 'json',
    mimeType: 'application/json',
    fileExtension: '.json',
  },
  csv: {
    format: 'csv',
    mimeType: 'text/csv',
    fileExtension: '.csv',
  },
}

export const csvExpectedHeaders = [
  'ID',
  'Type',
  'Emotion',
  'Confidence',
  'Timestamp',
  'Tracks Count',
]

export const storageScenarios = {
  quotaExceeded: {
    error: 'QuotaExceededError',
    message: 'Storage quota exceeded',
  },
  accessDenied: {
    error: 'SecurityError',
    message: 'Storage access denied',
  },
  corruptedData: {
    data: 'invalid json {{{',
  },
}

export const deleteScenarios = {
  singleEntry: {
    id: 'hist_emotion_001',
    expectedRemainingCount: 5,
  },
  nonExistent: {
    id: 'non_existent_id',
    expectedError: 'History entry not found',
  },
  clearAll: {
    expectedRemainingCount: 0,
  },
}

export const sortingOptions = {
  newestFirst: {
    order: 'desc',
    field: 'timestamp',
  },
  oldestFirst: {
    order: 'asc',
    field: 'timestamp',
  },
  byConfidence: {
    order: 'desc',
    field: 'confidence',
  },
}
