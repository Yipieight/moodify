# Integration Testing and Documentation Guide

## Overview

This document provides a comprehensive strategy for implementing integration testing across the Moodify application using Supertest and Jest, along with a complete documentation framework using Fumadocs. The guide covers test implementation strategy, demonstration procedures, technical documentation, and user manual creation.

### Purpose

- Establish robust integration testing for all API endpoints
- Create comprehensive technical documentation for developers
- Develop user-friendly manuals with visual aids
- Enable effective demonstration of testing capabilities
- Ensure code quality and maintainability

### Scope

The implementation covers:
- API integration testing for all endpoints (authentication, history, music recommendations, user profile, health checks)
- Test demonstration guide for stakeholders
- Technical documentation including architecture, deployment, and code structure
- User manual with step-by-step instructions and screenshots

## Technology Stack

### Integration Testing Framework

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Test Framework | Jest | 29.7.0 | Core testing framework with assertion library |
| HTTP Testing | Supertest | Latest | HTTP assertion library for API endpoint testing |
| Mock Library | node-mocks-http | 1.17.2 | HTTP request/response mocking |
| Test Environment | jest-environment-jsdom | 29.7.0 | Browser-like environment for React components |
| Testing Utilities | @testing-library/react | 16.3.0 | Component testing utilities |

### Documentation Framework

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Documentation System | Fumadocs | 15.8.5 | Modern documentation framework |
| Content Processing | fumadocs-mdx | 12.0.3 | MDX content processing |
| UI Components | fumadocs-ui | 15.8.5 | Pre-built documentation UI components |
| Framework | Next.js | 15.5.4 | Static site generation and routing |
| Styling | Tailwind CSS | 4.1.14 | Responsive styling system |

## Integration Testing Strategy

### Testing Architecture

```mermaid
graph TD
    A[Integration Tests] --> B[API Route Tests]
    A --> C[Service Layer Tests]
    A --> D[End-to-End Workflow Tests]
    
    B --> E[Authentication APIs]
    B --> F[History API]
    B --> G[Music Recommendation API]
    B --> H[User Profile API]
    B --> I[Health Check API]
    
    C --> J[Spotify Service]
    C --> K[Emotion Detection Service]
    C --> L[History Service]
    
    D --> M[User Registration Flow]
    D --> N[Emotion Capture to Music Flow]
    D --> O[History Management Flow]
```

### Test Coverage Strategy

#### API Endpoints to Test

| Endpoint | Methods | Priority | Test Categories |
|----------|---------|----------|-----------------|
| `/api/auth/login` | POST | High | Authentication, validation, error handling |
| `/api/auth/register` | POST | High | User creation, validation, duplicate handling |
| `/api/auth/callback/spotify` | GET | High | OAuth flow, token exchange, session creation |
| `/api/history` | GET, POST, DELETE | High | CRUD operations, pagination, filtering |
| `/api/history/[id]` | DELETE | Medium | Single entry deletion, not found scenarios |
| `/api/music/recommendations` | POST | High | Emotion-based recommendations, API integration |
| `/api/music/search` | GET | Medium | Search functionality, query validation |
| `/api/music/current-playing` | GET | Low | Real-time Spotify integration |
| `/api/recommendations` | GET | High | Personalized recommendations, caching |
| `/api/user/profile` | GET, PUT | Medium | Profile retrieval, updates, validation |
| `/api/health` | GET | Low | Service availability, dependencies check |

#### Test Scenarios Per Endpoint

**Common Test Scenarios**
1. Successful request with valid data
2. Invalid request data validation
3. Missing required fields
4. Malformed request body
5. Unauthorized access attempts
6. Rate limiting behavior
7. Error handling and recovery
8. Response format validation
9. Status code verification
10. Database/storage interaction

**History API Specific Scenarios**
- Pagination with various limits and pages
- Filtering by emotion type
- Filtering by date range
- Empty history handling
- Bulk deletion operations
- Concurrent request handling
- Storage quota exceeded scenarios

**Authentication API Specific Scenarios**
- Valid credentials login
- Invalid credentials handling
- Session creation and management
- OAuth token exchange
- Redirect URL validation
- Spotify account linking
- User already exists scenarios

**Music Recommendation API Specific Scenarios**
- Emotion-to-genre mapping accuracy
- Spotify API integration
- Empty results handling
- Cache hit/miss scenarios
- API rate limit handling
- Network timeout recovery

### Test Data Management

#### Mock Data Structure

| Data Type | Purpose | Location |
|-----------|---------|----------|
| User Fixtures | Authentication testing | `__tests__/fixtures/users.ts` |
| Emotion Fixtures | Emotion detection testing | `__tests__/fixtures/emotions.ts` |
| Music Fixtures | Recommendation testing | `__tests__/fixtures/tracks.ts` |
| History Fixtures | History API testing | `__tests__/fixtures/history.ts` |
| API Response Mocks | External API simulation | `__tests__/mocks/spotify.ts` |

#### Test Database Strategy

**Approach**: In-memory data storage with localStorage mock

**Rationale**:
- No external database dependencies for tests
- Fast test execution
- Isolated test environment
- Easy cleanup between tests

**Implementation Pattern**:
```
beforeEach: Clear all data stores
test: Execute with fresh state
afterEach: Verify cleanup
```

### Supertest Integration Pattern

#### Request Testing Flow

```mermaid
sequenceDiagram
    participant Test as Test Suite
    participant ST as Supertest
    participant API as API Route Handler
    participant Service as Service Layer
    participant Store as Data Store
    
    Test->>ST: Create HTTP request
    ST->>API: Forward request with mocked context
    API->>Service: Process business logic
    Service->>Store: Data operations
    Store-->>Service: Return result
    Service-->>API: Business logic result
    API-->>ST: HTTP response
    ST-->>Test: Assertions on response
    Test->>Test: Verify expectations
```

#### Test Structure Pattern

**Arrangement**: Test organization strategy
- Group by endpoint/feature
- Nested describe blocks for HTTP methods
- Shared setup in beforeEach/afterEach
- Clear test naming conventions

**Pattern Example**:
```
describe('API Endpoint: /api/feature')
  describe('GET /api/feature')
    test('successful retrieval')
    test('validation error')
    test('not found scenario')
  describe('POST /api/feature')
    test('successful creation')
    test('invalid data')
    test('duplicate handling')
```

## Test Implementation Design

