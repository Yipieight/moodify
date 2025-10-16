/**
 * @jest-environment node
 * 
 * Integration tests for Health Check API
 * Tests system health monitoring and dependency validation
 */

import { GET } from '@/app/api/health/route'
import { createMockRequest, parseResponse } from '../utils/testHelpers'

describe('/api/health Integration Tests', () => {
  beforeEach(() => {
    // Set required environment variables for tests
    process.env.NEXTAUTH_SECRET = 'test-secret-key'
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID = 'test-spotify-client-id'
    process.env.NODE_ENV = 'test'
  })

  describe('GET /api/health', () => {
    it('should return healthy status when all systems operational', async () => {
      const req = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/health',
      })

      const response = await GET()
      const data = await parseResponse(response)

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('status', 'healthy')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('uptime')
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('environment')
      expect(data).toHaveProperty('checks')
    })

    it('should include server check status', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.checks).toHaveProperty('server', 'ok')
    })

    it('should include memory usage information', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.checks).toHaveProperty('memory')
      expect(data.checks.memory).toHaveProperty('rss')
      expect(data.checks.memory).toHaveProperty('heapTotal')
      expect(data.checks.memory).toHaveProperty('heapUsed')
      expect(data.checks.memory).toHaveProperty('external')
      
      // All memory values should be numbers
      expect(typeof data.checks.memory.rss).toBe('number')
      expect(typeof data.checks.memory.heapTotal).toBe('number')
      expect(typeof data.checks.memory.heapUsed).toBe('number')
      expect(typeof data.checks.memory.external).toBe('number')
    })

    it('should include environment variable check', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.checks).toHaveProperty('env')
      expect(data.checks.env).toHaveProperty('status')
    })

    it('should report ok when all required environment variables present', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.checks.env.status).toBe('ok')
      expect(data.checks.env.missing).toBeUndefined()
    })

    it('should report missing environment variables', async () => {
      // Remove required env var
      const original = process.env.NEXTAUTH_SECRET
      delete process.env.NEXTAUTH_SECRET

      const response = await GET()
      const data = await parseResponse(response)

      expect(data.checks.env.status).toBe('missing_env_vars')
      expect(data.checks.env.missing).toBeDefined()
      expect(data.checks.env.missing).toContain('NEXTAUTH_SECRET')

      // Restore
      process.env.NEXTAUTH_SECRET = original
    })

    it('should include timestamp in ISO format', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.timestamp).toBeDefined()
      expect(() => new Date(data.timestamp)).not.toThrow()
      
      const timestamp = new Date(data.timestamp)
      expect(timestamp.toISOString()).toBe(data.timestamp)
    })

    it('should include uptime value', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.uptime).toBeDefined()
      expect(typeof data.uptime).toBe('number')
      expect(data.uptime).toBeGreaterThanOrEqual(0)
    })

    it('should include version information', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.version).toBeDefined()
      expect(typeof data.version).toBe('string')
    })

    it('should include environment information', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.environment).toBeDefined()
      expect(data.environment).toBe('test')
    })

    it('should return consistent structure across multiple calls', async () => {
      const response1 = await GET()
      const data1 = await parseResponse(response1)

      const response2 = await GET()
      const data2 = await parseResponse(response2)

      // Both should have same structure
      expect(Object.keys(data1).sort()).toEqual(Object.keys(data2).sort())
      expect(Object.keys(data1.checks).sort()).toEqual(Object.keys(data2.checks).sort())
    })

    it('should handle JSON response format', async () => {
      const response = await GET()

      expect(response.headers.get('content-type')).toContain('application/json')
    })
  })

  describe('Error Handling', () => {
    it('should return unhealthy status on internal error', async () => {
      // Mock process.uptime to throw error
      const originalUptime = process.uptime
      process.uptime = jest.fn(() => {
        throw new Error('System error')
      })

      const response = await GET()
      const data = await parseResponse(response)

      expect(response.status).toBe(503)
      expect(data).toHaveProperty('status', 'unhealthy')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('error')

      // Restore
      process.uptime = originalUptime
    })

    it('should include error message in unhealthy response', async () => {
      const originalUptime = process.uptime
      const errorMessage = 'Simulated system failure'
      process.uptime = jest.fn(() => {
        throw new Error(errorMessage)
      })

      const response = await GET()
      const data = await parseResponse(response)

      expect(data.error).toBe(errorMessage)

      // Restore
      process.uptime = originalUptime
    })
  })

  describe('Performance', () => {
    it('should respond quickly (under 100ms)', async () => {
      const startTime = Date.now()
      
      await GET()
      
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(100)
    })

    it('should handle concurrent health checks', async () => {
      const requests = Array(10).fill(null).map(() => GET())
      
      const responses = await Promise.all(requests)
      
      responses.forEach(async (response) => {
        expect(response.status).toBe(200)
        const data = await parseResponse(response)
        expect(data.status).toBe('healthy')
      })
    })
  })

  describe('Response Validation', () => {
    it('should have all required fields in healthy response', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      const requiredFields = ['status', 'timestamp', 'uptime', 'version', 'environment', 'checks']
      requiredFields.forEach(field => {
        expect(data).toHaveProperty(field)
      })
    })

    it('should have all required check types', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      const requiredChecks = ['server', 'memory', 'env']
      requiredChecks.forEach(check => {
        expect(data.checks).toHaveProperty(check)
      })
    })

    it('should validate memory values are positive numbers', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.checks.memory.rss).toBeGreaterThan(0)
      expect(data.checks.memory.heapTotal).toBeGreaterThan(0)
      expect(data.checks.memory.heapUsed).toBeGreaterThan(0)
      expect(data.checks.memory.external).toBeGreaterThanOrEqual(0)
    })

    it('should validate heap used is less than heap total', async () => {
      const response = await GET()
      const data = await parseResponse(response)

      expect(data.checks.memory.heapUsed).toBeLessThanOrEqual(data.checks.memory.heapTotal)
    })
  })
})
