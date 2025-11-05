/**
 * @jest-environment node
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Database Cascade Deletes', () => {
  let testUserId: string

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User'
      }
    })
    testUserId = user.id
  })

  afterAll(async () => {
    // Clean up - delete test user (will cascade delete all related data)
    await prisma.user.delete({
      where: { id: testUserId }
    }).catch(() => {
      // User might already be deleted in tests
    })
    
    await prisma.$disconnect()
  })

  it('should cascade delete music recommendations when user is deleted', async () => {
    // Create recommendation
    await prisma.music_recommendations.create({
      data: {
        user_id: testUserId,
        emotion: 'happy',
        track_id: '123',
        track_name: 'Test Song',
        artist_name: 'Test Artist'
      }
    })

    // Verify recommendation exists
    const recommendationsBefore = await prisma.music_recommendations.findMany({
      where: { user_id: testUserId }
    })
    expect(recommendationsBefore.length).toBeGreaterThan(0)

    // Delete user
    await prisma.user.delete({
      where: { id: testUserId }
    })

    // Verify recommendations are deleted
    const recommendationsAfter = await prisma.music_recommendations.findMany({
      where: { user_id: testUserId }
    })
    expect(recommendationsAfter).toHaveLength(0)

    // Recreate user for other tests
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User'
      }
    })
    testUserId = user.id
  })

  it('should cascade delete emotion analyses when user is deleted', async () => {
    // Create emotion analysis
    await prisma.emotion_analyses.create({
      data: {
        user_id: testUserId,
        emotion: 'happy',
        confidence: 0.95
      }
    })

    // Verify emotion analysis exists
    const analysesBefore = await prisma.emotion_analyses.findMany({
      where: { user_id: testUserId }
    })
    expect(analysesBefore.length).toBeGreaterThan(0)

    // Delete user
    await prisma.user.delete({
      where: { id: testUserId }
    })

    // Verify analyses are deleted
    const analysesAfter = await prisma.emotion_analyses.findMany({
      where: { user_id: testUserId }
    })
    expect(analysesAfter).toHaveLength(0)

    // Recreate user for other tests
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User'
      }
    })
    testUserId = user.id
  })

  it('should cascade delete sessions when user is deleted', async () => {
    // Create session
    await prisma.session.create({
      data: {
        userId: testUserId,
        sessionToken: `session-${Date.now()}`,
        expires: new Date(Date.now() + 86400000) // 1 day from now
      }
    })

    // Verify session exists
    const sessionsBefore = await prisma.session.findMany({
      where: { userId: testUserId }
    })
    expect(sessionsBefore.length).toBeGreaterThan(0)

    // Delete user
    await prisma.user.delete({
      where: { id: testUserId }
    })

    // Verify sessions are deleted
    const sessionsAfter = await prisma.session.findMany({
      where: { userId: testUserId }
    })
    expect(sessionsAfter).toHaveLength(0)
  })
})