### Authentication API Tests

#### Test Suite Structure

| Test Group | Scenarios | Expected Outcomes |
|------------|-----------|-------------------|
| Registration | Valid registration, duplicate email, invalid email format, weak password, missing fields | 201/400/409 status, user creation, validation errors |
| Login | Valid credentials, invalid password, non-existent user, missing fields | 200/401/400 status, session creation, error messages |
| Spotify OAuth | Authorization URL generation, callback handling, token exchange, error states | 302/200/400 status, session with tokens, error handling |
| Session Management | Session creation, session validation, session expiration, logout | Proper session lifecycle management |

#### Key Validation Points

- Email format and uniqueness
- Password strength requirements
- CSRF token validation
- OAuth state parameter verification
- Redirect URL security
- Token storage and encryption

### History API Tests

#### CRUD Operations Testing

**Create (POST)**
- Emotion data structure validation
- Recommendation data structure validation
- Timestamp generation
- ID generation and uniqueness
- Storage persistence
- Maximum storage limit handling

**Read (GET)**
- Retrieval with default pagination
- Custom pagination parameters
- Type-based filtering (emotion vs recommendation)
- Date range filtering
- Sorting by timestamp
- Empty result handling
- Malformed query parameters

**Delete (DELETE)**
- Single entry deletion by ID
- Bulk deletion (clear all)
- Non-existent ID handling
- Cascade deletion considerations
- Confirmation mechanism validation

#### Data Integrity Tests

- Concurrent write operations
- Data consistency after multiple operations
- Storage quota exceeded scenarios
- Corrupted data recovery
- Version compatibility

### Music Recommendation API Tests

#### External API Integration Testing

**Spotify API Mock Strategy**

| Scenario | Mock Behavior | Test Validation |
|----------|---------------|-----------------|
| Successful recommendation | Return valid track array | Verify track structure, emotion mapping |
| Empty results | Return empty array | Handle gracefully with message |
| API timeout | Delayed response simulation | Timeout handling, fallback behavior |
| Rate limit exceeded | 429 status response | Retry logic, user notification |
| Invalid token | 401 status response | Token refresh flow, re-authentication |
| Network error | Connection refused | Error handling, user-friendly message |

#### Emotion to Music Mapping Tests

**Mapping Validation**

| Emotion | Expected Genres | Valence Range | Energy Range |
|---------|----------------|---------------|---------------|
| Happy | Pop, Dance, Upbeat | 0.7-1.0 | 0.6-1.0 |
| Sad | Acoustic, Indie, Blues | 0.0-0.3 | 0.2-0.4 |
| Angry | Rock, Metal, Punk | 0.3-0.6 | 0.7-1.0 |
| Surprised | Electronic, Experimental | 0.5-0.8 | 0.6-0.9 |
| Neutral | Alternative, Chill | 0.4-0.6 | 0.3-0.6 |
| Fear | Ambient, Dark | 0.1-0.4 | 0.2-0.5 |
| Disgust | Grunge, Alternative | 0.2-0.5 | 0.5-0.7 |

**Test Validation**:
- Verify genre assignment matches emotion
- Validate audio features within expected ranges
- Ensure recommendation diversity
- Check result count meets minimum threshold

### User Profile API Tests

#### Profile Operations

**Profile Retrieval (GET)**
- Authenticated user profile access
- Unauthenticated access denial
- Profile data completeness
- Privacy settings respect

**Profile Update (PUT)**
- Valid field updates
- Partial updates support
- Invalid data rejection
- Concurrent update handling
- Optimistic locking validation

#### Profile Data Validation

| Field | Validation Rules | Test Cases |
|-------|-----------------|------------|
| Display Name | 2-50 characters, alphanumeric + spaces | Valid, too short, too long, special chars |
| Email | Valid email format, unique | Valid format, invalid format, duplicate |
| Preferences | JSON object with specific schema | Valid structure, invalid structure, missing fields |
| Privacy Settings | Boolean or enum values | Valid values, invalid values, type mismatch |

### Health Check API Tests

#### System Health Monitoring

**Health Check Responses**

| Status | Condition | Response Structure |
|--------|-----------|-------------------|
| Healthy | All systems operational | `{ status: "healthy", timestamp, services: { spotify: "up", storage: "up" } }` |
| Degraded | Some services unavailable | `{ status: "degraded", timestamp, services: { spotify: "down", storage: "up" } }` |
| Unhealthy | Critical failures | `{ status: "unhealthy", timestamp, services: { spotify: "down", storage: "down" } }` |

**Dependency Checks**
- Spotify API connectivity
- Storage system availability
- Face-API model loading status
- Authentication service status

## Test Demonstration Guide

### Demonstration Setup

#### Prerequisites Checklist

| Item | Status | Notes |
|------|--------|-------|
| Node.js 18+ installed | ☐ | Verify with `node --version` |
| Dependencies installed | ☐ | Run `pnpm install` |
| Environment variables configured | ☐ | Copy `.env.example` to `.env.test` |
| Test database initialized | ☐ | Mock storage ready |
| Spotify test account ready | ☐ | For OAuth testing |

#### Environment Configuration

**Test Environment Variables**
```
NODE_ENV=test
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-key
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=test-client-id
SPOTIFY_CLIENT_SECRET=test-client-secret
```

### Demonstration Flow

#### Phase 1: Setup Demonstration (5 minutes)

**Steps**:
1. Show project structure and test organization
2. Display test configuration in `jest.config.js`
3. Explain Supertest setup and request patterns
4. Review mock data fixtures

**Key Points to Highlight**:
- Test isolation strategy
- Mock vs integration approach
- Coverage targets and metrics

#### Phase 2: Basic API Tests (10 minutes)

**Demonstration Script**:

1. **Health Check Test** (Simple entry point)
   - Run: `pnpm test api/health`
   - Show: Simple GET request testing
   - Explain: Status code and response structure validation

2. **History API Tests** (CRUD operations)
   - Run: `pnpm test api/history`
   - Show: Complete CRUD test suite
   - Explain: Request/response cycle with Supertest
   - Highlight: Pagination and filtering tests

3. **Validation Tests** (Error handling)
   - Show: Invalid data submission tests
   - Explain: Error response structure
   - Highlight: Comprehensive error scenarios

#### Phase 3: Advanced Integration Tests (10 minutes)

**Demonstration Script**:

