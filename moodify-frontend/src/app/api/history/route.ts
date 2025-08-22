import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory storage for development (replace with actual database in production)
interface HistoryEntry {
  id: string
  userId: string
  type: 'emotion' | 'recommendation'
  data: any
  createdAt: Date
}

// Simulated database
let historyStorage: HistoryEntry[] = []

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
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

    // Filter history by user and criteria
    let filteredHistory = historyStorage.filter(entry => entry.userId === session.user!.email)

    // Filter by type
    if (type && type !== 'all') {
      filteredHistory = filteredHistory.filter(entry => entry.type === type)
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate)
      filteredHistory = filteredHistory.filter(entry => entry.createdAt >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      filteredHistory = filteredHistory.filter(entry => entry.createdAt <= end)
    }

    // Sort by date (newest first)
    filteredHistory.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Pagination
    const total = filteredHistory.length
    const startIndex = (page - 1) * limit
    const paginatedHistory = filteredHistory.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      success: true,
      data: {
        history: paginatedHistory,
        pagination: {
          total,
          page,
          limit,
          hasMore: startIndex + limit < total,
          totalPages: Math.ceil(total / limit)
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
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Type and data are required' },
        { status: 400 }
      )
    }

    if (!['emotion', 'recommendation'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "emotion" or "recommendation"' },
        { status: 400 }
      )
    }

    // Create new history entry
    const historyEntry: HistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      type,
      data,
      createdAt: new Date()
    }

    // Save to storage
    historyStorage.push(historyEntry)

    return NextResponse.json({
      success: true,
      data: historyEntry,
      message: 'History entry saved successfully'
    })
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
    
    if (!session?.user?.email) {
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

    // Find and remove the entry
    const entryIndex = historyStorage.findIndex(
      entry => entry.id === entryId && entry.userId === session.user!.email
    )

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'History entry not found' },
        { status: 404 }
      )
    }

    historyStorage.splice(entryIndex, 1)

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