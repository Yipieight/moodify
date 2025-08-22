import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = validationResult.data

    // TODO: Implement actual user registration logic here
    // For now, we'll simulate a successful registration
    
    // In a real implementation, you would:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Save user to database
    // 4. Send verification email (optional)
    
    // Simulate checking if user exists
    if (email === "test@example.com") {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Simulate successful registration
    console.log("User registration simulated:", { name, email })

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: {
          id: "temp-id-" + Date.now(),
          name,
          email,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}