1. **Authentication Flow**
   - Run: `pnpm test api/auth`
   - Show: Multi-step authentication process
   - Explain: Session management and token handling

2. **Spotify Integration**
   - Run: `pnpm test api/music`
   - Show: External API mocking
   - Explain: Resilience and error handling

3. **End-to-End Workflow**
   - Run: `pnpm test e2e/emotion-to-music`
   - Show: Complete user journey
   - Explain: Cross-service integration

#### Phase 4: Coverage and Reporting (5 minutes)

**Demonstration Script**:

1. **Coverage Report Generation**
   - Run: `pnpm test:coverage`
   - Show: Coverage metrics dashboard
   - Explain: Coverage thresholds and goals

2. **Test Results Interpretation**
   - Display: Passed/failed test summary
   - Explain: Performance metrics
   - Highlight: Areas needing improvement

### Demonstration Best Practices

#### Presentation Strategy

**Visual Elements**:
- Split terminal showing test output and code
- Coverage report displayed in browser
- Test execution in watch mode for interactivity

**Narrative Flow**:
1. Start with simple tests (health check)
2. Progress to complex scenarios (authentication)
3. Demonstrate error handling capabilities
4. Show coverage metrics and quality gates

**Interaction Points**:
- Modify test data to show immediate feedback
- Trigger failures intentionally to show error reporting
- Run specific test suites on demand
- Show test debugging capabilities

#### Common Questions Preparation

| Question | Preparation Strategy |
|----------|---------------------|
| "How long do tests take to run?" | Show execution time metrics, explain optimization |
| "What's the coverage percentage?" | Display live coverage report, explain targets |
| "How do you handle external APIs?" | Demonstrate mocking strategy with examples |
| "What happens when tests fail in CI/CD?" | Show sample failure output, explain remediation |
| "Can tests run in parallel?" | Demonstrate parallel execution, explain trade-offs |

## Fumadocs Documentation Structure

### Documentation Architecture

```mermaid
graph TD
    A[Moodify Documentation] --> B[Getting Started]
    A --> C[Technical Documentation]
    A --> D[User Manual]
    A --> E[API Reference]
    
    B --> B1[Installation]
    B --> B2[Quick Start]
    B --> B3[Configuration]
    
    C --> C1[Development Environment]
    C --> C2[Project Structure]
    C --> C3[Architecture]
    C --> C4[Deployment]
    C --> C5[Testing]
    
    D --> D1[Account Setup]
    D --> D2[Emotion Capture]
    D --> D3[Music Discovery]
    D --> D4[History Management]
    D --> D5[Profile Settings]
    
    E --> E1[Authentication APIs]
    E --> E2[History APIs]
    E --> E3[Music APIs]
    E --> E4[User APIs]
```

### Content Organization

#### Navigation Structure

| Section | Subsections | Priority |
|---------|------------|----------|
| Introduction | Overview, Features, Technology Stack | High |
| Getting Started | Prerequisites, Installation, Configuration, First Run | High |
| Technical Docs | Environment Setup, Project Structure, Architecture, Cloud Deployment | High |
| User Manual | Registration, Emotion Capture, Music Recommendations, History, Export | High |
| API Reference | Authentication, History, Music, User Profile | Medium |
| Development | Contributing, Testing, Code Standards, Debugging | Medium |
| Deployment | Local Setup, Docker, AWS, Vercel | High |
| Troubleshooting | Common Issues, FAQ, Support | Medium |

### Technical Documentation Content

#### Development Environment Section

**Purpose**: Guide developers through local setup

**Content Structure**:

**1. System Requirements**
- Operating system compatibility (Windows, macOS, Linux)
- Node.js version requirement (18+)
- Package manager (pnpm recommended)
- Optional tools (Docker, Git)

**2. Framework and Libraries**

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Frontend Framework | Next.js | 15.5.0 | React framework with App Router |
| UI Library | React | 19.1.0 | Component-based UI development |
| Language | TypeScript | 5.x | Type-safe development |
| Styling | Tailwind CSS | 4.x | Utility-first CSS framework |
| AI/ML | face-api.js | 0.22.2 | Facial emotion detection |
| AI/ML Runtime | TensorFlow.js | - | Browser-based ML inference |
| Charts | Chart.js + react-chartjs-2 | 4.5.0 / 5.3.0 | Data visualization |
| Authentication | NextAuth.js | 4.24.11 | OAuth and session management |
| HTTP Client | Axios | 1.11.0 | API requests |
| Forms | React Hook Form | 7.62.0 | Form state management |
| Validation | Zod | 4.0.17 | Schema validation |
| Database ORM | Prisma | 6.14.0 | Database access layer |
| Testing Framework | Jest | 29.7.0 | Unit and integration testing |
| Component Testing | React Testing Library | 16.3.0 | React component testing |
| HTTP Testing | Supertest | Latest | API endpoint testing |

**3. Development Tools**

| Tool | Purpose | Configuration File |
|------|---------|-------------------|
| ESLint | Code linting and style enforcement | `eslint.config.mjs` |
| TypeScript Compiler | Type checking and compilation | `tsconfig.json` |
| PostCSS | CSS processing | `postcss.config.mjs` |
| Next.js Config | Framework configuration | `next.config.ts` |
| Jest | Test configuration | `jest.config.js` |
| Prisma | Database schema and migrations | `prisma/schema.prisma` |

**4. Environment Variables**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| NEXTAUTH_URL | Yes | Application base URL | `http://localhost:3000` |
| NEXTAUTH_SECRET | Yes | Session encryption key | Generate with `openssl rand -base64 32` |
| NEXT_PUBLIC_SPOTIFY_CLIENT_ID | Yes | Spotify app client ID | From Spotify Developer Dashboard |
| SPOTIFY_CLIENT_SECRET | Yes | Spotify app secret | From Spotify Developer Dashboard |
| DATABASE_URL | No | Database connection string | `postgresql://user:pass@localhost:5432/moodify` |
| REDIS_URL | No | Redis connection for sessions | `redis://localhost:6379` |

#### Project Structure Section

**Purpose**: Explain code organization and file conventions

**Directory Layout Documentation**:

