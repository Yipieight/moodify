import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { spotifyService } from "@/lib/spotify"
import { z } from "zod"

const searchSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(50).optional().default(20)
})

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
    const query = searchParams.get('q') || searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate input
    const validationResult = searchSchema.safeParse({ query, limit })
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Invalid search parameters", 
          errors: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { query: validQuery, limit: validLimit } = validationResult.data

    // Search tracks using Spotify
    const tracks = await spotifyService.searchTracks(validQuery, validLimit)

    return NextResponse.json({
      success: true,
      data: {
        query: validQuery,
        tracks,
        totalTracks: tracks.length,
        searchedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("Music search error:", error)
    return NextResponse.json(
      { message: "Failed to search tracks" },
      { status: 500 }
    )
  }
}