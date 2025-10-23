import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * 
 * Public health check endpoint for monitoring and load balancers
 * Returns system status without authentication
 */
export async function GET() {
  try {
    // Basic system health check
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        server: 'ok',
        // Add more specific checks here as needed
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024), // MB
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
        }
      }
    };

    return NextResponse.json(healthCheck, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

/**
 * OPTIONS /api/health
 * 
 * Handle CORS preflight requests for health endpoint
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    }
  });
}