```
moodify-frontend/
│
├── src/                          # Source code root
│   ├── app/                      # Next.js App Router
│   │   ├── (routes)/            # Route groups
│   │   │   ├── auth/            # Authentication pages
│   │   │   │   ├── login/       # Login page
│   │   │   │   ├── register/    # Registration page
│   │   │   │   └── profile/     # User profile page
│   │   │   ├── capture/         # Emotion capture interface
│   │   │   ├── dashboard/       # Analytics dashboard
│   │   │   ├── history/         # User history view
│   │   │   └── recommendations/ # Music recommendations
│   │   └── api/                 # API routes
│   │       ├── auth/            # Authentication endpoints
│   │       ├── history/         # History CRUD endpoints
│   │       ├── music/           # Music-related endpoints
│   │       ├── recommendations/ # Recommendation engine
│   │       ├── user/            # User management
│   │       └── health/          # Health check endpoint
│   │
│   ├── components/              # React components
│   │   ├── analytics/          # Chart and analytics components
│   │   ├── auth/               # Authentication forms
│   │   ├── camera/             # Webcam and image upload
│   │   ├── emotion/            # Emotion display components
│   │   ├── history/            # History list and filters
│   │   ├── layout/             # Layout components (header, footer, nav)
│   │   ├── music/              # Music player and track cards
│   │   ├── providers/          # React context providers
│   │   └── ui/                 # Reusable UI components
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useHistory.ts       # History management hook
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── chartConfig.ts      # Chart.js configuration
│   │   ├── emotionDetection.ts # Face-API.js wrapper
│   │   ├── historyService.ts   # History data management
│   │   ├── spotify.ts          # Spotify API client
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── utils.ts            # Shared utilities
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts            # Shared types
│   │   ├── env.d.ts            # Environment variable types
│   │   └── next-auth.d.ts      # NextAuth type extensions
│   │
│   └── middleware.ts            # Next.js middleware (auth protection)
│
├── __tests__/                   # Test suites
│   ├── api/                    # API integration tests
│   ├── components/             # Component unit tests
│   ├── lib/                    # Utility function tests
│   └── e2e/                    # End-to-end tests
│
├── public/                      # Static assets
│   ├── models/                 # Face-API.js ML models
│   └── images/                 # Static images
│
├── fumadocs-moodify/           # Documentation site
│   ├── app/                    # Fumadocs Next.js app
│   ├── content/                # MDX documentation content
│   └── public/                 # Documentation assets
│
├── infrastructure/              # Cloud infrastructure
│   └── ecs-task-definition.json # AWS ECS configuration
│
├── scripts/                     # Utility scripts
│   └── deploy.sh               # Deployment automation
│
├── .env.local                   # Local environment variables
├── .env.example                # Environment template
├── docker-compose.yml          # Docker services configuration
├── Dockerfile                  # Production container image
├── jest.config.js              # Test configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml             # Dependency lock file
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project overview
```

**Code Organization Principles**:
- Feature-based organization within `components/`
- API routes mirror feature structure
- Shared utilities in `lib/`
- Type definitions co-located with usage
- Test files mirror source structure

#### Architecture Section

**Purpose**: Visualize system design and component relationships

**System Architecture Diagram**:

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[React Application]
        C[Next.js App Router]
    end
    
    subgraph "Presentation Layer"
        D[UI Components]
        E[Emotion Capture Interface]
        F[Music Player]
        G[Analytics Dashboard]
    end
    
    subgraph "State Management"
        H[React Hooks]
        I[Session Provider]
        J[Local Storage]
    end
    
    subgraph "API Layer"
        K[Next.js API Routes]
        L[Authentication API]
        M[History API]
        N[Music API]
        O[User API]
    end
    
    subgraph "Service Layer"
        P[Emotion Detection Service]
        Q[Spotify Service]
        R[History Service]
        S[Authentication Service]
    end
    
    subgraph "External Services"
        T[Spotify Web API]
        U[Face-API.js Models]
        V[NextAuth Providers]
    end
    
    subgraph "Data Layer"
        W[Browser LocalStorage]
        X[(Optional: PostgreSQL)]
        Y[(Optional: Redis Cache)]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I
    H --> J
    
    B --> K
    K --> L
    K --> M
    K --> N
    K --> O
    
    L --> S
    M --> R
    N --> Q
    O --> S
    
    P --> U
    Q --> T
    S --> V
    
    R --> W
    S --> X
    Q --> Y
```

**Component Interaction Flow**:

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant EmotionCapture
    participant FaceAPI
    participant API
    participant SpotifyService
    participant SpotifyAPI
    
    User->>Browser: Access /capture page
    Browser->>EmotionCapture: Render component
    EmotionCapture->>User: Request camera permission
    User->>EmotionCapture: Grant permission
    EmotionCapture->>Browser: Display webcam feed
    
    User->>EmotionCapture: Click "Detect Emotion"
    EmotionCapture->>FaceAPI: Process image frame
    FaceAPI->>FaceAPI: Load ML models
    FaceAPI->>FaceAPI: Detect faces and emotions
    FaceAPI-->>EmotionCapture: Return emotion data
    
    EmotionCapture->>API: POST /api/history (save emotion)
    API->>API: Validate data
    API-->>EmotionCapture: Confirm saved
    
    EmotionCapture->>API: POST /api/music/recommendations
    API->>SpotifyService: Get recommendations for emotion
    SpotifyService->>SpotifyAPI: Search tracks by audio features
    SpotifyAPI-->>SpotifyService: Return track list
    SpotifyService-->>API: Formatted recommendations
    API-->>EmotionCapture: Return music list
    
    EmotionCapture->>Browser: Display recommendations
    User->>Browser: Play track preview
```

**Cloud Deployment Architecture** (AWS):

```mermaid
graph TB
    subgraph "AWS Cloud Infrastructure"
        subgraph "Compute"
            A[Application Load Balancer]
            B[ECS Fargate Cluster]
            C[ECS Task 1]
            D[ECS Task 2]
        end
        
        subgraph "Storage & Database"
            E[S3 Bucket - Static Assets]
            F[RDS PostgreSQL - Optional]
            G[ElastiCache Redis - Sessions]
        end
        
        subgraph "Networking"
            H[VPC]
            I[Public Subnet]
            J[Private Subnet]
            K[NAT Gateway]
        end
        
        subgraph "Security"
            L[Security Groups]
            M[IAM Roles]
            N[Secrets Manager]
        end
        
        subgraph "Monitoring"
            O[CloudWatch Logs]
            P[CloudWatch Metrics]
            Q[X-Ray Tracing]
        end
    end
    
    subgraph "External Services"
        R[Spotify API]
        S[Client Browsers]
    end
    
    S --> A
    A --> B
    B --> C
    B --> D
    
    C --> E
    D --> E
    C --> F
    D --> F
    C --> G
    D --> G
    
    C --> R
    D --> R
    
    A --> I
    C --> J
    D --> J
    J --> K
    K --> I
    
    C --> O
    D --> O
    C --> P
    D --> P
    
    L --> A
    L --> C
    L --> D
    M --> C
    M --> D
    N --> C
    N --> D
```

