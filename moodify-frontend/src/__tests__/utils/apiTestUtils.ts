/**
 * API test utilities specifically for integration testing
 */

import supertest, { Test, SuperTest } from 'supertest'
import { NextApiHandler } from 'next'

/**
 * Create supertest instance for API route testing
 */
export const createApiTest = (handler: any): SuperTest<Test> => {
  // Create a minimal Express-like app wrapper for the Next.js API route
  const app = (req: any, res: any) => {
    return handler(req, res)
  }

  return supertest(app)
}

/**
 * Test API endpoint with Supertest
 */
export const testApiEndpoint = async (options: {
  handler: any
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  path?: string
  body?: any
  query?: Record<string, string>
  headers?: Record<string, string>
  expectedStatus?: number
}) => {
  const {
    handler,
    method,
    path = '/',
    body,
    query,
    headers = {},
    expectedStatus,
  } = options

  const request = createApiTest(handler)[method](path)

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    request.set(key, value)
  })

  // Add query parameters
  if (query) {
    request.query(query)
  }

  // Add body for POST/PUT/PATCH
  if (body && ['post', 'put', 'patch'].includes(method)) {
    request.send(body)
  }

  const response = await request

  // Assert expected status if provided
  if (expectedStatus !== undefined) {
    expect(response.status).toBe(expectedStatus)
  }

  return response
}

/**
 * Test GET endpoint
 */
export const testGetEndpoint = async (
  handler: any,
  query?: Record<string, string>,
  expectedStatus = 200
) => {
  return testApiEndpoint({
    handler,
    method: 'get',
    query,
    expectedStatus,
  })
}

/**
 * Test POST endpoint
 */
export const testPostEndpoint = async (
  handler: any,
  body: any,
  expectedStatus = 201
) => {
  return testApiEndpoint({
    handler,
    method: 'post',
    body,
    expectedStatus,
  })
}

/**
 * Test DELETE endpoint
 */
export const testDeleteEndpoint = async (
  handler: any,
  query?: Record<string, string>,
  expectedStatus = 200
) => {
  return testApiEndpoint({
    handler,
    method: 'delete',
    query,
    expectedStatus,
  })
}

/**
 * Test PUT endpoint
 */
export const testPutEndpoint = async (
  handler: any,
  body: any,
  expectedStatus = 200
) => {
  return testApiEndpoint({
    handler,
    method: 'put',
    body,
    expectedStatus,
  })
}

/**
 * Validate API error response structure
 */
export const validateErrorResponse = (response: any) => {
  expect(response.body).toHaveProperty('error')
  expect(typeof response.body.error).toBe('string')
}

/**
 * Validate API success response structure
 */
export const validateSuccessResponse = (response: any, requiredFields: string[] = []) => {
  expect(response.status).toBeGreaterThanOrEqual(200)
  expect(response.status).toBeLessThan(300)

  requiredFields.forEach((field) => {
    expect(response.body).toHaveProperty(field)
  })
}

/**
 * Common test assertions for API responses
 */
export const apiAssertions = {
  /**
   * Assert response is JSON
   */
  isJson: (response: any) => {
    expect(response.headers['content-type']).toMatch(/application\/json/)
  },

  /**
   * Assert response has CORS headers
   */
  hasCorsHeaders: (response: any) => {
    expect(response.headers).toHaveProperty('access-control-allow-origin')
  },

  /**
   * Assert response has specific status code
   */
  hasStatus: (response: any, status: number) => {
    expect(response.status).toBe(status)
  },

  /**
   * Assert response has error
   */
  hasError: (response: any) => {
    expect(response.body).toHaveProperty('error')
  },

  /**
   * Assert response has success message
   */
  hasSuccess: (response: any) => {
    expect(response.status).toBeGreaterThanOrEqual(200)
    expect(response.status).toBeLessThan(300)
  },

  /**
   * Assert response has pagination
   */
  hasPagination: (response: any) => {
    expect(response.body).toHaveProperty('pagination')
    expect(response.body.pagination).toHaveProperty('page')
    expect(response.body.pagination).toHaveProperty('limit')
    expect(response.body.pagination).toHaveProperty('total')
    expect(response.body.pagination).toHaveProperty('totalPages')
    expect(response.body.pagination).toHaveProperty('hasMore')
  },
}

/**
 * Batch test multiple scenarios
 */
export const testScenarios = async (
  scenarios: Array<{
    name: string
    handler: any
    method: 'get' | 'post' | 'put' | 'delete'
    body?: any
    query?: Record<string, string>
    expectedStatus: number
    validate?: (response: any) => void
  }>
) => {
  for (const scenario of scenarios) {
    const { name, handler, method, body, query, expectedStatus, validate } = scenario

    const response = await testApiEndpoint({
      handler,
      method,
      body,
      query,
      expectedStatus,
    })

    if (validate) {
      validate(response)
    }
  }
}
