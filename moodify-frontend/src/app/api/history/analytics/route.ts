import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EmotionType } from '@/types'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'

// Function to verify JWT token
async function verifyJWTToken(token: string) {
  const secret = process.env.JWT_SECRET || 'moodify-test-secret'
  try {
    const decoded = verify(token, secret) as { 
      userId: string, 
      email: string, 
      name: string,
      iat: number,
      exp: number,
      aud: string,
      iss: string
    }
    return decoded
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

// Function to get user ID from request - supports both NextAuth and JWT
async function getUserIdFromRequest(request: NextRequest) {
  // First try NextAuth session (cookies)
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return session.user.id
  }
  
  // If no NextAuth session, try JWT from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7) // Remove "Bearer " prefix
    const decoded = await verifyJWTToken(token)
    if (decoded) {
      return decoded.userId
    }
  }
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30' // days

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(timeRange))

    // Get emotion analyses from database
    const emotionEntries = await prisma.emotion_analyses.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Get music recommendations from database
    const recommendationEntries = await prisma.music_recommendations.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Get user statistics (automatically maintained by database triggers)
    const userStats = await prisma.user_statistics.findUnique({
      where: { user_id: userId }
    })

    // Calculate analytics
    const analytics = {
      totalAnalyses: userStats?.total_analyses || emotionEntries.length,
      totalRecommendations: userStats?.total_recommendations || recommendationEntries.length,
      averageAnalysesPerDay: emotionEntries.length / parseInt(timeRange),
      
      // Emotion distribution
      emotionDistribution: calculateEmotionDistribution(emotionEntries),
      
      // Most common emotion
      mostCommonEmotion: getMostCommonEmotion(emotionEntries),
      
      // Positive vs Negative sentiment
      sentimentAnalysis: calculateSentimentAnalysis(emotionEntries),
      
      // Weekly breakdown
      weeklyData: calculateWeeklyData(emotionEntries, parseInt(timeRange)),
      
      // Daily trends
      dailyTrends: calculateDailyTrends(emotionEntries, parseInt(timeRange)),
      
      // Music preferences by emotion
      musicPreferences: calculateMusicPreferences(recommendationEntries),
      
      // Activity patterns
      activityPatterns: calculateActivityPatterns([...emotionEntries, ...recommendationEntries])
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

function calculateEmotionDistribution(emotionEntries: any[]): Record<EmotionType, number> {
  const distribution: Record<EmotionType, number> = {
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    neutral: 0,
    fear: 0,
    disgust: 0
  }

  emotionEntries.forEach(entry => {
    if (entry.emotion) {
      distribution[entry.emotion as EmotionType]++
    }
  })

  return distribution
}

function getMostCommonEmotion(emotionEntries: any[]): EmotionType {
  const distribution = calculateEmotionDistribution(emotionEntries)
  let maxCount = 0
  let mostCommon: EmotionType = 'neutral'

  Object.entries(distribution).forEach(([emotion, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostCommon = emotion as EmotionType
    }
  })

  return mostCommon
}

function calculateSentimentAnalysis(emotionEntries: any[]): {
  positive: number
  negative: number
  neutral: number
} {
  const positiveEmotions = ['happy', 'surprised']
  const negativeEmotions = ['sad', 'angry', 'fear', 'disgust']
  
  let positive = 0
  let negative = 0
  let neutral = 0

  emotionEntries.forEach(entry => {
    const emotion = entry.emotion
    if (positiveEmotions.includes(emotion)) {
      positive++
    } else if (negativeEmotions.includes(emotion)) {
      negative++
    } else {
      neutral++
    }
  })

  const total = emotionEntries.length || 1
  return {
    positive: Math.round((positive / total) * 100),
    negative: Math.round((negative / total) * 100),
    neutral: Math.round((neutral / total) * 100)
  }
}

function calculateWeeklyData(emotionEntries: any[], timeRange: number): Array<{
  week: string
  count: number
  emotions: Record<EmotionType, number>
}> {
  const weeks: { [key: string]: { count: number, emotions: Record<EmotionType, number> } } = {}
  
  emotionEntries.forEach(entry => {
    // Ensure we have a valid date
    if (!entry.created_at) return
    
    const date = new Date(entry.created_at)
    // Check if date is valid
    if (isNaN(date.getTime())) return
    
    const weekStart = getWeekStart(date)
    // Check if weekStart is valid
    if (isNaN(weekStart.getTime())) return
    
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        count: 0,
        emotions: {
          happy: 0, sad: 0, angry: 0, surprised: 0,
          neutral: 0, fear: 0, disgust: 0
        }
      }
    }
    
    weeks[weekKey].count++
    if (entry.emotion) {
      weeks[weekKey].emotions[entry.emotion as EmotionType]++
    }
  })

  return Object.entries(weeks).map(([week, data]) => ({
    week,
    count: data.count,
    emotions: data.emotions
  }))
}

