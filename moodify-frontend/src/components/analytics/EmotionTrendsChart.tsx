"use client"

import { useState, useEffect } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import { 
  lineChartOptions, 
  doughnutChartOptions, 
  emotionColors,
  generateEmotionChartData,
  generateMultiLineData 
} from '@/lib/chartConfig'
import { EmotionType } from '@/types'
import { Loading } from '@/components/ui/Loading'

interface EmotionTrendsData {
  dailyTrends: Array<{
    date: string
    count: number
    primaryEmotion: EmotionType
  }>
  emotionDistribution: Record<EmotionType, number>
  weeklyData: Array<{
    week: string
    count: number
    emotions: Record<EmotionType, number>
  }>
}

interface EmotionTrendsChartProps {
  data: EmotionTrendsData | null
  loading: boolean
  timeRange: number
  onTimeRangeChange: (range: number) => void
}

export function EmotionTrendsChart({ 
  data, 
  loading, 
  timeRange, 
  onTimeRangeChange 
}: EmotionTrendsChartProps) {
  const [chartType, setChartType] = useState<'line' | 'distribution'>('line')

  const timeRangeOptions = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 3 months' },
    { value: 365, label: 'Last year' }
  ]

  // Generate line chart data for daily trends
  const generateDailyTrendsData = () => {
    if (!data?.dailyTrends) return null

    const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']
    
    // Create a map of dates to emotion counts
    const dateMap = new Map<string, Record<EmotionType, number>>()
    
    data.dailyTrends.forEach(trend => {
      const emotionCounts = emotions.reduce((acc, emotion) => {
        acc[emotion] = 0
        return acc
      }, {} as Record<EmotionType, number>)
      
      emotionCounts[trend.primaryEmotion] = trend.count
      dateMap.set(trend.date, emotionCounts)
    })

    // Convert to array format for chart
    const chartData = Array.from(dateMap.entries()).map(([date, emotions]) => ({
      date,
      ...emotions
    }))

    // Generate series for each emotion
    const series = emotions.map(emotion => ({
      key: emotion,
      label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      color: emotionColors[emotion].primary
    }))

    return generateMultiLineData(chartData, series)
  }

  // Generate distribution chart data
  const generateDistributionData = () => {
    if (!data?.emotionDistribution) return null
    return generateEmotionChartData(data.emotionDistribution)
  }

  const lineData = generateDailyTrendsData()
  const distributionData = generateDistributionData()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loading message="Loading emotion trends..." />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No emotion data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Emotion Trends</h3>
          <p className="text-sm text-gray-600">Track your emotional patterns over time</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setChartType('distribution')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'distribution'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Distribution
            </button>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-80">
        {chartType === 'line' && lineData ? (
          <Line data={lineData} options={lineChartOptions} />
        ) : chartType === 'distribution' && distributionData ? (
          <Doughnut data={distributionData} options={doughnutChartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available for selected time range
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Analyses</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.dailyTrends?.reduce((sum, trend) => sum + trend.count, 0) || 0}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Most Common</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">
            {Object.entries(data.emotionDistribution || {})
              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Unique Days</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.dailyTrends?.length || 0}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Avg per Day</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.dailyTrends?.length 
              ? Math.round((data.dailyTrends.reduce((sum, trend) => sum + trend.count, 0) / data.dailyTrends.length) * 10) / 10
              : 0}
          </p>
        </div>
      </div>

      {/* Legend for line chart */}
      {chartType === 'line' && (
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {Object.entries(emotionColors).map(([emotion, colors]) => (
            <div key={emotion} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <span className="text-xs text-gray-600 capitalize">{emotion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}