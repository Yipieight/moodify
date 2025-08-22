# Moodify - Technical Documentation

## Project Overview

**Moodify** is a web application that uses facial emotion recognition technology to analyze users' emotional states and provide personalized music recommendations based on their current mood. Built as part of a Web Programming university course project for Universidad de Costa Rica.

### Key Features
- 🎭 **Facial Emotion Detection**: Real-time emotion analysis using AI
- 🎵 **Music Recommendations**: Personalized Spotify-based suggestions
- 📊 **Analytics Dashboard**: Emotion trends and insights visualization
- 📱 **Responsive Design**: Mobile-first, cross-platform compatibility
- 🔐 **Secure Authentication**: NextAuth.js integration
- 💾 **Data Persistence**: Local storage with export capabilities

---

## Technology Stack

### Frontend Framework
- **Next.js 15.5.0** - React framework with App Router and Turbopack
- **React 19.1.0** - UI library with latest features
- **TypeScript 5** - Type-safe development

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons

### Authentication
- **NextAuth.js 4.24.11** - Complete authentication solution
- **Spotify OAuth** - Social login integration

### AI & Machine Learning
- **face-api.js 0.22.2** - Face detection and facial expression recognition
- **TensorFlow.js** (via face-api.js) - Browser-based machine learning

### Data Visualization
- **Chart.js 4.5.0** - Flexible charting library
- **react-chartjs-2 5.3.0** - React wrapper for Chart.js

### API Integration
- **Spotify Web API** - Music streaming service integration
- **Axios 1.11.0** - HTTP client for API requests

### Development Tools
- **ESLint 9** - Code linting and quality
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing utilities

---

## Project Structure

```
moodify-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── capture/           # Emotion capture page
│   │   ├── dashboard/         # Analytics dashboard
│   │   ├── history/           # User history page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable React components
│   │   ├── analytics/         # Chart and analytics components
│   │   ├── auth/              # Authentication components
│   │   ├── capture/           # Camera and emotion detection
│   │   ├── history/           # History management components
│   │   ├── layout/            # Layout components
│   │   ├── music/             # Music player components
│   │   ├── providers/         # Context providers
│   │   └── ui/                # Generic UI components
│   ├── lib/                   # Utility libraries and services
│   │   ├── chartConfig.ts     # Chart.js configuration
│   │   ├── emotionDetection.ts # Face-api.js integration
│   │   ├── historyService.ts  # Data persistence service
│   │   └── spotify.ts         # Spotify API integration
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Main type exports
│   └── __tests__/             # Test files
├── docs/                      # Documentation
├── public/                    # Static assets
├── package.json               # Project dependencies
├── tailwind.config.js         # Tailwind CSS configuration
├── next.config.js             # Next.js configuration
└── tsconfig.json              # TypeScript configuration
```

---

## Architecture Overview

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Moodify Architecture                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js + React)                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   UI Layer  │ │ State Mgmt  │ │      Routing            ││
│  │             │ │             │ │                         ││
│  │ Components  │ │ React State │ │ Next.js App Router      ││
│  │ Tailwind    │ │ Local State │ │ Protected Routes        ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Emotion     │ │ Music       │ │      Data               ││
│  │ Detection   │ │ Recommendations│ │    Persistence          ││
│  │             │ │             │ │                         ││
│  │ face-api.js │ │ Spotify API │ │ localStorage            ││
│  │ TensorFlow  │ │ Audio Feat. │ │ History Service         ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  External Services                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ NextAuth.js │ │ Spotify     │ │      Browser APIs       ││
│  │             │ │ Web API     │ │                         ││
│  │ OAuth       │ │ Tracks      │ │ Camera/MediaDevices     ││
│  │ Sessions    │ │ Features    │ │ localStorage            ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Interaction → Emotion Capture → AI Analysis → Music Recommendation → History Storage
      ↓                 ↓                ↓               ↓                    ↓
   UI Components → Camera/Upload → face-api.js → Spotify API → localStorage
      ↓                 ↓                ↓               ↓                    ↓
   User Feedback ← UI Updates ← Results Display ← Track List ← Analytics Data
