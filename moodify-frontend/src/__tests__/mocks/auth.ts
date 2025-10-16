/**
 * Mock implementation for NextAuth and authentication
 */

import { mockSession, mockSessionWithSpotify, validUser, userWithSpotify } from '../fixtures/users'

export class AuthMock {
  private currentSession: any = null
  private isAuthenticated = false

  /**
   * Set authenticated session
   */
  setAuthenticatedSession(withSpotify = false) {
    this.isAuthenticated = true
    this.currentSession = withSpotify ? mockSessionWithSpotify : mockSession
  }

  /**
   * Set unauthenticated state
   */
  setUnauthenticated() {
    this.isAuthenticated = false
    this.currentSession = null
  }

  /**
   * Get current session
   */
  getSession() {
    return this.currentSession
  }

  /**
   * Check if authenticated
   */
  isAuth() {
    return this.isAuthenticated
  }

  /**
   * Reset auth state
   */
  reset() {
    this.currentSession = null
    this.isAuthenticated = false
  }
}

export const authMock = new AuthMock()

/**
 * Mock NextAuth functions
 */
export const mockNextAuth = {
  getServerSession: jest.fn(async () => authMock.getSession()),
  signIn: jest.fn(async (provider: string, options?: any) => {
    if (provider === 'spotify') {
      authMock.setAuthenticatedSession(true)
      return { ok: true, error: null }
    }
    return { ok: true, error: null }
  }),
  signOut: jest.fn(async () => {
    authMock.reset()
    return { ok: true }
  }),
}

/**
 * Mock session hook
 */
export const mockUseSession = (authenticated = false, withSpotify = false) => {
  if (authenticated) {
    return {
      data: withSpotify ? mockSessionWithSpotify : mockSession,
      status: 'authenticated',
      update: jest.fn(),
    }
  }
  return {
    data: null,
    status: 'unauthenticated',
    update: jest.fn(),
  }
}

/**
 * Create mock request with session
 */
export const createMockRequestWithAuth = (authenticated = false, withSpotify = false) => {
  const session = authenticated ? (withSpotify ? mockSessionWithSpotify : mockSession) : null

  return {
    headers: new Headers({
      'content-type': 'application/json',
    }),
    cookies: {
      get: jest.fn((name: string) => {
        if (name === 'next-auth.session-token' && authenticated) {
          return { value: 'mock-session-token' }
        }
        return null
      }),
    },
    session,
  }
}

/**
 * Mock bcrypt functions
 */
export const mockBcrypt = {
  hash: jest.fn(async (password: string) => {
    return `$2a$10$mock_hashed_${password}`
  }),
  compare: jest.fn(async (password: string, hash: string) => {
    // Simple mock: return true if password matches the original
    if (password === validUser.password && hash === validUser.hashedPassword) {
      return true
    }
    if (password === userWithSpotify.password && hash === userWithSpotify.hashedPassword) {
      return true
    }
    return false
  }),
}

/**
 * Setup authentication mocks for tests
 */
export const setupAuthMocks = () => {
  jest.mock('next-auth', () => ({
    default: jest.fn(),
    getServerSession: mockNextAuth.getServerSession,
  }))

  jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => mockUseSession()),
    signIn: mockNextAuth.signIn,
    signOut: mockNextAuth.signOut,
    SessionProvider: ({ children }: any) => children,
  }))

  jest.mock('bcryptjs', () => mockBcrypt)
}