#### Deployment Instructions

**Purpose**: Provide step-by-step deployment procedures

**Local Development Deployment**:

1. **Prerequisites Verification**
   - Node.js 18+ installed
   - pnpm package manager installed
   - Git repository cloned

2. **Dependency Installation**
   - Navigate to project directory
   - Execute: `pnpm install`
   - Wait for completion (approximately 2-3 minutes)

3. **Environment Configuration**
   - Copy `.env.example` to `.env.local`
   - Obtain Spotify API credentials from Developer Dashboard
   - Generate NextAuth secret using: `openssl rand -base64 32`
   - Fill in all required variables

4. **Database Setup** (Optional)
   - Install PostgreSQL locally or use Docker
   - Update `DATABASE_URL` in `.env.local`
   - Run: `pnpm db:push` to create schema
   - Run: `pnpm db:seed` to populate test data

5. **Development Server Launch**
   - Execute: `pnpm dev`
   - Application starts on port 3000
   - Access via: `http://localhost:3000`

6. **Verification Steps**
   - Health check: `http://localhost:3000/api/health`
   - Test authentication flow
   - Verify webcam access
   - Test emotion detection

**Docker Local Deployment**:

1. **Docker Installation Verification**
   - Ensure Docker and Docker Compose installed
   - Verify with: `docker --version` and `docker-compose --version`

2. **Environment File Preparation**
   - Copy `.env.example` to `.env`
   - Configure all required variables

3. **Build and Run**
   - Execute: `docker-compose up --build`
   - Wait for image build (first time: 5-10 minutes)
   - Application starts in production mode

4. **Service Verification**
   - Main app: `http://localhost:3000`
   - Redis: `localhost:6379`
   - Health check: `http://localhost:3000/api/health`

5. **Container Management**
   - Stop: `docker-compose down`
   - Rebuild: `docker-compose build --no-cache`
   - Logs: `docker-compose logs -f`

**AWS Cloud Deployment**:

**Architecture Components**:
- ECS Fargate for containerized application
- Application Load Balancer for traffic distribution
- RDS PostgreSQL for database (optional)
- ElastiCache Redis for sessions
- S3 for static assets
- CloudWatch for logging and monitoring

**Deployment Steps**:

1. **AWS Account Setup**
   - Create AWS account or use existing
   - Configure AWS CLI with credentials
   - Set default region

2. **ECR Repository Creation**
   - Create ECR repository for Docker images
   - Obtain repository URI
   - Authenticate Docker to ECR

3. **Docker Image Build and Push**
   - Build production image: `docker build -t moodify-frontend .`
   - Tag image: `docker tag moodify-frontend:latest <ECR_URI>:latest`
   - Push image: `docker push <ECR_URI>:latest`

4. **VPC and Networking Setup**
   - Create VPC with public and private subnets
   - Configure Internet Gateway
   - Set up NAT Gateway for private subnet
   - Create security groups for ALB and ECS

5. **RDS Database Setup** (Optional)
   - Create PostgreSQL RDS instance
   - Configure security group for ECS access
   - Update DATABASE_URL in Secrets Manager

6. **ElastiCache Redis Setup**
   - Create Redis cluster
   - Configure security group for ECS access
   - Update REDIS_URL in Secrets Manager

7. **ECS Cluster Creation**
   - Create ECS cluster (Fargate launch type)
   - Define task definition (use provided JSON template)
   - Configure environment variables from Secrets Manager
   - Set resource allocation (CPU: 512, Memory: 1024)

8. **Application Load Balancer Setup**
   - Create ALB in public subnets
   - Configure target group (port 3000, health check path: `/api/health`)
   - Set up listener rules (HTTP on port 80, HTTPS on 443)
   - Configure SSL certificate (AWS Certificate Manager)

9. **ECS Service Creation**
   - Create service in ECS cluster
   - Attach to target group
   - Configure auto-scaling (min: 2, max: 10 tasks)
   - Set deployment configuration (rolling update)

10. **Domain and DNS Configuration**
    - Point domain to ALB DNS name
    - Update NEXTAUTH_URL environment variable
    - Configure Route 53 for custom domain

11. **Monitoring Setup**
    - Enable CloudWatch Logs for container logs
    - Create CloudWatch alarms for critical metrics
    - Set up SNS notifications for alerts

12. **Deployment Verification**
    - Access application via ALB DNS or custom domain
    - Test all core functionality
    - Review CloudWatch logs for errors
    - Monitor performance metrics

**Vercel Deployment** (Alternative):

1. **Account Setup**
   - Create Vercel account
   - Install Vercel CLI: `pnpm install -g vercel`

2. **Project Import**
   - Link repository to Vercel dashboard
   - Or use CLI: `vercel link`

3. **Environment Variables Configuration**
   - Add all `.env.local` variables in Vercel dashboard
   - Or use CLI: `vercel env add`

4. **Deployment Execution**
   - Push to main branch (automatic deployment)
   - Or use CLI: `vercel --prod`

5. **Domain Configuration**
   - Add custom domain in Vercel dashboard
   - Update NEXTAUTH_URL

6. **Verification**
   - Access deployed URL
   - Test all features
   - Review deployment logs

**Production Environment Variables**:

| Variable | Value Source | Example |
|----------|-------------|---------|
| NEXTAUTH_URL | Custom domain or ALB DNS | `https://moodify.example.com` |
| NEXTAUTH_SECRET | Generated secure random string | From `openssl rand -base64 32` |
| NEXT_PUBLIC_SPOTIFY_CLIENT_ID | Spotify Developer Dashboard | `abc123def456` |
| SPOTIFY_CLIENT_SECRET | Spotify Developer Dashboard | Stored in Secrets Manager |
| DATABASE_URL | RDS connection string | `postgresql://user:pass@rds-endpoint:5432/moodify` |
| REDIS_URL | ElastiCache endpoint | `redis://elasticache-endpoint:6379` |
| NODE_ENV | Static value | `production` |

