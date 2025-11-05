import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
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

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  bio: z.string().max(200).optional(),
  favoriteGenres: z.array(z.string()).optional(),
})

// Simple rate limiting by just checking request time - very basic implementation
const rateLimitStore = new Map<string, number>()

function checkRateLimit(key: string, windowMs: number = 3600000): boolean { // 1 hour
  const now = Date.now()
  const lastRequest = rateLimitStore.get(key)
  
  if (!lastRequest || now - lastRequest > windowMs) {
    rateLimitStore.set(key, now)
    return true
  }
  
  return false
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // TODO: Add additional profile fields from database
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: "", // This would come from user preferences
        favoriteGenres: [], // This would come from user preferences
        joinDate: user.createdAt?.toISOString() || new Date().toISOString(),
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
    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
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
        { message: "Invalid input data", errors: validationResult.error.issues },
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
      userId,
      name,
      email,
      bio,
      favoriteGenres,
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: userId,
        name,
        email,
        image: null, // This would come from user record
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

/**
 * DELETE /api/user/profile
 * 
 * Permanently delete user account and all associated data
 * Requires password confirmation for security
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Basic rate limiting - 1 per hour per user
    if (!checkRateLimit(`delete_${userId}`)) {
      return NextResponse.json(
        { message: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { confirmPassword, confirmEmail } = body

    if (!confirmPassword || !confirmEmail) {
      return NextResponse.json(
        { message: "Password and email confirmation required" },
        { status: 400 }
      )
    }

    // Get client information 
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Fetch user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verify email confirmation matches
    if (user.email !== confirmEmail) {
      return NextResponse.json(
        { message: "El email de confirmación no coincide" },
        { status: 400 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      confirmPassword,
      user.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Contraseña incorrecta" },
        { status: 400 }
      )
    }

    // Simple audit logging (just console log for now)
    console.log('Account deletion:', { 
      userId, 
      email: user.email, 
      ipAddress,
      timestamp: new Date().toISOString()
    })

    // Perform cascade deletion in transaction
    await prisma.$transaction(async (tx) => {
      // Delete in correct order (foreign key constraints)
      await tx.emotion_analyses.deleteMany({
        where: { user_id: userId },
      })

      await tx.music_recommendations.deleteMany({
        where: { user_id: userId },
      })

      await tx.user_activity.deleteMany({
        where: { user_id: userId },
      })

      await tx.user_preferences.deleteMany({
        where: { user_id: userId },
      })

      await tx.user_statistics.deleteMany({
        where: { user_id: userId },
      })

      await tx.session.deleteMany({
        where: { userId },
      })

      await tx.account.deleteMany({
        where: { userId },
      })

      // Finally delete user record
      await tx.user.delete({
        where: { id: userId },
      })
    })

    // Note: In production, you might want to implement soft delete with a 30-day grace period
    // This is a hard delete for immediate removal

    return NextResponse.json({
      success: true,
      message: 'Cuenta eliminada permanentemente',
      deletionScheduled: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete account' },
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