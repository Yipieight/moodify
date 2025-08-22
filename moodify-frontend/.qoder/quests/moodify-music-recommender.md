# Moodify Music Recommender System Design

## Overview

Moodify is an innovative music recommendation platform that integrates facial emotion recognition technology to provide personalized music suggestions based on users' real-time emotional states. The system captures or analyzes user photographs to determine their mood and recommends appropriate music to enhance their emotional experience.

### Core Value Proposition
- **Real-time Emotion Detection**: Uses facial recognition to identify user emotions instantly
- **Dynamic Music Recommendations**: Provides mood-appropriate music suggestions
- **Personalized History**: Maintains user recommendation history for future reference
- **Enhanced User Experience**: Creates an immersive connection between emotions and music

### Target Users
- Music enthusiasts seeking personalized experiences
- Users interested in emotion-driven content discovery
- Individuals looking for mood enhancement through music

## Technology Stack & Dependencies

### Frontend Architecture
- **Framework**: Next.js 15.5.0 with App Router
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Build Tool**: Turbopack (Next.js integrated)

### Key Dependencies
```json
{
  "face-api.js": "^0.22.2",      // Facial emotion recognition
  "react-webcam": "^7.2.0",      // Camera integration
  "next-auth": "^4.24.11",       // Authentication system
  "@auth/prisma-adapter": "^2.10.0", // Database adapter
  "axios": "^1.11.0",            // HTTP client
  "react-hook-form": "^7.62.0",  // Form management
  "zod": "^4.0.17",              // Schema validation
  "chart.js": "^4.5.0",          // Dashboard charts
  "react-chartjs-2": "^5.3.0",   // React Chart.js wrapper
  "@headlessui/react": "^2.2.7", // UI components
  "@heroicons/react": "^2.2.0",  // Icon library
  "lucide-react": "^0.541.0"     // Additional icons
}
```

### Suggested Backend Technology Stack
- **Backend Framework**: Express.js with Node.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Cloud Services**: AWS (Rekognition, RDS, S3, EC2)
- **External APIs**: Spotify Web API

## Component Architecture

### Component Hierarchy

```mermaid
graph TD
    A[App Layout] --> B[Header/Navigation]
    A --> C[Main Content Area]
    A --> D[Footer]
    
    C --> E[Home Page]
    C --> F[Auth Pages]
    C --> G[Camera Capture]
    C --> H[Recommendations]
    C --> I[History]
    C --> J[Dashboard]
    
    F --> F1[Login]
    F --> F2[Register]
    F --> F3[Profile]
    
    G --> G1[WebcamCapture]
    G --> G2[ImageUpload]
    G --> G3[EmotionAnalysis]
    
    H --> H1[MusicPlayer]
    H --> H2[RecommendationList]
    H --> H3[TrackCard]
    
    I --> I1[HistoryList]
    I --> I2[HistoryFilter]
    
    J --> J1[EmotionCharts]
    J --> J2[AnalyticsOverview]
    J --> J3[WeeklyStats]
```

### Core Components

#### 1. Authentication Components
```typescript
// components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

// components/auth/RegisterForm.tsx
interface RegisterFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}
```

#### 2. Emotion Detection Components
```typescript
// components/camera/WebcamCapture.tsx
interface WebcamCaptureProps {
  onCapture: (imageData: string) => void;
  onEmotionDetected: (emotion: EmotionResult) => void;
}

// components/camera/ImageUpload.tsx
interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  acceptedFormats: string[];
  maxSize: number;
}

// components/analysis/EmotionDisplay.tsx
interface EmotionDisplayProps {
  emotions: EmotionResult[];
  primaryEmotion: string;
  confidence: number;
}
```

#### 3. Music Recommendation Components
```typescript
// components/music/RecommendationList.tsx
interface RecommendationListProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  loading: boolean;
}

// components/music/MusicPlayer.tsx
interface MusicPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}
```

#### 4. Dashboard Components
```typescript
// components/dashboard/EmotionChart.tsx
interface EmotionChartProps {
  data: EmotionData[];
  timeRange: 'week' | 'month';
  chartType: 'line' | 'bar' | 'pie';
}

// components/dashboard/AnalyticsCard.tsx
interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType;
}
```

## Routing & Navigation

