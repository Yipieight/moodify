import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { verify } from 'jsonwebtoken'
import { EmotionType } from '@/types'

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

const historySchema = z.object({
  type: z.enum(['emotion', 'recommendation']),
  data: z.object({
    emotion: z.string(),
    confidence: z.number().optional(),
    allEmotions: z.record(z.string(), z.number()).optional(),
    tracks: z.array(z.any()).optional(),
    timestamp: z.string().optional()
  })
})

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
    const type = searchParams.get('type') // 'emotion' | 'recommendation' | 'all'
    const emotion = searchParams.get('emotion') as EmotionType | null
    const timeRange = searchParams.get('timeRange')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions: any = {
      user_id: userId
    }

    // Add emotion filter if provided
    if (emotion) {
      whereConditions.emotion = emotion
    }

    // Handle special time ranges first
    if (timeRange === '24hours') {
      // For last 24 hours, calculate from current time back 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
      whereConditions.created_at = {
        gte: twentyFourHoursAgo
      };
    } else if (startDate && endDate) {
      // Properly handle date range filtering by creating date objects from date strings
      // and ensuring we include the full day for end date
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      // Set end time to end of day (23:59:59) to include all records from that day
      endDateTime.setHours(23, 59, 59, 999);
      
      whereConditions.created_at = {
        gte: startDateTime,
        lte: endDateTime
      };
    } else if (startDate) {
      whereConditions.created_at = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      // For end date only, include the full day
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      whereConditions.created_at = {
        lte: endDateTime
      }
    }

    let totalCount = 0;
    let historyData: any[] = [];
    
    // Create separate where conditions for emotion analyses and music recommendations
    let emotionWhereConditions = { ...whereConditions }
    let recommendationWhereConditions = { ...whereConditions }
    
    // If emotion filter exists but no specific type, or specific type with emotion filter
    if (emotion) {
        if (!type || type === 'emotion') {
            emotionWhereConditions.emotion = emotion;
        }
        if (!type || type === 'recommendation') {
            recommendationWhereConditions.emotion = emotion;
        }
    }

    // Initialize separate arrays for each type of data
    let emotionHistoryData: any[] = [];
    let recommendationHistoryData: any[] = [];

    if (type === 'emotion' || !type || type === 'all') {
      const emotionAnalyses = await prisma.emotion_analyses.findMany({
        where: emotionWhereConditions,
        orderBy: { created_at: 'desc' },
        take: type === 'emotion' ? limit : undefined,
        skip: type === 'emotion' ? offset : undefined
      })

      emotionHistoryData = emotionAnalyses.map(analysis => ({
        id: analysis.id,
        type: 'emotion',
        data: {
          emotion: analysis.emotion,
          confidence: parseFloat(analysis.confidence.toString()),
          timestamp: analysis.created_at?.toISOString()
        },
        createdAt: analysis.created_at
      }))

      if (type === 'emotion') {
        // When filtering specifically for emotions, get the total count
        totalCount = await prisma.emotion_analyses.count({ where: emotionWhereConditions });
      }
    }

    if (type === 'recommendation' || !type || type === 'all') {
      const recommendations = await prisma.music_recommendations.findMany({
        where: recommendationWhereConditions,
        orderBy: { created_at: 'desc' },
        take: type === 'recommendation' ? limit : undefined,
        skip: type === 'recommendation' ? offset : undefined
      })

      recommendationHistoryData = recommendations.map(rec => {
        // Parse audio_features if it's a JSON string
        let audioFeatures = {}
        try {
          audioFeatures = typeof rec.audio_features === 'string' 
            ? JSON.parse(rec.audio_features) 
            : rec.audio_features || {}
        } catch (e) {
          console.warn('Failed to parse audio_features:', e)
        }

        const historyItem = {
          id: rec.id,
          type: 'recommendation',
          data: {
            emotion: rec.emotion,
            tracks: [{
              id: rec.track_id,
              name: rec.track_name,
              artist: rec.artist_name,
              album: rec.album_name,
              imageUrl: rec.image_url,
              spotifyUrl: rec.track_url,
              duration: rec.duration_ms ? Math.round(rec.duration_ms / 1000) : 0,
              popularity: rec.popularity || 50
            }],
            timestamp: rec.created_at?.toISOString()
          },
          createdAt: rec.created_at
        }
        
        return historyItem
      })

      if (type === 'recommendation') {
        // When filtering specifically for recommendations, get the total count
        totalCount = await prisma.music_recommendations.count({ where: recommendationWhereConditions });
      }
    }

    // Combine results based on the type filter
    if (type === 'emotion') {
      historyData = emotionHistoryData; // Only emotion results
    } else if (type === 'recommendation') {
      historyData = recommendationHistoryData; // Only recommendation results
    } else {
      // For type 'all' or undefined, combine both types
      historyData = [...emotionHistoryData, ...recommendationHistoryData];
      
      // If no type filter but there is an emotion filter, calculate combined total
      if (emotion) {
        const [emotionCount, recommendationCount] = await Promise.all([
          prisma.emotion_analyses.count({ where: emotionWhereConditions }),
          prisma.music_recommendations.count({ where: recommendationWhereConditions })
        ]);
        totalCount = emotionCount + recommendationCount;
      } else {
        // If no filters at all, get total from both tables
        const [emotionCount, recommendationCount] = await Promise.all([
          prisma.emotion_analyses.count({ where: { user_id: userId } }),
          prisma.music_recommendations.count({ where: { user_id: userId } })
        ]);
        totalCount = emotionCount + recommendationCount;
      }
    }

    if (!type || type === 'all') {
      // Sort by creation date and apply pagination
      historyData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      // If there's an emotion filter but no specific type, calculate total count from both tables
      if (emotion) {
        const [emotionCount, recommendationCount] = await Promise.all([
          prisma.emotion_analyses.count({ where: emotionWhereConditions }),
          prisma.music_recommendations.count({ where: recommendationWhereConditions })
        ]);
        totalCount = emotionCount + recommendationCount;
      } else {
        // Count from both tables when type is 'all' but no emotion filter
        const [emotionCount, recommendationCount] = await Promise.all([
          prisma.emotion_analyses.count({ where: { user_id: userId } }),
          prisma.music_recommendations.count({ where: { user_id: userId } })
        ]);
        totalCount = emotionCount + recommendationCount;
      }
      
      // Apply pagination to the sorted results
      historyData = historyData.slice(offset, offset + limit)
    }

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        history: historyData,
        pagination: {
          total: totalCount,
          page,
          limit,
          hasMore: page < totalPages,
          totalPages
        }
      }
    })
  } catch (error) {
    console.error('Error fetching user history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = historySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { type, data } = validationResult.data

    if (type === 'emotion') {
      // Save emotion analysis to database
      const emotionAnalysis = await prisma.emotion_analyses.create({
        data: {
          user_id: userId,
          emotion: data.emotion,
          confidence: data.confidence || 0.5,
          metadata: {
            allEmotions: data.allEmotions as any || {},
            timestamp: data.timestamp || new Date().toISOString()
          } as any
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: emotionAnalysis.id,
          type: 'emotion',
          data: {
            emotion: emotionAnalysis.emotion,
            confidence: parseFloat(emotionAnalysis.confidence.toString()),
            timestamp: emotionAnalysis.created_at?.toISOString()
          },
          createdAt: emotionAnalysis.created_at
        },
        message: 'Emotion analysis saved successfully'
      })
    } else if (type === 'recommendation') {
      // Save music recommendation to database
      if (!data.tracks || !Array.isArray(data.tracks) || data.tracks.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Tracks data is required for recommendations' },
          { status: 400 }
        )
      }

      const firstTrack = data.tracks[0]
      const recommendation = await prisma.music_recommendations.create({
        data: {
          user_id: userId,
          emotion: data.emotion,
          track_id: firstTrack.id || 'unknown',
          track_name: firstTrack.name || 'Unknown Track',
          artist_name: firstTrack.artist || 'Unknown Artist',
          album_name: firstTrack.album || 'Unknown Album',
          track_url: firstTrack.spotifyUrl || '',
          image_url: firstTrack.imageUrl || '',
          duration_ms: firstTrack.duration ? firstTrack.duration * 1000 : 0,
          popularity: firstTrack.popularity || 50,
          audio_features: {
            emotion: data.emotion,
            tracksCount: data.tracks.length,
            timestamp: data.timestamp || new Date().toISOString()
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: recommendation.id,
          type: 'recommendation',
          data: {
            emotion: recommendation.emotion,
            track: {
              id: recommendation.track_id,
              name: recommendation.track_name,
              artist: recommendation.artist_name,
              album: recommendation.album_name
            },
            timestamp: recommendation.created_at?.toISOString()
          },
          createdAt: recommendation.created_at
        },
        message: 'Recommendation saved successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type. Must be "emotion" or "recommendation"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error saving history entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save history entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    // Try to delete from emotion_analyses first
    const deletedEmotion = await prisma.emotion_analyses.deleteMany({
      where: {
        id: entryId,
        user_id: userId
      }
    })

    // If not found in emotions, try music_recommendations
    if (deletedEmotion.count === 0) {
      const deletedRecommendation = await prisma.music_recommendations.deleteMany({
        where: {
          id: entryId,
          user_id: userId
        }
      })

      if (deletedRecommendation.count === 0) {
        return NextResponse.json(
          { success: false, error: 'History entry not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'History entry deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting history entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete history entry' },
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