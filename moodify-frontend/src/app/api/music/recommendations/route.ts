import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { spotifyService } from "@/lib/spotify"
import { EmotionType } from "@/types"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
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
    // Check authentication using both NextAuth and JWT
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
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
          errors: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { emotion, confidence, limit, userPreferences } = validationResult.data

    // Get recommendations from Spotify
    const tracks = await spotifyService.getRecommendationsByEmotion(emotion, limit)

    // Save the recommendation to database for analytics
    try {
      await prisma.music_recommendations.create({
        data: {
          user_id: userId,
          emotion: emotion,
          track_id: tracks[0]?.id || 'fallback',
          track_name: tracks[0]?.name || 'Fallback Track',
          artist_name: tracks[0]?.artist || 'Unknown Artist',
          album_name: tracks[0]?.album || 'Unknown Album',
          track_url: tracks[0]?.spotifyUrl || '',
          image_url: tracks[0]?.imageUrl || '',
          duration_ms: tracks[0]?.duration ? tracks[0].duration * 1000 : 0,
          popularity: 50, // Default popularity
          audio_features: {
            emotion,
            confidence,
            tracksCount: tracks.length
          }
        }
      })

      // Update user statistics
      await prisma.user_statistics.upsert({
        where: { user_id: userId },
        update: {
          total_recommendations: { increment: 1 },
          last_activity: new Date(),
          calculated_at: new Date()
        },
        create: {
          user_id: userId,
          total_analyses: 0,
          total_recommendations: 1,
          last_activity: new Date()
        }
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue with response even if DB save fails
    }

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
    console.error("Music recommendation error:", error)
    return NextResponse.json(
      { message: "Failed to generate recommendations" },
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