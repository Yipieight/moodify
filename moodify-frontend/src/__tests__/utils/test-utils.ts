/**
 * Test utilities for integration tests
 * Provides helper functions and mock setup for testing API routes
 */

import { NextRequest } from 'next/server';
import { jest } from '@jest/globals';

// Create a mock NextRequest object for testing
export function createMockNextRequest({
  method = 'GET',
  url = 'http://localhost:3000/api/test',
  body = null,
  headers = new Headers(),
  searchParams = new URLSearchParams(),
}: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Headers;
  searchParams?: URLSearchParams;
} = {}): NextRequest {
  const requestUrl = new URL(url);
  
  return {
    url: requestUrl.toString(),
    headers,
    json: async () => body || {},
    text: async () => body ? JSON.stringify(body) : '{}',
    formData: async () => new FormData(),
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    clone: function() { return this; },
    body: body ? JSON.stringify(body) : null,
    method,
    signal: new AbortController().signal,
    nextUrl: requestUrl,
    geo: { city: 'Test City', country: 'Test Country', region: 'Test Region' },
    ip: '127.0.0.1',
    ua: 'test-agent',
    cookies: { get: () => ({ value: 'test-cookie' }) },
    searchParams,
    userAgent: () => ({ isBot: false, type: 'browser' }),
  } as unknown as NextRequest;
}

// Mock authentication session for tests
export function mockAuthSession(user?: { id: string; email: string; name: string } | null) {
  const { getServerSession } = require('next-auth/next');
  if (user) {
    (getServerSession as jest.Mock).mockResolvedValue({ user });
  } else {
    (getServerSession as jest.Mock).mockResolvedValue(null);
  }
}

// Mock Spotify service for tests
export function mockSpotifyService(tracks?: any[], shouldFail = false) {
  const { spotifyService } = require('@/lib/spotify');
  if (shouldFail) {
    (spotifyService.getRecommendationsByEmotion as jest.Mock).mockRejectedValue(
      new Error('Spotify API unavailable')
    );
  } else {
    (spotifyService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue(
      tracks || [
        {
          id: 'track-1',
          name: 'Test Track 1',
          artists: [{ name: 'Test Artist 1' }],
          album: { name: 'Test Album', images: [{ url: 'http://example.com/image.jpg' }] },
          external_urls: { spotify: 'https://spotify.com/track-1' }
        }
      ]
    );
  }
}

// Clean up mocks after each test
export function cleanupMocks() {
  jest.clearAllMocks();
}