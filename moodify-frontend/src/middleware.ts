// Simple CORS and auth middleware
export function middleware(req) {
  // Handle CORS preflight (OPTIONS) requests immediately
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400', // 24 hours
      }
    });
  }

  // Check if it's a public route that doesn't need auth
  const { pathname } = req.nextUrl;
  const publicRoutes = ['/', '/api/health', '/auth/login', '/auth/register', '/api/auth/login'];
  
  if (publicRoutes.includes(pathname)) {
    // For public routes, allow through
    return undefined;
  }

  // For protected routes, no need to enforce auth here since each API route handles it
  // This allows both NextAuth sessions and JWT tokens to work
  return undefined;
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