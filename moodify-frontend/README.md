# 🎭 Moodify - Music Recommendations Based on Your Emotions

[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

Discover music that matches your mood through facial emotion recognition technology. Moodify analyzes your emotions and recommends the perfect soundtrack for your feelings.

![Moodify Demo](docs/assets/demo-screenshot.png)

## ✨ Features

- 🎭 **Facial Emotion Detection** - AI-powered emotion analysis using face-api.js
- 🎵 **Smart Music Recommendations** - Personalized Spotify-based suggestions
- 📊 **Analytics Dashboard** - Beautiful charts showing your emotion trends
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🔐 **Secure Authentication** - OAuth integration with Spotify
- 💾 **Data Export** - Download your history in JSON/CSV format
- 🌙 **Real-time Analysis** - Instant emotion detection and music matching

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Spotify Developer Account (for API keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/moodify-frontend.git
   cd moodify-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
moodify-frontend/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── capture/        # Emotion capture
│   │   ├── dashboard/      # Analytics
│   │   └── history/        # User history
│   ├── components/         # React components
│   │   ├── analytics/      # Charts & graphs
│   │   ├── capture/        # Camera & detection
│   │   ├── music/          # Player & recommendations
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utilities & services
│   └── types/              # TypeScript definitions
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 🎯 How It Works

1. **Capture Your Mood** 📸
   - Take a photo or use your webcam
   - Our AI analyzes your facial expressions

2. **AI Analysis** 🤖
   - Advanced emotion detection with 7 emotion categories
   - Confidence scoring for accurate results

3. **Get Music** 🎵
   - Receive personalized Spotify recommendations
   - Music matched to your emotional state

4. **Track Your Journey** 📈
   - View your emotion history and trends
   - Export your data anytime

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling

### AI & Machine Learning
- **face-api.js** - Face detection and emotion recognition
- **TensorFlow.js** - Browser-based ML inference

### Authentication & APIs
- **NextAuth.js** - Secure authentication
- **Spotify Web API** - Music streaming integration

### Data Visualization
- **Chart.js** - Interactive charts and graphs
- **React Chart.js 2** - React wrapper for Chart.js

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **React Testing Library** - Component testing

## 📊 Supported Emotions

| Emotion | Description | Music Style |
|---------|-------------|-------------|
| 😊 Happy | Joy, contentment | Upbeat, pop, dance |
| 😢 Sad | Melancholy, sorrow | Acoustic, indie, blues |
| 😠 Angry | Frustration, rage | Rock, metal, punk |
| 😲 Surprised | Amazement, shock | Electronic, experimental |
| 😐 Neutral | Calm, balanced | Alternative, chill |
| 😨 Fear | Anxiety, worry | Ambient, dark |
| 🤢 Disgust | Distaste, aversion | Grunge, alternative |

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm test

# Test with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage
- ✅ Unit tests for all utilities and services
- ✅ Component testing with React Testing Library
- ✅ API integration tests
- ✅ End-to-end workflow testing

## 📚 API Reference

### OpenAPI Specification

Moodify includes a complete OpenAPI 3.1 specification for all API endpoints:

- **Specification File**: `openapi.yaml` (root directory)
- **Documentation**: See [OpenAPI Integration Guide](docs/api/OPENAPI_INTEGRATION.md)
- **Validation**: `npx @apidevtools/swagger-cli validate openapi.yaml`
- **Interactive Docs**: Available in Fumadocs integration

#### Quick API Overview

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/health` | GET | System health check | No |
| `/api/auth/register` | POST | User registration | No |
| `/api/user/profile` | GET, PUT | User profile management | Yes |
| `/api/history` | GET, POST, DELETE | Emotion/recommendation history | Yes |
| `/api/history/analytics` | GET | User analytics and insights | Yes |
| `/api/recommendations` | GET, POST | Music recommendations | Yes |
| `/api/music/search` | GET | Search Spotify tracks | Yes |
| `/api/music/tracks/{id}` | GET | Track details | Yes |

### Internal APIs

#### History API (`/api/history`)

```typescript
// Get user history
GET /api/history?limit=20&page=1&type=emotion

// Save new entry
POST /api/history
{
  "type": "emotion",
  "data": { "emotion": "happy", "confidence": 0.85 }
}

// Delete entry
DELETE /api/history?id=entry-id
```

#### Recommendations API (`/api/recommendations`)

```typescript
// Generate recommendations
POST /api/recommendations
{
  "emotion": "happy",
  "confidence": 0.92,
  "limit": 10,
  "userPreferences": {
    "genres": ["pop", "dance"],
    "excludeExplicit": false
  }
}

// Get recommendations by emotion
GET /api/recommendations?emotion=happy&limit=20
```

#### Analytics API (`/api/history/analytics`)

```typescript
// Get user analytics
GET /api/history/analytics?timeRange=30

// Response includes:
// - Total analyses and recommendations
// - Emotion distribution
// - Sentiment analysis
// - Weekly/daily trends
// - Music preferences
// - Activity patterns
```

### External Integrations

- **Spotify Web API** - Music recommendations and track data
- **Face-API.js Models** - Emotion detection and face analysis

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
```

## 🔧 Configuration

### Spotify API Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Copy Client ID and Client Secret to your `.env.local`

### Face-API.js Models

Models are automatically loaded from the `/public/models` directory:
- `tiny_face_detector_model-weights_manifest.json`
- `face_expression_model-weights_manifest.json`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Context

This project was developed as part of the Web Programming course (PROYECTO DE APLICACIÓN 2025S2) at Universidad de Costa Rica, Facultad de Ingeniería, Escuela de Ciencias de la Computación e Informática.

### Course Information
- **University**: Universidad de Costa Rica
- **Faculty**: Ingeniería
- **School**: Ciencias de la Computación e Informática
- **Course**: Web Programming 2025S2
- **Project Type**: Final Application Project

## 🙏 Acknowledgments

- **Face-API.js** - For excellent facial recognition technology
- **Spotify** - For comprehensive music API
- **Next.js Team** - For the amazing React framework
- **Universidad de Costa Rica** - For academic support and guidance

## 📞 Support

### Documentation
- [Technical Documentation](docs/technical-documentation.md)
- [User Manual](docs/user-manual.md)
- [API Reference](docs/api-reference.md)

### Getting Help
- 🐛 [Report a Bug](https://github.com/your-username/moodify-frontend/issues)
- 💡 [Request a Feature](https://github.com/your-username/moodify-frontend/issues)
- 📧 [Contact Team](mailto:your-email@example.com)

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Face-API.js GitHub](https://github.com/justadudewhohacks/face-api.js)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)

---

<div align="center">

**Made with ❤️ for music lovers and emotion enthusiasts**

[🌟 Star this project](https://github.com/your-username/moodify-frontend) if you found it helpful!

</div>