"use client"

import { useState, useEffect, useCallback } from 'react'
import { historyService, HistoryEntry, HistoryFilters, AnalyticsData } from '@/lib/historyService'
import { EmotionResult, MusicRecommendation, Track } from '@/types'

interface UseHistoryReturn {
  history: HistoryEntry[]
  analytics: AnalyticsData | null
  loading: boolean
  error: string | null
  loadHistory: (filters?: HistoryFilters) => Promise<void>
  saveEmotion: (emotion: EmotionResult) => Promise<void>
  saveRecommendation: (recommendation: MusicRecommendation) => Promise<void>
  saveTrack: (track: Track, emotion?: EmotionType, emotionAnalysisId?: string | null) => Promise<void>
  deleteEntry: (entryId: string) => Promise<void>
  loadAnalytics: (timeRange?: number) => Promise<void>
  clearError: () => void
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const loadHistory = useCallback(async (filters?: HistoryFilters) => {
    try {
      setLoading(true)
      setError(null)
      const response = await historyService.getHistory(filters)
      setHistory(response.history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  const saveEmotion = useCallback(async (emotion: EmotionResult) => {
    try {
      const savedEntry = await historyService.saveEmotionResult(emotion)
      setHistory(prev => [savedEntry, ...prev])
      return savedEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save emotion')
      throw err
    }
  }, [])

  const saveRecommendation = useCallback(async (recommendation: MusicRecommendation) => {
    try {
      const savedEntry = await historyService.saveRecommendation(recommendation)
      setHistory(prev => [savedEntry, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recommendation')
      throw err
    }
  }, [])

  const saveTrack = useCallback(async (track: Track, emotion?: EmotionType, emotionAnalysisId?: string | null) => {
    try {
      const savedEntry = await historyService.saveTrack(track, emotion, emotionAnalysisId)
      setHistory(prev => [savedEntry, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save track')
      throw err
    }
  }, [])

  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      await historyService.deleteHistoryEntry(entryId)
      setHistory(prev => prev.filter(entry => entry.id !== entryId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
      throw err
    }
  }, [])

  const loadAnalytics = useCallback(async (timeRange = 30) => {
    try {
      const analyticsData = await historyService.getAnalytics(timeRange)
      setAnalytics(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    }
  }, [])

  return {
    history,
    analytics,
    loading,
    error,
    loadHistory,
    saveEmotion,
    saveRecommendation,
    saveTrack,
    deleteEntry,
    loadAnalytics,
    clearError
  }
}