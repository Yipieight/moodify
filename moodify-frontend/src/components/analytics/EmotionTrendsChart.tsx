"use client"

import { useState, useMemo } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import { 
  lineChartOptions, 
  doughnutChartOptions, 
  emotionColors,
  generateEmotionChartData
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

  // Generate line chart data for daily trends (single-line aggregated timeline)
  const generateDailyTrendsData = () => {
    if (!data?.dailyTrends || data.dailyTrends.length === 0) return null

    // Sort trends chronologically
    const sortedTrends = [...data.dailyTrends].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Format date labels for x-axis with proper date parsing
    const labels = sortedTrends.map(trend => {
      try {
        // Parse the date string (YYYY-MM-DD format)
        const [year, month, day] = trend.date.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        // Show full date format to make it clearer
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      } catch (error) {
        console.warn('Invalid date format:', trend.date)
        return trend.date
      }
    })

    // Extract data values (counts per day)
    const dataValues = sortedTrends.map(trend => trend.count)

    // Map primary emotions to colors for each point
    const pointColors = sortedTrends.map(trend => 
      emotionColors[trend.primaryEmotion]?.primary || emotionColors.neutral.primary
    )

    // Create single dataset with colored points
    return {
      labels,
      datasets: [{
        label: 'Daily Emotion Analyses',
        data: dataValues,
        borderColor: '#9333ea', // purple-600
        backgroundColor: '#9333ea33', // purple with transparency
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.4,
        fill: false
      }],
      // Store original trend data for tooltip access
      _sortedTrends: sortedTrends
    }
  }

  // Custom chart options with enhanced tooltips
  const customLineChartOptions = useMemo(() => ({
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      tooltip: {
        ...lineChartOptions.plugins?.tooltip,
        callbacks: {
          title: (context: any) => {
            const index = context[0]?.dataIndex
            if (index !== undefined && data?.dailyTrends) {
              const sortedTrends = [...data.dailyTrends].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              const trend = sortedTrends[index]
              if (trend) {
                try {
                  // Parse the date string (YYYY-MM-DD format)
                  const [year, month, day] = trend.date.split('-')
                  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                  return date.toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric' 
                  })
                } catch (error) {
                  return trend.date
                }
              }
            }
            return context[0]?.label || ''
          },
          label: (context: any) => {
            const value = context.parsed.y
            const index = context.dataIndex
            if (index !== undefined && data?.dailyTrends) {
              const sortedTrends = [...data.dailyTrends].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              const trend = sortedTrends[index]
              if (trend) {
                const emotionName = trend.primaryEmotion.charAt(0).toUpperCase() + 
                                   trend.primaryEmotion.slice(1)
                return [
                  `${value} ${value === 1 ? 'analysis' : 'analyses'}`,
                  `Primary: ${emotionName}`
                ]
              }
            }
            return `${value} ${value === 1 ? 'analysis' : 'analyses'}`
          }
        }
      },
      legend: {
        display: false // Hide default legend, we'll use custom legend below
      }
    }
  }), [data?.dailyTrends])

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
            className="text-black px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
          <Line data={lineData} options={customLineChartOptions} />
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

      {/* Legend for line chart - Emotion color reference */}
      {chartType === 'line' && lineData && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">Emotion Colors</p>
          <div className="flex flex-wrap gap-3 justify-center">
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
        </div>
      )}
    </div>
  )
}