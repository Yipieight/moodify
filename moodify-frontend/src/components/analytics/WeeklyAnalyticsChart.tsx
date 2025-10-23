"use client"

import { useState } from 'react'
import { Bar, Doughnut, PolarArea } from 'react-chartjs-2'
import { 
  barChartOptions, 
  doughnutChartOptions,
  polarAreaChartOptions,
  emotionColors 
} from '@/lib/chartConfig'
import { EmotionType } from '@/types'
import { Loading } from '@/components/ui/Loading'

interface WeeklyAnalyticsData {
  weeklyData: Array<{
    week: string
    count: number
    emotions: Record<EmotionType, number>
  }>
  sentimentAnalysis: {
    positive: number
    negative: number
    neutral: number
  }
  activityPatterns: {
    hourlyDistribution: number[]
    dayOfWeekDistribution: number[]
    peakActivityHour: number
    peakActivityDay: string
  }
}

interface WeeklyAnalyticsChartProps {
  data: WeeklyAnalyticsData | null
  loading: boolean
}

export function WeeklyAnalyticsChart({ data, loading }: WeeklyAnalyticsChartProps) {
  const [activeChart, setActiveChart] = useState<'weekly' | 'sentiment' | 'activity'>('weekly')

  const chartOptions = [
    { value: 'weekly', label: 'Weekly Trends', icon: '📊' },
    { value: 'sentiment', label: 'Sentiment Analysis', icon: '😊' },
    { value: 'activity', label: 'Activity Patterns', icon: '⏰' }
  ]

  // Generate weekly trends data with correct date formatting
  const generateWeeklyData = () => {
    if (!data?.weeklyData) return null

    const weeks = data.weeklyData.map(item => {
      try {
        // Parse the date string (YYYY-MM-DD format)
        const [year, month, day] = item.week.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        // Show actual date with proper formatting
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      } catch (error) {
        console.warn('Invalid date format:', item.week)
        return item.week
      }
    })

    return {
      labels: weeks,
      datasets: [{
        label: 'Emotion Analyses',
        data: data.weeklyData.map(item => item.count),
        backgroundColor: '#9333ea',
        borderColor: '#7c3aed',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    }
  }

  // Generate sentiment analysis data
  const generateSentimentData = () => {
    if (!data?.sentimentAnalysis) return null

    return {
      labels: ['Positive', 'Negative', 'Neutral'],
      datasets: [{
        data: [
          data.sentimentAnalysis.positive,
          data.sentimentAnalysis.negative,
          data.sentimentAnalysis.neutral
        ],
        backgroundColor: [
          '#10b981', // emerald-500 for positive
          '#ef4444', // red-500 for negative
          '#6b7280'  // gray-500 for neutral
        ],
        borderColor: [
          '#059669', // emerald-600
          '#dc2626', // red-600
          '#374151'  // gray-700
        ],
        borderWidth: 2
      }]
    }
  }

  // Generate activity patterns data with proper day alignment
  const generateActivityData = () => {
    if (!data?.activityPatterns) return null

    // Ensure day names match the actual dayOfWeekDistribution indices
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    return {
      labels: dayNames,
      datasets: [{
        label: 'Activity by Day',
        data: data.activityPatterns.dayOfWeekDistribution,
        backgroundColor: [
          '#fbbf24', '#fb923c', '#f59e0b', '#eab308', 
          '#84cc16', '#22c55e', '#06b6d4'
        ],
        borderWidth: 0
      }]
    }
  }

  // Generate hourly activity chart data with proper hour formatting
  const generateHourlyData = () => {
    if (!data?.activityPatterns) return null

    // Create proper hour labels (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => {
      if (i === 0) return '12 AM'
      if (i < 12) return `${i} AM`
      if (i === 12) return '12 PM'
      return `${i - 12} PM`
    })

    return {
      labels: hours,
      datasets: [{
        label: 'Activity by Hour',
        data: data.activityPatterns.hourlyDistribution,
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        borderWidth: 1,
        borderRadius: 2
      }]
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loading message="Loading weekly analytics..." />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No weekly analytics data available</p>
        </div>
      </div>
    )
  }

  const weeklyData = generateWeeklyData()
  const sentimentData = generateSentimentData()
  const activityData = generateActivityData()
  const hourlyData = generateHourlyData()

  return (
    <div className="space-y-6">
      {/* Chart Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {chartOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setActiveChart(option.value as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeChart === option.value
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Trends Chart */}
      {activeChart === 'weekly' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Activity Trends</h3>
            <p className="text-sm text-gray-600">Your emotion analysis activity over the weeks</p>
          </div>
          
          <div className="h-64">
            {weeklyData ? (
              <Bar data={weeklyData} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No weekly data available
              </div>
            )}
          </div>
          
          {data.weeklyData && data.weeklyData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Most Active Week</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.weeklyData.reduce((max, week) => 
                    week.count > max.count ? week : max, data.weeklyData[0]
                  ).count} analyses
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Weeks Active</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.weeklyData.length}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sentiment Analysis Chart */}
      {activeChart === 'sentiment' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
            <p className="text-sm text-gray-600">Overall emotional sentiment breakdown</p>
          </div>
          
          <div className="h-64">
            {sentimentData ? (
              <Doughnut data={sentimentData} options={doughnutChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No sentiment data available
              </div>
            )}
          </div>
          
          {data.sentimentAnalysis && (
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Positive</span>
                </div>
                <p className="text-lg font-semibold text-emerald-600">
                  {data.sentimentAnalysis.positive}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Negative</span>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  {data.sentimentAnalysis.negative}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Neutral</span>
                </div>
                <p className="text-lg font-semibold text-gray-600">
                  {data.sentimentAnalysis.neutral}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Patterns Charts */}
      {activeChart === 'activity' && (
        <div className="space-y-6">
          {/* Daily Activity Pattern */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Daily Activity Pattern</h3>
              <p className="text-sm text-gray-600">Your activity distribution across days of the week</p>
            </div>
            
            <div className="h-48">
              {activityData ? (
                <PolarArea data={activityData} options={polarAreaChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No daily activity data available
                </div>
              )}
            </div>
            
            {data.activityPatterns && (
              <div className="mt-4 text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Most Active Day</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.activityPatterns.peakActivityDay}
                </p>
              </div>
            )}
          </div>

          {/* Hourly Activity Pattern */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Hourly Activity Pattern</h3>
              <p className="text-sm text-gray-600">Your activity distribution throughout the day</p>
            </div>
            
            <div className="h-48">
              {hourlyData ? (
                <Bar data={hourlyData} options={barChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hourly activity data available
                </div>
              )}
            </div>
            
            {data.activityPatterns && (
              <div className="mt-4 text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Peak Activity Hour</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.activityPatterns.peakActivityHour === 0 ? '12 AM' :
                   data.activityPatterns.peakActivityHour > 12 ? 
                   `${data.activityPatterns.peakActivityHour - 12} PM` :
                   `${data.activityPatterns.peakActivityHour} AM`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}