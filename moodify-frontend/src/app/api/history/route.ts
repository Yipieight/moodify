import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'emotion' | 'recommendation' | 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions: any = {
      user_id: session.user.id
    }

    if (startDate && endDate) {
      whereConditions.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      whereConditions.created_at = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      whereConditions.created_at = {
        lte: new Date(endDate)
      }
    }

    let historyData: any[] = []
    let totalCount = 0

    if (type === 'emotion' || !type || type === 'all') {
      const emotionAnalyses = await prisma.emotion_analyses.findMany({
        where: whereConditions,
        orderBy: { created_at: 'desc' },
        take: type === 'emotion' ? limit : undefined,
        skip: type === 'emotion' ? offset : undefined
      })

      const emotionHistory = emotionAnalyses.map(analysis => ({
        id: analysis.id,
        type: 'emotion',
        data: {
          emotion: analysis.emotion,
          confidence: parseFloat(analysis.confidence.toString()),
          timestamp: analysis.created_at?.toISOString()
        },
        createdAt: analysis.created_at
      }))

      historyData = [...historyData, ...emotionHistory]

      if (type === 'emotion') {
        totalCount = await prisma.emotion_analyses.count({ where: whereConditions })
      }
    }

    if (type === 'recommendation' || !type || type === 'all') {
      const recommendations = await prisma.music_recommendations.findMany({
        where: whereConditions,
        orderBy: { created_at: 'desc' },
        take: type === 'recommendation' ? limit : undefined,
        skip: type === 'recommendation' ? offset : undefined
      })

      const recommendationHistory = recommendations.map(rec => {
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

      historyData = [...historyData, ...recommendationHistory]

      if (type === 'recommendation') {
        totalCount = await prisma.music_recommendations.count({ where: whereConditions })
      }
    }

    if (!type || type === 'all') {
      // Sort by creation date and apply pagination
      historyData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      totalCount = historyData.length
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
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
          user_id: session.user.id,
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
          user_id: session.user.id,
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
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
        user_id: session.user.id
      }
    })

    // If not found in emotions, try music_recommendations
    if (deletedEmotion.count === 0) {
      const deletedRecommendation = await prisma.music_recommendations.deleteMany({
        where: {
          id: entryId,
          user_id: session.user.id
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