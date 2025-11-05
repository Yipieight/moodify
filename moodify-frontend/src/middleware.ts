import { NextResponse, NextRequest } from 'next/server';

// Enhanced CORS and auth middleware
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Handle CORS preflight (OPTIONS) requests immediately
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
        'Access-Control-Max-Age': '86400', // 24 hours
      }
    });
  }

  // Set CORS headers for all requests
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Check if it's a public API route
  const publicApiRoutes = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register'
  ];
  
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicApiRoute) {
    // For public API routes, allow through with CORS headers
    return response;
  }

  // For protected routes, no need to enforce auth here since each API route handles it
  // This allows both NextAuth sessions and JWT tokens to work
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}