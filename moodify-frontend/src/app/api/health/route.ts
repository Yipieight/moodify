import { NextResponse } from 'next/server'

/**
 * Health Check API Endpoint
 * Used by load balancers and monitoring systems to verify application health
 */
export async function GET() {
  try {
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        server: 'ok',
        memory: getMemoryUsage(),
        env: checkEnvironmentVariables()
      }
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}

function getMemoryUsage() {
  const usage = process.memoryUsage()
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
  }
}

function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SPOTIFY_CLIENT_ID'
  ]
  
  const missing = requiredEnvVars.filter(env => !process.env[env])
  
  return {
    status: missing.length === 0 ? 'ok' : 'missing_env_vars',
    missing: missing.length > 0 ? missing : undefined
  }
}