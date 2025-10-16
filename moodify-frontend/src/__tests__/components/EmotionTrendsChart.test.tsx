import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { EmotionTrendsChart } from '@/components/analytics/EmotionTrendsChart'
import { EmotionType } from '@/types'

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart" data-options={JSON.stringify(options)}>
      {JSON.stringify(data)}
    </div>
  ),
  Doughnut: ({ data, options }: any) => (
    <div data-testid="doughnut-chart" data-options={JSON.stringify(options)}>
      {JSON.stringify(data)}
    </div>
  )
}))

// Mock chartConfig
jest.mock('@/lib/chartConfig', () => ({
  lineChartOptions: {
    responsive: true,
    plugins: {
      tooltip: {},
      legend: {}
    }
  },
  doughnutChartOptions: {
    responsive: true,
    plugins: {
      tooltip: {},
      legend: {}
    }
  },
  emotionColors: {
    happy: { primary: '#fbbf24', light: '#fde68a', dark: '#d97706' },
    sad: { primary: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8' },
    angry: { primary: '#ef4444', light: '#fca5a5', dark: '#dc2626' },
    surprised: { primary: '#f59e0b', light: '#fcd34d', dark: '#d97706' },
    neutral: { primary: '#6b7280', light: '#d1d5db', dark: '#374151' },
    fear: { primary: '#8b5cf6', light: '#c4b5fd', dark: '#7c3aed' },
    disgust: { primary: '#10b981', light: '#6ee7b7', dark: '#059669' }
  },
  generateEmotionChartData: (data: any) => ({
    labels: Object.keys(data).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{ data: Object.values(data) }]
  })
}))