```

---

## Core Components

### 1. Emotion Detection System

**Location**: `src/lib/emotionDetection.ts`, `src/components/capture/`

**Key Features**:
- Face detection using face-api.js
- Real-time emotion classification (7 emotions)
- Confidence scoring and validation
- Error handling for edge cases

**Technical Implementation**:
```typescript
interface EmotionResult {
  emotion: EmotionType
  confidence: number
  allEmotions: Record<EmotionType, number>
}

class EmotionDetectionService {
  async loadModels(): Promise<void>
  async analyzeImage(imageElement: HTMLImageElement): Promise<EmotionResult>
  getDominantEmotion(emotions: Record<string, number>): { emotion: string, confidence: number }
}
```

**Supported Emotions**:
- Happy 😊
- Sad 😢  
- Angry 😠
- Surprised 😲
- Neutral 😐
- Fear 😨
- Disgust 🤢

### 2. Music Recommendation Engine

**Location**: `src/lib/spotify.ts`, `src/components/music/`

**Key Features**:
- Emotion-to-music mapping algorithm
- Spotify Web API integration
- Audio feature targeting (valence, energy, danceability)
- Fallback recommendations for offline scenarios

**Technical Implementation**:
```typescript
interface MusicRecommendation {
  emotion: EmotionType
  tracks: Track[]
  timestamp: Date
}

class SpotifyService {
  async getRecommendationsByEmotion(emotion: EmotionType): Promise<Track[]>
  async searchTracks(query: string): Promise<Track[]>
  private getEmotionAudioFeatures(emotion: EmotionType): AudioFeatures
}
```

**Emotion Mapping Strategy**:
- **Happy**: High valence, high energy, danceable genres (pop, dance, funk)
- **Sad**: Low valence, low energy, contemplative genres (acoustic, indie, blues)
- **Angry**: Low valence, high energy, intense genres (rock, metal, punk)
- **Neutral**: Balanced features, versatile genres (indie-pop, alternative)

### 3. Analytics Dashboard

**Location**: `src/components/analytics/`, `src/app/dashboard/`

**Key Features**:
- Interactive charts using Chart.js
- Multiple visualization types (line, doughnut, bar, polar area)
- Time range filtering and data aggregation
- Statistical insights and trends

**Chart Types**:
- **Emotion Trends**: Line chart showing emotion patterns over time
- **Distribution**: Doughnut chart of emotion frequency
- **Weekly Activity**: Bar chart of usage patterns
- **Activity Patterns**: Polar area chart of daily/hourly distribution

### 4. Authentication System

**Location**: `src/app/auth/`, `src/components/auth/`

**Key Features**:
- NextAuth.js integration
- Spotify OAuth provider
- Protected route middleware
- Session management

**Implementation**:
```typescript
// Next.js middleware for route protection
export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/capture/:path*", "/dashboard/:path*", "/history/:path*"]
}
```

---

## API Documentation

### Internal API Routes

#### `/api/history`

**GET** - Retrieve user history
```typescript
Query Parameters:
- limit?: number (default: 20)
- page?: number (default: 1)
- type?: 'emotion' | 'recommendation'
- startDate?: string (ISO date)
- endDate?: string (ISO date)

Response:
{
  history: HistoryEntry[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    hasMore: boolean,
    totalPages: number
  }
}
```

**POST** - Save history entry
```typescript
Body:
{
  type: 'emotion' | 'recommendation',
  data: EmotionResult | MusicRecommendation
}

Response:
{
  id: string,
  message: string
}
```

**DELETE** - Delete history entry or clear all
```typescript
Query Parameters:
- id?: string (specific entry, omit to clear all)