### User Manual Content

#### Purpose

Provide step-by-step guidance for end users with visual aids

#### Account Setup Section

**Registration Process**:

**Step 1: Access Registration Page**
- Navigate to application homepage
- Click "Sign Up" or "Create Account" button
- Screenshot: Homepage with registration button highlighted

**Step 2: Enter User Information**
- Fill in email address (valid format required)
- Create password (minimum 8 characters, must include uppercase, lowercase, number)
- Re-enter password for confirmation
- Screenshot: Registration form with example data

**Step 3: Submit Registration**
- Click "Register" button
- Wait for account creation
- Receive confirmation message
- Screenshot: Success message

**Spotify Account Linking**:

**Step 1: Initiate Spotify Connection**
- Navigate to profile settings
- Click "Connect Spotify Account" button
- Screenshot: Profile page with Spotify integration section

**Step 2: Authorize Application**
- Redirected to Spotify login page
- Enter Spotify credentials
- Review requested permissions
- Click "Agree" or "Authorize"
- Screenshot: Spotify authorization dialog

**Step 3: Verify Connection**
- Redirected back to application
- See "Connected" status in profile
- View connected Spotify username
- Screenshot: Successfully linked account status

#### Emotion Capture Section

**Webcam Capture Process**:

**Step 1: Access Capture Page**
- Click "Capture Emotion" in navigation menu
- Grant camera permissions when prompted
- Screenshot: Camera permission dialog

**Step 2: Position Face**
- Center face in webcam preview
- Ensure good lighting
- Maintain neutral expression initially
- Screenshot: Webcam feed with face detection overlay

**Step 3: Capture Emotion**
- Display desired emotion naturally
- Click "Detect Emotion" button
- Wait for AI analysis (2-3 seconds)
- Screenshot: Emotion being detected

**Step 4: View Results**
- See primary emotion detected (e.g., "Happy")
- View confidence score (percentage)
- See all emotion percentages breakdown
- Screenshot: Emotion detection results display

**Photo Upload Process**:

**Step 1: Switch to Upload Mode**
- Click "Upload Photo" tab
- Select photo from device
- Supported formats: JPG, PNG (max 5MB)

**Step 2: Preview and Analyze**
- Review uploaded photo preview
- Click "Analyze Emotion" button
- Wait for processing

**Step 3: View Results**
- Same result format as webcam capture
- Screenshot: Photo upload results

#### Music Discovery Section

**Automatic Recommendations**:

**After Emotion Detection**:
- Recommendations automatically generated
- See list of 10-20 suggested tracks
- Each track shows: album art, title, artist, preview
- Screenshot: Recommendation list view

**Track Interaction**:

**Preview Playback**:
- Click play button on track card
- 30-second preview plays
- Pause/resume controls available
- Screenshot: Track card with playing status

**Open in Spotify**:
- Click "Open in Spotify" button
- Redirects to Spotify app or web player
- Requires Spotify account login
- Screenshot: Spotify button highlighted

**Save to History**:
- Recommendations automatically saved
- Access from History page
- Screenshot: Saved recommendation confirmation

**Manual Music Search**:

**Step 1: Access Search**
- Navigate to Recommendations page
- Click "Search Music" tab
- Screenshot: Search interface

**Step 2: Enter Search Query**
- Type artist name, song title, or genre
- Click search button
- View results

**Step 3: Filter by Mood**
- Use mood filter dropdown
- Select emotion category
- Results update automatically
- Screenshot: Filtered search results

#### History Management Section

**Viewing History**:

**Access History Page**:
- Click "History" in navigation
- See chronological list of entries
- Screenshot: History page overview

**Entry Types**:
- Emotion Detection Records: Date, time, emotion, confidence
- Music Recommendation Records: Date, time, emotion, track list
- Screenshot: Both entry types displayed

**Filtering and Sorting**:

**Filter by Emotion**:
- Click emotion filter dropdown
- Select specific emotion (e.g., "Happy")
- View filtered results
- Screenshot: Filter controls

**Filter by Date Range**:
- Click date range selector
- Choose start and end dates
- Apply filter
- Screenshot: Date filter interface

**Sort Options**:
- Sort by newest/oldest
- Sort by confidence score
- Sort by emotion type
- Screenshot: Sort dropdown menu

**Data Export**:

**Export to JSON**:
- Click "Export Data" button
- Select "JSON Format"
- Download begins automatically
- File name: `moodify-history-YYYY-MM-DD.json`
- Screenshot: Export options dialog

**Export to CSV**:
- Click "Export Data" button
- Select "CSV Format"
- Open in spreadsheet software
- Columns: Date, Time, Emotion, Confidence, Tracks
- Screenshot: Exported CSV in Excel

**Deleting History**:

**Delete Single Entry**:
- Hover over history entry
- Click delete icon (trash can)
- Confirm deletion in popup
- Entry removed immediately
- Screenshot: Delete confirmation dialog

**Clear All History**:
- Click "Clear All History" button
- Read warning message
- Type confirmation text
- Click "Permanently Delete"
- Screenshot: Clear all warning

#### Profile Settings Section

**Profile Information**:

**Edit Display Name**:
- Navigate to Profile page
- Click "Edit" next to display name
- Enter new name
- Click "Save"
- Screenshot: Name editing mode

**Update Email**:
- Click "Change Email" button
- Enter new email address
- Receive verification email
- Click verification link
- Email updated
- Screenshot: Email change form

**Change Password**:
- Click "Change Password" button
- Enter current password
- Enter new password (twice)
- Click "Update Password"
- Screenshot: Password change form

**Privacy Settings**:

**History Visibility**:
- Toggle "Make history private" switch
- When enabled: History not shared with any integrations
- Screenshot: Privacy toggle

**Data Retention**:
- Select retention period (30 days, 90 days, 1 year, indefinite)
- Old data automatically deleted
- Screenshot: Retention dropdown

**Notification Preferences**:

**Email Notifications**:
- Toggle notification types: Weekly summary, New feature announcements, Tips and insights
- Save preferences
- Screenshot: Notification settings

**Spotify Integration Settings**:

**Manage Connection**:
- View connected account details
- Refresh access token
- Disconnect Spotify account
- Screenshot: Spotify integration panel

