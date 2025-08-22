import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { spotifyService } from "@/lib/spotify"

export async function GET(
  request: NextRequest,
  { params }: { params: { trackId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { trackId } = params

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