Response:
{
  message: string
}
```

### External API Integration

#### Spotify Web API
- **Authentication**: Client Credentials flow
- **Endpoints Used**:
  - `/v1/recommendations` - Get track recommendations
  - `/v1/search` - Search for tracks
  - `/v1/tracks/{id}` - Get track details

#### Face-API.js Models
- **TinyFaceDetector**: Lightweight face detection
- **FaceExpressionNet**: Emotion classification model
- **Model Loading**: Asynchronous from `/models` directory

---

## Environment Configuration

### Required Environment Variables

```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Spotify API
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# Development
NODE_ENV=development
```

### Configuration Files

#### `next.config.js`
```javascript
const nextConfig = {
  experimental: {
    turbo: {
      enabled: true
    }
  },
  images: {
    domains: ['i.scdn.co', 'image-cdn-fa.spotifycdn.com']
  }
}
```

#### `tailwind.config.js`
```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        purple: { /* custom purple palette */ }
      }
    }
  }
}
```

---

## Database Schema

### localStorage Data Structure

Since this is a frontend-only application, data is stored in browser localStorage:

```typescript
// History Entry Structure
interface HistoryEntry {
  id: string
  type: 'emotion' | 'recommendation'
  data: EmotionResult | MusicRecommendation
  timestamp: string
}

// Storage Keys
'moodify_history' // Array of HistoryEntry
'moodify_user_preferences' // User settings (future)
```

---

## Security Considerations

### Authentication Security
- NextAuth.js handles secure session management
- CSRF protection enabled by default
- Secure cookie configuration
- OAuth flow with Spotify

### Data Privacy
- No sensitive data stored in localStorage
- Emotion analysis performed client-side
- No facial images stored permanently
- User data export/deletion capabilities

### API Security
- Environment variables for API keys
- Rate limiting considerations
- Input validation and sanitization
- XSS prevention with React's built-in protections

---

## Performance Optimizations

### Frontend Optimizations
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading of heavy components
- Efficient re-rendering with React optimization

### Asset Optimization
- Tailwind CSS purging unused styles
- Face-api.js model lazy loading
- Chart.js tree shaking
- Bundle size optimization

### Runtime Performance
- Efficient emotion detection algorithms
- Spotify API response caching
- localStorage optimization for large datasets
- Memory management for camera/video streams

---

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Service utility testing with Jest
- Mock external dependencies
- Coverage targets: >80%

### Integration Tests
- API route testing
- Service integration validation
- Error scenario coverage
- Cross-component interaction testing

### End-to-End Tests
- Complete user workflow validation
- Browser compatibility testing
- Performance benchmarking
- Accessibility compliance

---

## Deployment Architecture

### Production Deployment Options

#### Option 1: Vercel (Recommended)
```bash
# Automatic deployment from Git
git push origin main  # Triggers deployment
```

#### Option 2: AWS (Custom)
- S3 + CloudFront for static hosting
- Lambda@Edge for API routes
- Route 53 for custom domain

#### Option 3: Traditional Hosting
- Build static export: `npm run build && npm run export`
- Upload to any static hosting provider

### Environment Setup
```bash
# Production environment variables
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=production-secret
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=prod-client-id
SPOTIFY_CLIENT_SECRET=prod-secret
```

---

## Maintenance and Monitoring

### Health Checks
- Application uptime monitoring
- API response time tracking
- Error rate monitoring
- User engagement metrics

### Update Strategy
- Dependency updates with npm audit
- Security patch management
- Feature rollout with feature flags
- Backward compatibility maintenance

### Backup and Recovery
- localStorage data export functionality
- Configuration backup procedures
- Disaster recovery planning
- Data migration strategies

---

## Contributing Guidelines

### Development Setup
```bash
# Clone repository
git clone [repository-url]
cd moodify-frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Conventional commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation as needed
4. Submit PR with clear description
5. Code review and approval required

---

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Machine learning trend prediction
2. **Social Features**: Mood sharing and collaboration
3. **Multi-Service Integration**: Apple Music, Amazon Music support
4. **Offline Mode**: Progressive Web App capabilities
5. **Mobile Apps**: React Native implementation

### Technical Improvements
1. **Database Integration**: PostgreSQL/MongoDB for production
2. **Real-time Features**: WebSocket integration
3. **AI Enhancements**: Custom emotion detection models
4. **Performance**: Edge computing for faster processing
5. **Accessibility**: Enhanced screen reader support

---

## Support and Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Face-API.js Guide](https://github.com/justadudewhohacks/face-api.js)
- [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

### Contact Information
- **Project Team**: Universidad de Costa Rica - Ingeniería en Informática
- **Course**: Web Programming 2025S2
- **Repository**: [GitHub Repository URL]

---

*Last Updated: January 15, 2025*  
*Version: 1.0.0*