function calculateDailyTrends(emotionEntries: any[], timeRange: number): Array<{
  date: string
  count: number
  primaryEmotion: EmotionType
}> {
  const days: { [key: string]: { count: number, emotions: Record<EmotionType, number> } } = {}
  
  emotionEntries.forEach(entry => {
    // Ensure we have a valid date
    if (!entry.created_at) return
    
    const date = new Date(entry.created_at)
    // Check if date is valid
    if (isNaN(date.getTime())) return
    
    const dateKey = date.toISOString().split('T')[0]
    
    if (!days[dateKey]) {
      days[dateKey] = {
        count: 0,
        emotions: {
          happy: 0, sad: 0, angry: 0, surprised: 0,
          neutral: 0, fear: 0, disgust: 0
        }
      }
    }
    
    days[dateKey].count++
    if (entry.emotion) {
      days[dateKey].emotions[entry.emotion as EmotionType]++
    }
  })

  return Object.entries(days).map(([date, data]) => {
    // Find primary emotion for the day
    let primaryEmotion: EmotionType = 'neutral'
    let maxCount = 0
    
    Object.entries(data.emotions).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count
        primaryEmotion = emotion as EmotionType
      }
    })

    return {
      date,
      count: data.count,
      primaryEmotion
    }
  })
}

function calculateMusicPreferences(recommendationEntries: any[]): {
  genresByEmotion: Record<EmotionType, string[]>
  popularTracks: Array<{ name: string, artist: string, playCount: number }>
} {
  const genresByEmotion: Record<EmotionType, string[]> = {
    happy: [], sad: [], angry: [], surprised: [], neutral: [], fear: [], disgust: []
  }
  
  const trackPlayCount: { [key: string]: { name: string, artist: string, count: number } } = {}

  recommendationEntries.forEach(entry => {
    if (entry.data?.emotion && entry.data?.tracks) {
      entry.data.tracks.forEach((track: any) => {
        const trackKey = `${track.name}-${track.artist}`
        if (!trackPlayCount[trackKey]) {
          trackPlayCount[trackKey] = {
            name: track.name,
            artist: track.artist,
            count: 0
          }
        }
        trackPlayCount[trackKey].count++
      })
    }
  })

  const popularTracks = Object.values(trackPlayCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(track => ({
      name: track.name,
      artist: track.artist,
      playCount: track.count
    }))

  return {
    genresByEmotion,
    popularTracks
  }
}

function calculateActivityPatterns(allEntries: any[]): {
  hourlyDistribution: number[]
  dayOfWeekDistribution: number[]
  peakActivityHour: number
  peakActivityDay: string
} {
  const hourlyDistribution = new Array(24).fill(0)
  const dayOfWeekDistribution = new Array(7).fill(0)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  allEntries.forEach(entry => {
    // Ensure we have a valid date
    if (!entry.created_at) return
    
    const date = new Date(entry.created_at)
    // Check if date is valid
    if (isNaN(date.getTime())) return
    
    const hour = date.getHours()
    const dayOfWeek = date.getDay()
    
    hourlyDistribution[hour]++
    dayOfWeekDistribution[dayOfWeek]++
  })

  const peakActivityHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution))
  const peakActivityDayIndex = dayOfWeekDistribution.indexOf(Math.max(...dayOfWeekDistribution))
  const peakActivityDay = dayNames[peakActivityDayIndex]

  return {
    hourlyDistribution,
    dayOfWeekDistribution,
    peakActivityHour,
    peakActivityDay
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}