**Playlist Preferences**:
- Enable "Auto-create playlists from recommendations"
- Set playlist privacy (public/private)
- Screenshot: Playlist settings

### API Reference Documentation

#### Purpose

Provide comprehensive API documentation for developers integrating with or extending Moodify

#### Authentication API

**Endpoint**: `/api/auth/login`

**Method**: POST

**Description**: Authenticates user with email and password

**Request Schema**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email format | User's registered email address |
| password | string | Yes | Minimum 8 characters | User's password |

**Request Example**:
```
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response Schema (Success - 200)**:

| Field | Type | Description |
|-------|------|-------------|
| user | object | User information |
| user.id | string | Unique user identifier |
| user.email | string | User's email address |
| user.name | string | Display name |
| session | object | Session information |
| session.token | string | JWT authentication token |
| session.expiresAt | string | ISO 8601 expiration timestamp |

**Response Example (Success)**:
```
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": "2025-02-15T12:00:00Z"
  }
}
```

**Error Responses**:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_REQUEST | Missing or malformed request body |
| 401 | INVALID_CREDENTIALS | Incorrect email or password |
| 429 | RATE_LIMIT_EXCEEDED | Too many login attempts |
| 500 | INTERNAL_ERROR | Server error during authentication |

**Error Response Example**:
```
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The email or password you entered is incorrect"
  }
}
```

---

**Endpoint**: `/api/auth/register`

**Method**: POST

**Description**: Creates new user account

**Request Schema**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email, unique | User's email address |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number | Desired password |
| name | string | Yes | 2-50 characters | Display name |

**Response Schema (Success - 201)**:

| Field | Type | Description |
|-------|------|-------------|
| user | object | Created user information |
| message | string | Success confirmation message |

**Error Responses**:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 409 | EMAIL_EXISTS | Email already registered |
| 500 | CREATION_FAILED | Failed to create account |

---

**Endpoint**: `/api/auth/callback/spotify`

**Method**: GET

**Description**: OAuth callback for Spotify integration

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Yes | Authorization code from Spotify |
| state | string | Yes | CSRF protection state parameter |

**Response**: Redirects to application with session cookie

#### History API

**Endpoint**: `/api/history`

**Method**: GET

**Description**: Retrieves user's emotion and recommendation history

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | number | No | 20 | Number of entries per page (max 100) |
| page | number | No | 1 | Page number (1-indexed) |
| type | string | No | all | Filter by type: 'emotion', 'recommendation', or 'all' |
| startDate | string | No | - | ISO 8601 start date filter |
| endDate | string | No | - | ISO 8601 end date filter |
| emotion | string | No | - | Filter by specific emotion |

**Response Schema (Success - 200)**:

| Field | Type | Description |
|-------|------|-------------|
| history | array | Array of history entries |
| pagination | object | Pagination metadata |
| pagination.total | number | Total number of entries |
| pagination.page | number | Current page number |
| pagination.limit | number | Entries per page |
| pagination.totalPages | number | Total number of pages |
| pagination.hasMore | boolean | Whether more pages exist |

**History Entry Schema**:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique entry identifier |
| type | string | 'emotion' or 'recommendation' |
| data | object | Entry-specific data |
| timestamp | string | ISO 8601 creation timestamp |

**Response Example**:
```
{
  "history": [
    {
      "id": "entry_123",
      "type": "emotion",
      "data": {
        "emotion": "happy",
        "confidence": 0.85,
        "allEmotions": {
          "happy": 0.85,
          "sad": 0.05,
          "angry": 0.03,
          "surprised": 0.04,
          "neutral": 0.02,
          "fear": 0.005,
          "disgust": 0.005
        }
      },
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

**Method**: POST

**Description**: Saves new emotion detection or recommendation to history

**Request Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | 'emotion' or 'recommendation' |
| data | object | Yes | Type-specific data object |

**Emotion Data Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| emotion | string | Yes | Primary detected emotion |
| confidence | number | Yes | Confidence score (0-1) |
| allEmotions | object | Yes | All emotion scores |

**Recommendation Data Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| emotion | string | Yes | Emotion used for recommendations |
| tracks | array | Yes | Array of recommended tracks |

**Response Schema (Success - 201)**:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Created entry identifier |
| message | string | Success confirmation |

---

**Method**: DELETE

**Description**: Deletes specific entry or clears all history

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | No | Entry ID to delete (if omitted, clears all) |

**Response Schema (Success - 200)**:

| Field | Type | Description |
|-------|------|-------------|
| message | string | Deletion confirmation |

**Error Responses**:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 404 | ENTRY_NOT_FOUND | Specified entry ID does not exist |

#### Music Recommendation API

**Endpoint**: `/api/music/recommendations`

**Method**: POST

**Description**: Generates music recommendations based on detected emotion

**Request Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| emotion | string | Yes | One of: happy, sad, angry, surprised, neutral, fear, disgust |
| limit | number | No | Number of recommendations (default 20, max 50) |

**Response Schema (Success - 200)**:

| Field | Type | Description |
|-------|------|-------------|
| emotion | string | Emotion used for recommendations |
| tracks | array | Array of track objects |

**Track Object Schema**:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Spotify track ID |
| name | string | Track title |
| artist | string | Artist name |
| album | string | Album name |
| imageUrl | string | Album artwork URL |
| previewUrl | string | 30-second preview MP3 URL (nullable) |
| spotifyUrl | string | Full Spotify track URL |
| audioFeatures | object | Audio analysis data |

**Audio Features Schema**:

| Field | Type | Description | Range |
|-------|------|-------------|-------|
| valence | number | Musical positivity | 0.0 - 1.0 |
| energy | number | Intensity and activity | 0.0 - 1.0 |
| danceability | number | Suitability for dancing | 0.0 - 1.0 |
| tempo | number | Beats per minute | Variable |

**Response Example**:
```
{
  "emotion": "happy",
  "tracks": [
    {
      "id": "spotify:track:123",
      "name": "Happy Song",
      "artist": "Artist Name",
      "album": "Album Title",
      "imageUrl": "https://i.scdn.co/image/abc123",
      "previewUrl": "https://p.scdn.co/preview/def456",
      "spotifyUrl": "https://open.spotify.com/track/123",
      "audioFeatures": {
        "valence": 0.85,
        "energy": 0.75,
        "danceability": 0.8,
        "tempo": 120
      }
    }
  ]
}
```

**Error Responses**:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_EMOTION | Unrecognized emotion value |
| 401 | SPOTIFY_AUTH_REQUIRED | User must connect Spotify account |
| 503 | SPOTIFY_UNAVAILABLE | Spotify API temporarily unavailable |

#### User Profile API

**Endpoint**: `/api/user/profile`

**Method**: GET

**Description**: Retrieves authenticated user's profile information

**Response Schema (Success - 200)**:

| Field | Type | Description |
|-------|------|-------------|
| id | string | User identifier |
| email | string | Email address |
| name | string | Display name |
| spotifyConnected | boolean | Spotify integration status |
| spotifyUsername | string | Connected Spotify username (nullable) |
| createdAt | string | Account creation timestamp |
| preferences | object | User preferences |

---

**Method**: PUT

**Description**: Updates user profile information

**Request Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | New display name |
| preferences | object | No | Preference updates |

**Response Schema (Success - 200)**:

| Field | Type | Description |
|-------|------|-------------|
| message | string | Update confirmation |
| user | object | Updated user object |

#### Health Check API

**Endpoint**: `/api/health`

**Method**: GET

**Description**: System health and dependency status check

**Response Schema**:

| Field | Type | Description |
|-------|------|-------------|
| status | string | Overall system status: 'healthy', 'degraded', 'unhealthy' |
| timestamp | string | ISO 8601 check timestamp |
| services | object | Individual service statuses |

**Services Object Schema**:

| Field | Type | Description |
|-------|------|-------------|
| spotify | string | Spotify API status: 'up', 'down', 'degraded' |
| storage | string | Storage system status |
| faceapi | string | ML model loading status |

**Response Example**:
```
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "services": {
    "spotify": "up",
    "storage": "up",
    "faceapi": "up"
  }
}
```

### Visual Assets Strategy

#### Screenshot Requirements

**Screenshot Checklist**:

| Page/Feature | Screenshot Type | Priority | Description |
|--------------|----------------|----------|-------------|
| Homepage | Full page | High | Landing page with hero section and CTA |
| Registration Form | Form closeup | High | Registration fields with example data |
| Login Page | Full page | High | Login interface |
| Spotify Authorization | Browser window | High | Spotify OAuth consent screen |
| Emotion Capture (Webcam) | Interface view | High | Webcam feed with face detection overlay |
| Emotion Results | Results panel | High | Detected emotion with confidence scores |
| Music Recommendations | List view | High | Recommended tracks display |
| Music Player | Player controls | Medium | Playing track interface |
| History Page | Full page | High | History list with entries |
| History Filters | Filter panel | Medium | Filter and sort controls |
| Export Options | Modal dialog | Medium | Export format selection |
| Profile Settings | Full page | Medium | Profile management interface |
| Analytics Dashboard | Dashboard view | Medium | Emotion trends charts |
| Mobile View | Mobile screenshot | Low | Responsive layout examples |

#### Diagram Requirements

**Diagrams to Include**:

1. **System Architecture Diagram** (Mermaid)
   - Client-server interaction
   - Component relationships
   - External service integrations

2. **Emotion Detection Flow** (Mermaid Sequence)
   - User interaction steps
   - Face API processing
   - Result delivery

3. **Music Recommendation Flow** (Mermaid Sequence)
   - Emotion input
   - Spotify API interaction
   - Response processing

4. **Authentication Flow** (Mermaid Sequence)
   - OAuth authorization
   - Token exchange
   - Session creation

5. **Cloud Deployment Architecture** (Mermaid)
   - AWS service topology
   - Network layout
   - Data flow

6. **Database Schema** (Mermaid ER Diagram)
   - User entity
   - History entity
   - Relationships

## Implementation Priorities

### Phase 1: Foundation (Week 1)

**Integration Testing Setup**:
- Install and configure Supertest
- Set up test environment configuration
- Create base test utilities and helpers
- Implement mock strategies for external APIs

**Fumadocs Setup**:
- Initialize Fumadocs project structure
- Configure content directories
- Set up navigation and routing
- Deploy documentation site

### Phase 2: Core Testing (Week 2)

**API Test Implementation**:
- History API complete test suite
- Authentication API tests
- Music recommendation API tests
- Health check API tests

**Technical Documentation**:
- Development environment guide
- Project structure documentation
- Architecture diagrams
- Local deployment instructions

### Phase 3: Advanced Features (Week 3)

**End-to-End Testing**:
- Complete user workflows
- Cross-service integration tests
- Error scenario coverage
- Performance testing

**User Manual Creation**:
- Account setup guide with screenshots
- Emotion capture walkthrough
- Music discovery tutorial
- History management instructions

### Phase 4: Completion (Week 4)

**Test Demonstration**:
- Prepare demonstration script
- Create demo environment
- Practice presentation flow
- Document common questions

**Documentation Finalization**:
- API reference completion
- Cloud deployment guide
- Troubleshooting section
- FAQ compilation
- Final review and publishing

## Success Metrics

### Integration Testing Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Test Coverage | ≥ 80% | Jest coverage report |
| API Endpoint Coverage | 100% | Manual checklist |
| Test Execution Time | < 30 seconds | Jest performance metrics |
| Test Success Rate | 100% | CI/CD pipeline results |
| Error Scenario Coverage | ≥ 90% | Error test count vs total scenarios |

### Documentation Quality Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Documentation Completeness | 100% | Section checklist coverage |
| Screenshot Quality | High resolution, annotated | Visual review |
| Code Example Accuracy | 100% working examples | Manual testing |
| User Task Coverage | All core features documented | Feature checklist |
| Search Functionality | Operational | Fumadocs search testing |
| Mobile Responsiveness | Fully responsive | Device testing |

## Risk Management

### Testing Risks

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| External API unavailability during tests | High | Comprehensive mocking, fallback strategies |
| Test data pollution | Medium | Isolated test environments, cleanup procedures |
| Slow test execution | Low | Parallel test execution, optimized test cases |
| Flaky tests | Medium | Proper async handling, stable test data |
| Incomplete error coverage | High | Systematic error scenario identification |

### Documentation Risks

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Outdated screenshots | Medium | Version tagging, regular update schedule |
| Missing deployment steps | High | Peer review, deployment testing |
| Unclear instructions | High | User testing, feedback incorporation |
| Broken links | Low | Automated link checking |
| Incorrect code examples | High | Automated testing of examples |
