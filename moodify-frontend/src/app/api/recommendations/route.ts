import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { spotifyService } from "@/lib/spotify"
import { EmotionType } from "@/types"
import { z } from "zod"

const recommendationSchema = z.object({
  emotion: z.enum(['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']),
  confidence: z.number().min(0).max(1).optional(),
  limit: z.number().min(1).max(50).optional().default(20),
  userPreferences: z.object({
    genres: z.array(z.string()).optional(),
    excludeExplicit: z.boolean().optional().default(false)
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = recommendationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Invalid input data", 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { emotion, confidence, limit, userPreferences } = validationResult.data

    // Get recommendations from Spotify
    const tracks = await spotifyService.getRecommendationsByEmotion(emotion, limit)

    // TODO: Save recommendation to user history
    // This would normally save to database
    console.log("Generated recommendation:", {
      userId: session.user.id,
      emotion,
      confidence,
      trackCount: tracks.length,
      timestamp: new Date()
    })

    return NextResponse.json({
      success: true,
      data: {
        emotion,
        confidence,
        tracks,
        generatedAt: new Date().toISOString(),
        totalTracks: tracks.length
      }
    })

  } catch (error) {
    console.error("Recommendation generation error:", error)
    
    // Return fallback recommendations in case of Spotify API errors
    if (error instanceof Error && error.message.includes('Spotify')) {
      return NextResponse.json({
        success: true,
        data: {
          emotion: 'neutral',
          confidence: 0.5,
          tracks: [],
          generatedAt: new Date().toISOString(),
          totalTracks: 0,
          fallback: true,
          message: "Using fallback recommendations due to service unavailability"
        }
      })
    }

    return NextResponse.json(
      { message: "Failed to generate recommendations" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const emotion = searchParams.get('emotion') as EmotionType
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!emotion || !['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust'].includes(emotion)) {
      return NextResponse.json(
        { message: "Valid emotion parameter required" },
        { status: 400 }
      )
    }

    // Get recommendations from Spotify
    const tracks = await spotifyService.getRecommendationsByEmotion(emotion, limit)

    return NextResponse.json({
      success: true,
      data: {
        emotion,
        tracks,
        generatedAt: new Date().toISOString(),
        totalTracks: tracks.length
      }
    })

  } catch (error) {
    console.error("Recommendation fetch error:", error)
    return NextResponse.json(
      { message: "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
}