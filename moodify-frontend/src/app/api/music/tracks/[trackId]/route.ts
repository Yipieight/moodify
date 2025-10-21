import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { spotifyService } from "@/lib/spotify"
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    let userId: string | undefined
    let userEmail: string | undefined
    
    // First try to get session from NextAuth (cookies)
    const session = await getServerSession(authOptions)
    
    // If NextAuth session exists, use it
    if (session?.user) {
      userId = session.user.id
      userEmail = session.user.email || undefined
    } else {
      // If no NextAuth session, try JWT from Authorization header
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7) // Remove "Bearer " prefix
        const decoded = await verifyJWTToken(token)
        
        if (decoded) {
          userId = decoded.userId
          userEmail = decoded.email
        }
      }
    }
    
    // If neither method worked, return unauthorized
    if (!userId || !userEmail) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const awaitedParams = await params;
    const { trackId } = awaitedParams

    if (!trackId) {
      return NextResponse.json(
        { message: "Track ID is required" },
        { status: 400 }
      )
    }

    // Get track details from Spotify
    const track = await spotifyService.getTrackDetails(trackId)

    if (!track) {
      return NextResponse.json(
        { message: "Track not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: track
    })

  } catch (error) {
    console.error("Track details error:", error)
    return NextResponse.json(
      { message: "Failed to get track details" },
      { status: 500 }
    )
  }
}