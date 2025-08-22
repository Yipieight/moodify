import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  bio: z.string().max(200).optional(),
  favoriteGenres: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // In a real application, you would fetch user profile from database
    // For now, return session data
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        // TODO: Add additional profile fields from database
        bio: "",
        favoriteGenres: [],
        joinDate: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = updateProfileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, email, bio, favoriteGenres } = validationResult.data

    // TODO: Implement actual profile update logic here
    // In a real implementation, you would:
    // 1. Update user in database
    // 2. Handle email changes (verification if needed)
    // 3. Update user preferences
    
    console.log("Profile update simulated:", {
      userId: session.user.id,
      name,
      email,
      bio,
      favoriteGenres,
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: session.user.id,
        name,
        email,
        image: session.user.image,
        bio,
        favoriteGenres,
      }
    })

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}