### App Router Structure
```
src/app/
├── layout.tsx                 // Root layout with auth provider
├── page.tsx                   // Landing/Home page
├── globals.css               // Global styles
├── api/                      // API routes
│   ├── auth/                 // Authentication endpoints
│   ├── emotions/             // Emotion analysis endpoints
│   └── recommendations/      // Music recommendation endpoints
├── auth/                     // Authentication pages
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── profile/page.tsx
├── dashboard/                // User dashboard
│   ├── page.tsx
│   ├── history/page.tsx
│   └── analytics/page.tsx
├── capture/                  // Photo capture/upload
│   ├── page.tsx
│   ├── camera/page.tsx
│   └── upload/page.tsx
└── recommendations/          // Music recommendations
    ├── page.tsx
    └── [emotionId]/page.tsx
```

### Navigation Flow

```mermaid
flowchart TD
    A[Landing Page] --> B{User Authenticated?}
    B -->|No| C[Login/Register]
    B -->|Yes| D[Dashboard]
    
    C --> D
    D --> E[Capture Photo]
    D --> F[View History]
    D --> G[Analytics Dashboard]
    
    E --> H[Camera Capture]
    E --> I[Upload Image]
    
    H --> J[Emotion Analysis]
    I --> J
    
    J --> K[Music Recommendations]
    K --> L[Music Player]
    K --> M[Save to History]
    
    F --> N[Filter History]
    F --> O[View Past Recommendations]
    
    G --> P[Emotion Trends]
    G --> Q[Usage Statistics]
    G --> R[Weekly Reports]
```

## State Management

### Authentication State
```typescript
// Using NextAuth.js session management
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

### Emotion Analysis State
```typescript
interface EmotionResult {
  emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral' | 'fear' | 'disgust';
  confidence: number;
  timestamp: Date;
  imageUrl?: string;
}

interface EmotionState {
  currentEmotion: EmotionResult | null;
  isAnalyzing: boolean;
  history: EmotionResult[];
  error: string | null;
}
```

### Music Recommendation State
```typescript
interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  previewUrl?: string;
  imageUrl?: string;
  spotifyUrl: string;
}

interface RecommendationState {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  emotion: string;
}
```

## API Integration Layer

### External API Integration

#### Spotify Web API Integration
```typescript
// services/spotify.ts
class SpotifyService {
  async getRecommendations(emotion: string, limit: number = 20): Promise<Track[]>
  async getTrackDetails(trackId: string): Promise<Track>
  async searchTracks(query: string): Promise<Track[]>
}
```

#### AWS Rekognition Integration (Alternative to face-api.js)
```typescript
// services/aws-rekognition.ts
class EmotionDetectionService {
  async analyzeEmotion(imageData: string): Promise<EmotionResult>
  async detectFaces(imageData: string): Promise<FaceData[]>
}
```

### Internal API Routes

#### Authentication API
```typescript
// app/api/auth/route.ts
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/session
POST /api/auth/logout
```

#### Emotion Analysis API
```typescript
// app/api/emotions/route.ts
POST /api/emotions/analyze    // Analyze uploaded image
GET  /api/emotions/history    // Get user emotion history
DELETE /api/emotions/:id      // Delete emotion record
```

#### Music Recommendations API
```typescript
// app/api/recommendations/route.ts
POST /api/recommendations/generate  // Generate recommendations based on emotion
GET  /api/recommendations/history   // Get user recommendation history
POST /api/recommendations/save      // Save recommendation to history
```

## Data Flow Architecture

### Emotion Detection Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Camera Component
    participant F as Face-API.js
    participant A as API Route
    participant S as Spotify API
    participant D as Database
    
    U->>C: Capture/Upload Photo
    C->>F: Process Image
    F->>C: Return Emotion Data
    C->>A: Send Emotion Result
    A->>S: Request Music Recommendations
    S->>A: Return Track List
    A->>D: Save Recommendation History
    A->>C: Return Recommendations
    C->>U: Display Music Suggestions
```

### User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login Form
    participant N as NextAuth
    participant D as Database
    participant P as Provider (Google/Email)
    
    U->>L: Enter Credentials
    L->>N: Submit Login
    N->>P: Authenticate
    P->>N: Return Auth Result
    N->>D: Create/Update Session
    D->>N: Confirm Session
    N->>L: Return Session
    L->>U: Redirect to Dashboard
```

## Testing Strategy

### Unit Testing
```typescript
// __tests__/components/EmotionDetection.test.tsx
describe('EmotionDetection Component', () => {
  test('should detect emotions from uploaded image')
  test('should handle camera capture correctly')
  test('should display emotion results accurately')
})

