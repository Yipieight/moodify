/**
 * Test utilities and helper functions
 * Provides common testing patterns and helpers for integration tests
 */

import { NextRequest } from 'next/server'
import { localStorageMock } from '../mocks/storage'

/**
 * Create a mock Next.js request object
 */
export const createMockRequest = (options: {
  method?: string
  url?: string
  body?: any
  headers?: Record<string, string>
  searchParams?: Record<string, string>
}): NextRequest => {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body,
    headers = {},
    searchParams = {},
  } = options

  // Build URL with search params
  const urlObj = new URL(url)
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  // Create request init options
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  // Add body if provided and method allows it
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  return new NextRequest(urlObj.toString(), requestInit)
}

/**
 * Parse response and extract data
 */
export const parseResponse = async (response: Response) => {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Wait for a condition to be true
 */
export const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const result = await Promise.resolve(condition())
    if (result) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`)
}

/**
 * Setup test environment
 */
export const setupTestEnvironment = () => {
  // Clear all storage
  localStorageMock.clear()

  // Reset all mocks
  jest.clearAllMocks()

  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
}

/**
 * Cleanup test environment
 */
export const cleanupTestEnvironment = () => {
  localStorageMock.clear()
  jest.restoreAllMocks()
}

/**
 * Generate random ID for testing
 */
export const generateTestId = (prefix = 'test'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Create a delay promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Assert response status
 */
export const assertResponseStatus = (response: Response, expectedStatus: number) => {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, but got ${response.status}`
    )
  }
}

/**
 * Assert response has property
 */
export const assertResponseHasProperty = (data: any, property: string) => {
  if (!(property in data)) {
    throw new Error(`Response missing expected property: ${property}`)
  }
}

/**
 * Mock console methods to suppress logs during tests
 */
export const suppressConsole = () => {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  }

  console.log = jest.fn()
  console.error = jest.fn()
  console.warn = jest.fn()
  console.info = jest.fn()

  return () => {
    console.log = originalConsole.log
    console.error = originalConsole.error
    console.warn = originalConsole.warn
    console.info = originalConsole.info
  }
}

/**
 * Create a mock file object for upload testing
 */
export const createMockFile = (
  name = 'test.jpg',
  type = 'image/jpeg',
  size = 1024
): File => {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const minLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return minLength && hasUppercase && hasLowercase && hasNumber
}

/**
 * Create test data with timestamps
 */
export const createTimestampedData = <T extends object>(data: T) => {
  return {
    ...data,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Compare objects ignoring specific fields
 */
export const compareObjectsIgnoring = (
  obj1: any,
  obj2: any,
  ignoreFields: string[] = ['timestamp', 'createdAt', 'updatedAt', 'id']
): boolean => {
  const filtered1 = Object.entries(obj1)
    .filter(([key]) => !ignoreFields.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  const filtered2 = Object.entries(obj2)
    .filter(([key]) => !ignoreFields.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  return JSON.stringify(filtered1) === JSON.stringify(filtered2)
}

/**
 * Extract error message from response
 */
export const extractErrorMessage = async (response: Response): Promise<string> => {
  const data = await parseResponse(response)
  return data?.error?.message || data?.error || 'Unknown error'
}

/**
 * Create pagination parameters
 */
export const createPaginationParams = (page = 1, limit = 20) => {
  return {
    page: String(page),
    limit: String(limit),
  }
}

/**
 * Validate pagination response
 */
export const validatePaginationResponse = (data: any, expectedPage: number, expectedLimit: number) => {
  expect(data).toHaveProperty('pagination')
  expect(data.pagination).toHaveProperty('page', expectedPage)
  expect(data.pagination).toHaveProperty('limit', expectedLimit)
  expect(data.pagination).toHaveProperty('total')
  expect(data.pagination).toHaveProperty('totalPages')
  expect(data.pagination).toHaveProperty('hasMore')
}

/**
 * Create date range filter
 */
export const createDateRangeFilter = (daysBack: number) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  }
}

/**
 * Mock fetch responses
 */
export const mockFetch = (responses: Array<{ url: string; response: any }>) => {
  global.fetch = jest.fn((url: string | Request) => {
    const urlString = typeof url === 'string' ? url : url.url
    const mockResponse = responses.find((r) => urlString.includes(r.url))

    if (mockResponse) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockResponse.response,
        text: async () => JSON.stringify(mockResponse.response),
      } as Response)
    }

    return Promise.reject(new Error(`Unmocked fetch URL: ${urlString}`))
  }) as jest.Mock
}

/**
 * Reset fetch mock
 */
export const resetFetchMock = () => {
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockReset()
  }
}