describe('EmotionTrendsChart', () => {
  const mockOnTimeRangeChange = jest.fn()

  const createMockData = (trends: Array<{ date: string; count: number; primaryEmotion: EmotionType }>) => ({
    dailyTrends: trends,
    emotionDistribution: {
      happy: 5,
      sad: 3,
      angry: 2,
      surprised: 1,
      neutral: 4,
      fear: 1,
      disgust: 0
    } as Record<EmotionType, number>,
    weeklyData: []
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      render(
        <EmotionTrendsChart
          data={null}
          loading={true}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      expect(screen.getByText('Loading emotion trends...')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display "No emotion data available" when data is null', () => {
      render(
        <EmotionTrendsChart
          data={null}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      expect(screen.getByText('No emotion data available')).toBeInTheDocument()
    })

    it('should display "No data available for selected time range" when dailyTrends is empty', () => {
      const emptyData = createMockData([])

      render(
        <EmotionTrendsChart
          data={emptyData}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      expect(screen.getByText('No data available for selected time range')).toBeInTheDocument()
    })
  })

  describe('Timeline View - Single Line Chart', () => {
    it('should render line chart with single day data', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toBeInTheDocument()
      
      const chartData = JSON.parse(lineChart.textContent || '{}')
      expect(chartData.labels).toHaveLength(1)
      expect(chartData.datasets).toHaveLength(1)
      expect(chartData.datasets[0].label).toBe('Daily Emotion Analyses')
    })

    it('should render line chart with multiple days of same emotion', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' },
        { date: '2024-01-16', count: 3, primaryEmotion: 'happy' },
        { date: '2024-01-17', count: 4, primaryEmotion: 'happy' },
        { date: '2024-01-18', count: 6, primaryEmotion: 'happy' },
        { date: '2024-01-19', count: 2, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      const lineChart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(lineChart.textContent || '{}')
      
      expect(chartData.labels).toHaveLength(5)
      expect(chartData.datasets[0].data).toEqual([5, 3, 4, 6, 2])
      expect(chartData.datasets[0].pointBackgroundColor).toHaveLength(5)
      expect(chartData.datasets[0].pointBackgroundColor.every((c: string) => c === '#fbbf24')).toBe(true)
    })

    it('should render line chart with multiple days of mixed emotions', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' },
        { date: '2024-01-16', count: 3, primaryEmotion: 'sad' },
        { date: '2024-01-17', count: 4, primaryEmotion: 'angry' },
        { date: '2024-01-18', count: 2, primaryEmotion: 'neutral' },
        { date: '2024-01-19', count: 6, primaryEmotion: 'surprised' },
        { date: '2024-01-20', count: 1, primaryEmotion: 'fear' },
        { date: '2024-01-21', count: 3, primaryEmotion: 'disgust' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      const lineChart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(lineChart.textContent || '{}')
      
      expect(chartData.labels).toHaveLength(7)
      expect(chartData.datasets[0].data).toEqual([5, 3, 4, 2, 6, 1, 3])
      expect(chartData.datasets[0].pointBackgroundColor).toEqual([
        '#fbbf24', // happy
        '#3b82f6', // sad
        '#ef4444', // angry
        '#6b7280', // neutral
        '#f59e0b', // surprised
        '#8b5cf6', // fear
        '#10b981'  // disgust
      ])
    })

    it('should sort daily trends chronologically', () => {
      const data = createMockData([
        { date: '2024-01-17', count: 4, primaryEmotion: 'happy' },
        { date: '2024-01-15', count: 5, primaryEmotion: 'sad' },
        { date: '2024-01-16', count: 3, primaryEmotion: 'angry' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      const lineChart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(lineChart.textContent || '{}')
      
      // Should be sorted: Jan 15, Jan 16, Jan 17
      expect(chartData.datasets[0].data).toEqual([5, 3, 4])
    })

    it('should display emotion color legend in timeline view', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      expect(screen.getByText('Emotion Colors')).toBeInTheDocument()
      // Use getAllByText for text that appears multiple times (in stats and legend)
      expect(screen.getAllByText('happy').length).toBeGreaterThan(0)
      expect(screen.getByText('sad')).toBeInTheDocument()
      expect(screen.getByText('angry')).toBeInTheDocument()
    })
  })

  describe('Distribution View', () => {
    it('should render doughnut chart when distribution view is selected', async () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      const distributionButton = screen.getByText('Distribution')
      await userEvent.click(distributionButton)

      await waitFor(() => {
        expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
      })
    })

    it('should not display emotion color legend in distribution view', async () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      const distributionButton = screen.getByText('Distribution')
      await userEvent.click(distributionButton)

      await waitFor(() => {
        expect(screen.queryByText('Emotion Colors')).not.toBeInTheDocument()
      })
    })
  })

  describe('Summary Statistics', () => {
    it('should calculate total analyses correctly', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' },
        { date: '2024-01-16', count: 3, primaryEmotion: 'sad' },
        { date: '2024-01-17', count: 4, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      expect(screen.getByText('Total Analyses')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument() // 5 + 3 + 4
    })

    it('should display most common emotion', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      expect(screen.getByText('Most Common')).toBeInTheDocument()
      // Use getAllByText since 'happy' appears in both summary stats and legend
      expect(screen.getAllByText('happy').length).toBeGreaterThan(0)
    })

    it('should display unique days count', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' },
        { date: '2024-01-16', count: 3, primaryEmotion: 'sad' },
        { date: '2024-01-17', count: 4, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      expect(screen.getByText('Unique Days')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should calculate average per day correctly', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' },
        { date: '2024-01-16', count: 3, primaryEmotion: 'sad' },
        { date: '2024-01-17', count: 4, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      expect(screen.getByText('Avg per Day')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument() // 12 / 3 = 4
    })
  })

  describe('Time Range Selector', () => {
    it('should call onTimeRangeChange when time range is changed', async () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      const select = screen.getByDisplayValue('Last 7 days')
      await userEvent.selectOptions(select, '30')

      expect(mockOnTimeRangeChange).toHaveBeenCalledWith(30)
    })

    it('should display all time range options', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      expect(screen.getByText('Last 7 days')).toBeInTheDocument()
      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
      expect(screen.getByText('Last 3 months')).toBeInTheDocument()
      expect(screen.getByText('Last year')).toBeInTheDocument()
    })
  })

  describe('Chart Type Toggle', () => {
    it('should toggle between timeline and distribution views', async () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'happy' }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      // Initially shows line chart
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()

      // Click distribution button
      const distributionButton = screen.getByText('Distribution')
      await userEvent.click(distributionButton)

      await waitFor(() => {
        expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
      })

      // Click timeline button
      const timelineButton = screen.getByText('Timeline')
      await userEvent.click(timelineButton)

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })
    })
  })

  describe('Data Validation', () => {
    it('should handle invalid date formats gracefully', () => {
      const data = createMockData([
        { date: 'invalid-date', count: 5, primaryEmotion: 'happy' },
        { date: '2024-01-16', count: 3, primaryEmotion: 'sad' }
      ])

      // Invalid dates should still render the chart, just with a warning
      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toBeInTheDocument()
      // Chart should still render with both data points
      const chartData = JSON.parse(lineChart.textContent || '{}')
      expect(chartData.labels).toHaveLength(2)
    })

    it('should use neutral color for unknown emotion types', () => {
      const data = createMockData([
        { date: '2024-01-15', count: 5, primaryEmotion: 'unknown' as EmotionType }
      ])

      render(
        <EmotionTrendsChart
          data={data}
          loading={false}
          timeRange={7}
          onTimeRangeChange={mockOnTimeRangeChange}
        />
      )

      const lineChart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(lineChart.textContent || '{}')
      
      expect(chartData.datasets[0].pointBackgroundColor[0]).toBe('#6b7280') // neutral color
    })
  })
})