// __tests__/services/spotify.test.ts
describe('Spotify Service', () => {
  test('should fetch recommendations based on emotion')
  test('should handle API rate limits')
  test('should format track data correctly')
})
```

### Integration Testing
```typescript
// __tests__/api/recommendations.test.ts
describe('Recommendations API', () => {
  test('should generate recommendations for happy emotion')
  test('should save recommendations to user history')
  test('should handle authentication requirements')
})
```

### End-to-End Testing
```typescript
// e2e/emotion-to-music-flow.spec.ts
test('Complete emotion detection to music recommendation flow', async () => {
  // 1. User logs in
  // 2. Captures photo
  // 3. System detects emotion
  // 4. Receives music recommendations
  // 5. Saves to history
})
```

## Security & Privacy Considerations

### Data Protection
- **Image Processing**: Images processed client-side with face-api.js, not stored permanently
- **User Data**: Encrypted storage of user preferences and history
- **API Security**: Rate limiting and authentication for all endpoints
- **GDPR Compliance**: User data deletion and export capabilities

### Authentication Security
```typescript
// middleware.ts - Route protection
export function middleware(request: NextRequest) {
  const token = request.nextauth.token
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}
```

## Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy loading of emotion detection components
- **Image Optimization**: Next.js Image component for album artwork
- **Caching**: SWR for API data caching and revalidation
- **Bundle Analysis**: Regular analysis of bundle size

### Backend Optimizations
- **Database Indexing**: Indexes on user_id, emotion_type, and timestamp
- **API Caching**: Redis caching for Spotify API responses
- **CDN Integration**: CloudFront for static assets and album artwork

## Deployment Architecture

### AWS Infrastructure

```mermaid
graph TB
    subgraph "Client"
        A[Next.js Frontend]
    end
    
    subgraph "AWS Cloud"
        B[CloudFront CDN]
        C[Application Load Balancer]
        
        subgraph "Compute"
            D[EC2 Instances]
            E[Auto Scaling Group]
        end
        
        subgraph "Database"
            F[RDS MySQL]
            G[ElastiCache Redis]
        end
        
        subgraph "Storage"
            H[S3 Bucket]
        end
        
        subgraph "AI Services"
            I[AWS Rekognition]
        end
    end
    
    subgraph "External APIs"
        J[Spotify Web API]
    end
    
    A --> B
    B --> C
    C --> D
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J
```

### Environment Configuration

#### Development Environment
```bash
# Local development setup
npm run dev                    # Start development server
npm run db:migrate            # Run database migrations
npm run db:seed               # Seed development data
```

#### Production Environment
```bash
# Production deployment
npm run build                 # Build optimized bundle
npm run start                 # Start production server
npm run db:deploy             # Deploy database changes
```

### Environment Variables
```env
# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Database
DATABASE_URL=mysql://user:password@host:port/database

# Spotify API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# AWS Services
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Redis Cache
REDIS_URL=redis://user:password@host:port
```

## Bonus Features Implementation

### Analytics Dashboard

#### Emotion Trends Chart
```typescript
// components/dashboard/EmotionTrendsChart.tsx
interface EmotionTrendsProps {
  timeRange: 'week' | 'month';
  data: {
    date: string;
    emotions: Record<string, number>;
  }[];
}
```

#### Weekly Analytics
```typescript
// components/dashboard/WeeklyAnalytics.tsx
interface WeeklyAnalyticsProps {
  analyses: {
    date: string;
    count: number;
  }[];
  emotionBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}
```

#### Dashboard Layout
```mermaid
graph TD
    A[Dashboard Layout] --> B[Header with Time Range Selector]
    A --> C[Analytics Grid]
    
    C --> D[Emotion Frequency Chart]
    C --> E[Daily Analysis Count]
    C --> F[Positive vs Negative Emotions]
    C --> G[Most Common Emotions]
    C --> H[Music Genre Preferences]
    C --> I[Usage Patterns]
```

## Development Phases

### Phase 1: Core Foundation (Weeks 1-2)
- Project setup and configuration
- Authentication system implementation
- Basic UI components and layout
- Database schema and migrations

### Phase 2: Core Features (Weeks 3-4)
- Emotion detection integration (face-api.js)
- Camera capture and image upload
- Spotify API integration
- Basic music recommendations

### Phase 3: User Experience (Weeks 5-6)
- Recommendation history
- Music player implementation
- UI/UX refinements
- Error handling and validation

### Phase 4: Analytics & Optimization (Weeks 7-8)
- Dashboard with analytics charts
- Performance optimizations
- Security hardening
- Testing and bug fixes

### Phase 5: Deployment & Documentation (Week 9)
- AWS deployment setup
- Production configuration
- Documentation completion
- Final testing and delivery