"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Loading } from "@/components/ui/Loading"
import { EmotionTrendsChart } from "@/components/analytics/EmotionTrendsChart"
import { WeeklyAnalyticsChart } from "@/components/analytics/WeeklyAnalyticsChart"
import { useHistory } from "@/hooks/useHistory"
import { 
  ChartBarIcon,
  FaceSmileIcon,
  MusicalNoteIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { loadAnalytics, analytics, loading, error } = useHistory()
  
  const [timeRange, setTimeRange] = useState(30)
  const [activeSection, setActiveSection] = useState<'overview' | 'trends' | 'weekly'>('overview')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      loadAnalytics(timeRange)
    }
  }, [status, timeRange, loadAnalytics])

  if (status === "loading") {
    return (
      <MainLayout>
        <Loading message="Loading dashboard..." />
      </MainLayout>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect
  }

  const sections = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: ChartBarIcon,
      description: 'Quick stats and summary'
    },
    { 
      id: 'trends', 
      label: 'Emotion Trends', 
      icon: ArrowTrendingUpIcon,
      description: 'Track emotional patterns over time'
    },
    { 
      id: 'weekly', 
      label: 'Weekly Analytics', 
      icon: CalendarIcon,
      description: 'Weekly patterns and sentiment analysis'
    }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getMostCommonEmotion = () => {
    if (!analytics?.emotionDistribution) return null
    
    const emotions = Object.entries(analytics.emotionDistribution)
    const mostCommon = emotions.reduce((max, current) => 
      current[1] > max[1] ? current : max, emotions[0]
    )
    
    return mostCommon ? mostCommon[0] : null
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your emotional journey and insights
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-8">
          <div className="flex space-x-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-red-900 font-medium">Unable to Load Analytics</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={() => loadAnalytics(timeRange)}
                  className="mt-3 inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaceSmileIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '--' : analytics?.totalAnalyses || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MusicalNoteIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recommendations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '--' : analytics?.totalRecommendations || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Daily Average</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '--' : Math.round((analytics?.averageAnalysesPerDay || 0) * 10) / 10}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Most Common</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">
                      {loading ? '--' : getMostCommonEmotion() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <Loading message="Loading recent activity..." />
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sentiment Overview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Sentiment Balance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600">Positive</span>
                        <span className="text-sm font-medium">{analytics.sentimentAnalysis?.positive || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-600">Negative</span>
                        <span className="text-sm font-medium">{analytics.sentimentAnalysis?.negative || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Neutral</span>
                        <span className="text-sm font-medium">{analytics.sentimentAnalysis?.neutral || 0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Patterns */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Activity Patterns</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Peak Day</span>
                        <span className="text-sm font-medium">{analytics.activityPatterns?.peakActivityDay || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Peak Hour</span>
                        <span className="text-sm font-medium">
                          {analytics.activityPatterns?.peakActivityHour !== undefined 
                            ? `${analytics.activityPatterns.peakActivityHour}:00`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Music Preferences */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Music Insights</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Top Tracks</span>
                        <span className="text-sm font-medium">
                          {analytics.musicPreferences?.popularTracks?.length || 0}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {analytics.musicPreferences?.popularTracks?.[0]?.name 
                          ? `Most played: ${analytics.musicPreferences.popularTracks[0].name}`
                          : 'No tracks played yet'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No data available. Start by analyzing your emotions!
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/capture')}
                  className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors"
                >
                  <FaceSmileIcon className="w-5 h-5" />
                  <span>Analyze Emotion</span>
                </button>
                
                <button
                  onClick={() => router.push('/history')}
                  className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors"
                >
                  <ClockIcon className="w-5 h-5" />
                  <span>View History</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('trends')}
                  className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span>View Trends</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emotion Trends Section */}
        {activeSection === 'trends' && analytics && (
          <EmotionTrendsChart
            data={{
              dailyTrends: analytics.dailyTrends || [],
              emotionDistribution: analytics.emotionDistribution || {},
              weeklyData: analytics.weeklyData || []
            }}
            loading={loading}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}

        {/* Weekly Analytics Section */}
        {activeSection === 'weekly' && analytics && (
          <WeeklyAnalyticsChart
            data={{
              weeklyData: analytics.weeklyData || [],
              sentimentAnalysis: analytics.sentimentAnalysis || { positive: 0, negative: 0, neutral: 0 },
              activityPatterns: analytics.activityPatterns || {
                hourlyDistribution: [],
                dayOfWeekDistribution: [],
                peakActivityHour: 0,
                peakActivityDay: 'Monday'
              }
            }}
            loading={loading}
          />
        )}
      </div>
    </MainLayout>
  )
}