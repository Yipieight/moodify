# Moodify API Reference

## Overview

Moodify provides both internal API routes for data management and integrates with external services for core functionality. This document covers all API endpoints and their usage.

## Internal API Routes

All internal APIs are built using Next.js API routes and follow RESTful conventions.

### Authentication

Authentication is handled by NextAuth.js with automatic session management.

**Base URL**: `/api/auth`

#### Endpoints

- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/callback/spotify` - OAuth callback

---

## History API

Manages user emotion and music recommendation history.

**Base URL**: `/api/history`

### GET /api/history

Retrieve user's history with optional filtering and pagination.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 20 | Number of entries per page |
| `page` | number | No | 1 | Page number for pagination |
| `type` | string | No | - | Filter by 'emotion' or 'recommendation' |
| `startDate` | string | No | - | Start date (ISO format) |
| `endDate` | string | No | - | End date (ISO format) |

#### Example Request

```bash
GET /api/history?limit=10&page=1&type=emotion&startDate=2025-01-01
```

#### Response

```json
{
  "history": [
    {
      "id": "unique-id-123",
      "type": "emotion",
      "data": {
        "emotion": "happy",
        "confidence": 0.85,
        "allEmotions": {
          "happy": 0.85,
          "sad": 0.08,
          "neutral": 0.05,
          "angry": 0.02
        }
      },
      "timestamp": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "hasMore": true,
    "totalPages": 5
  }
}
```

#### Status Codes

- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/history

Save a new history entry (emotion analysis or music recommendation).

#### Request Body

```json
{
  "type": "emotion" | "recommendation",
  "data": EmotionResult | MusicRecommendation
}
```

#### Emotion Entry Example

```json
{
  "type": "emotion",
  "data": {
    "emotion": "happy",
    "confidence": 0.92,
    "allEmotions": {
      "happy": 0.92,
      "sad": 0.03,
      "angry": 0.02,
      "surprised": 0.02,
      "neutral": 0.01,
      "fear": 0.00,
      "disgust": 0.00
    }
  }
}
```

#### Music Recommendation Entry Example

```json
{
  "type": "recommendation",
  "data": {
    "emotion": "happy",
    "tracks": [
      {
        "id": "spotify-track-id",
        "name": "Happy Song",
        "artist": "Artist Name",
        "album": "Album Name",
        "duration": 210,
        "imageUrl": "https://image.url",
        "previewUrl": "https://preview.url",
        "spotifyUrl": "https://open.spotify.com/track/id",
        "popularity": 85
      }
    ],
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Response

```json
{
  "id": "generated-unique-id",
  "message": "History entry saved successfully"
}
```

#### Status Codes

- `201` - Created successfully
- `400` - Invalid request data
- `401` - Unauthorized
- `500` - Server error

---

### DELETE /api/history

Delete a specific history entry or clear all history.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | No | Specific entry ID to delete. Omit to clear all history |

#### Examples

```bash
# Delete specific entry
DELETE /api/history?id=unique-id-123

# Clear all history
DELETE /api/history
```

#### Response

```json
{
  "message": "History entry deleted successfully"
}
```

or

```json
{
  "message": "All history cleared successfully"
}
```

#### Status Codes

- `200` - Success
- `404` - Entry not found
- `401` - Unauthorized
- `500` - Server error

---

## External API Integrations

### Spotify Web API

Moodify integrates with Spotify's Web API for music recommendations and track data.

#### Authentication

Uses Client Credentials flow for app-only requests.

```javascript
// Token endpoint
POST https://accounts.spotify.com/api/token

// Headers
Authorization: Basic <base64(client_id:client_secret)>
Content-Type: application/x-www-form-urlencoded

// Body
grant_type=client_credentials
```

#### Endpoints Used

##### Get Recommendations

```bash
GET https://api.spotify.com/v1/recommendations
```

**Parameters**:
- `seed_genres` - Comma-separated genre seeds
- `target_valence` - Target valence (0.0 to 1.0)
- `target_energy` - Target energy (0.0 to 1.0)
- `target_danceability` - Target danceability (0.0 to 1.0)
- `limit` - Number of tracks to return
- `market` - Market/country code

##### Search Tracks

```bash
GET https://api.spotify.com/v1/search
```

**Parameters**:
- `q` - Search query
- `type` - Search type ('track')
- `limit` - Number of results
- `market` - Market/country code

##### Get Track Details

```bash
GET https://api.spotify.com/v1/tracks/{id}
```

#### Emotion to Audio Features Mapping

| Emotion | Valence | Energy | Danceability | Tempo | Genres |
|---------|---------|--------|--------------|-------|---------|
| Happy | 0.8 | 0.7 | 0.8 | 120 | pop, dance, funk |
| Sad | 0.2 | 0.3 | 0.3 | 80 | acoustic, indie, blues |
| Angry | 0.3 | 0.9 | 0.5 | 140 | rock, metal, punk |
| Surprised | 0.6 | 0.6 | 0.6 | 110 | electronic, experimental |
| Neutral | 0.5 | 0.5 | 0.5 | 100 | indie-pop, alternative |
| Fear | 0.2 | 0.4 | 0.2 | 90 | dark-ambient, gothic |
| Disgust | 0.3 | 0.6 | 0.3 | 95 | grunge, alternative-rock |

---

### Face-API.js Models

For emotion detection, Moodify uses pre-trained models from face-api.js.

#### Models Used

1. **TinyFaceDetector**
   - Purpose: Face detection
   - File: `tiny_face_detector_model-weights_manifest.json`
   - Size: ~300KB

2. **FaceExpressionNet**
   - Purpose: Emotion classification
   - File: `face_expression_model-weights_manifest.json`
   - Size: ~310KB

#### Model Loading

```javascript
// Models are loaded asynchronously from /public/models/
await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
await faceapi.nets.faceExpressionNet.loadFromUri('/models')
```

#### Detection Process

```javascript
// Detect faces and expressions
const detections = await faceapi
  .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
  .withFaceExpressions()

// Extract emotion data
const expressions = detections[0].expressions
```

#### Emotion Categories

The model recognizes 7 emotion categories:

1. `happy` - Joy, contentment
2. `sad` - Sadness, melancholy
3. `angry` - Anger, frustration
4. `surprised` - Surprise, amazement
5. `neutral` - Neutral expression
6. `fearful` - Fear, anxiety
7. `disgusted` - Disgust, distaste

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | User not authenticated | 401 |
| `FORBIDDEN` | Access denied | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `RATE_LIMITED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |
| `SPOTIFY_ERROR` | Spotify API error | 503 |
| `MODEL_LOAD_ERROR` | AI model loading failed | 503 |

### Rate Limiting

Internal APIs have rate limiting to prevent abuse:

- **History API**: 100 requests per minute per user
- **General**: 1000 requests per hour per IP

External APIs (Spotify) have their own rate limits:
- **Spotify**: Varies by endpoint, typically 100-1000 requests per minute

---

## SDK and Client Libraries

### JavaScript/TypeScript Client

Moodify includes TypeScript types for all API responses:

```typescript
import type { HistoryEntry, EmotionResult, MusicRecommendation } from '@/types'

// Example usage
const response = await fetch('/api/history')
const data: {
  history: HistoryEntry[]
  pagination: PaginationInfo
} = await response.json()
```

### Service Classes

The application includes service classes for easy API interaction:

```typescript
// History Service
import { historyService } from '@/lib/historyService'

const history = await historyService.getHistory({ limit: 10 })
await historyService.saveEmotionResult(emotionData)

// Spotify Service
import { spotifyService } from '@/lib/spotify'

const recommendations = await spotifyService.getRecommendationsByEmotion('happy')
const tracks = await spotifyService.searchTracks('query')
```

---

## Webhooks and Real-time Features

Currently, Moodify operates as a client-side application without webhooks. Future versions may include:

- Real-time emotion analysis updates
- Collaborative playlist features
- Social sharing capabilities

---

## API Versioning

Current API version: `v1` (implicit)

Future versions will use URL versioning:
- `v1`: `/api/v1/history`
- `v2`: `/api/v2/history`

---

## Testing APIs

### Development Environment

```bash
# Base URL for local testing
http://localhost:3000/api

# Example requests
curl http://localhost:3000/api/history
curl -X POST http://localhost:3000/api/history -H "Content-Type: application/json" -d '{"type":"emotion","data":{...}}'
```

### Authentication Testing

For protected endpoints, you need a valid session cookie:

```bash
# First authenticate via browser
# Then copy session cookie for API requests
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/history
```

---

## Performance Considerations

### Caching

- Spotify access tokens are cached for 1 hour
- Face-api.js models are cached in browser
- History data uses localStorage for client-side caching

### Optimization Tips

1. **Batch Operations**: Group multiple history saves
2. **Pagination**: Use appropriate page sizes (10-50 items)
3. **Filtering**: Apply filters to reduce data transfer
4. **Compression**: Enable gzip compression in production

---

## Security

### API Security Measures

1. **Authentication**: NextAuth.js session management
2. **CSRF Protection**: Built-in CSRF tokens
3. **Input Validation**: Zod schema validation
4. **Rate Limiting**: Per-user and per-IP limits
5. **HTTPS**: Required in production
6. **CORS**: Configured for trusted origins

### Best Practices

- Never expose client secrets in frontend code
- Use environment variables for sensitive data
- Validate all inputs on both client and server
- Implement proper error handling without exposing internal details

---

*Last Updated: January 15, 2025*