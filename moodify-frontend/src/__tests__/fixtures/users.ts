/**
 * User fixtures for testing authentication and user-related features
 */

export const validUser = {
  id: 'user_test_123',
  email: 'test@example.com',
  name: 'Test User',
  password: 'SecurePass123!',
  hashedPassword: '$2a$10$abcdefghijklmnopqrstuv', // Mock bcrypt hash
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

export const validUser2 = {
  id: 'user_test_456',
  email: 'user2@example.com',
  name: 'Second User',
  password: 'AnotherPass456!',
  hashedPassword: '$2a$10$zyxwvutsrqponmlkjihgfe',
  createdAt: '2025-01-02T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z',
}

export const userWithSpotify = {
  id: 'user_spotify_789',
  email: 'spotify@example.com',
  name: 'Spotify User',
  password: 'SpotifyPass789!',
  hashedPassword: '$2a$10$1234567890abcdefghijkl',
  spotifyConnected: true,
  spotifyAccessToken: 'spotify_access_token_mock',
  spotifyRefreshToken: 'spotify_refresh_token_mock',
  spotifyUsername: 'spotifyuser123',
  spotifyTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  createdAt: '2025-01-03T00:00:00.000Z',
  updatedAt: '2025-01-03T00:00:00.000Z',
}

export const invalidUsers = {
  invalidEmail: {
    email: 'invalid-email',
    name: 'Invalid Email User',
    password: 'ValidPass123!',
  },
  weakPassword: {
    email: 'weak@example.com',
    name: 'Weak Password User',
    password: 'weak',
  },
  missingName: {
    email: 'noname@example.com',
    password: 'ValidPass123!',
  },
  tooShortName: {
    email: 'short@example.com',
    name: 'A',
    password: 'ValidPass123!',
  },
  tooLongName: {
    email: 'long@example.com',
    name: 'A'.repeat(51),
    password: 'ValidPass123!',
  },
}

export const registrationData = {
  valid: {
    email: 'newuser@example.com',
    name: 'New User',
    password: 'NewPass123!',
  },
  duplicate: {
    email: validUser.email,
    name: 'Duplicate User',
    password: 'ValidPass123!',
  },
}

export const loginCredentials = {
  valid: {
    email: validUser.email,
    password: validUser.password,
  },
  invalidPassword: {
    email: validUser.email,
    password: 'WrongPassword123!',
  },
  nonExistentUser: {
    email: 'nonexistent@example.com',
    password: 'SomePass123!',
  },
  missingFields: {
    email: 'test@example.com',
    // Missing password
  },
}

export const userProfiles = {
  basic: {
    id: validUser.id,
    email: validUser.email,
    name: validUser.name,
    spotifyConnected: false,
    createdAt: validUser.createdAt,
    preferences: {
      theme: 'light',
      notifications: true,
      dataRetention: '90days',
    },
  },
  withSpotify: {
    id: userWithSpotify.id,
    email: userWithSpotify.email,
    name: userWithSpotify.name,
    spotifyConnected: true,
    spotifyUsername: userWithSpotify.spotifyUsername,
    createdAt: userWithSpotify.createdAt,
    preferences: {
      theme: 'dark',
      notifications: false,
      dataRetention: '1year',
      autoCreatePlaylists: true,
      playlistPrivacy: 'private',
    },
  },
}

export const profileUpdateData = {
  valid: {
    name: 'Updated Name',
    preferences: {
      theme: 'dark',
      notifications: false,
    },
  },
  invalidName: {
    name: 'X', // Too short
  },
  invalidPreferences: {
    preferences: 'not-an-object',
  },
}

export const mockSession = {
  user: {
    id: validUser.id,
    email: validUser.email,
    name: validUser.name,
  },
  expires: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
}

export const mockSessionWithSpotify = {
  user: {
    id: userWithSpotify.id,
    email: userWithSpotify.email,
    name: userWithSpotify.name,
  },
  accessToken: userWithSpotify.spotifyAccessToken,
  refreshToken: userWithSpotify.spotifyRefreshToken,
  expires: new Date(Date.now() + 86400000).toISOString(),
}
