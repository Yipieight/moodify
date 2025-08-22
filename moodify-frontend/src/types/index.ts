// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Emotion Detection Types
export type EmotionType = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral' | 'fear' | 'disgust';

export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  timestamp: Date;
  imageUrl?: string;
  id?: string;
  userId?: string;
}

export interface FaceDetection {
  expressions: Record<EmotionType, number>;
  detection: {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

// Music Types
export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  previewUrl?: string;
  imageUrl?: string;
  spotifyUrl: string;
  popularity?: number;
}

export interface MusicRecommendation {
  id: string;
  userId: string;
  emotion: EmotionType;
  tracks: Track[];
  createdAt: Date;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Emotion Analysis State
export interface EmotionState {
  currentEmotion: EmotionResult | null;
  isAnalyzing: boolean;
  history: EmotionResult[];
  error: string | null;
}

// Music Recommendation State
export interface RecommendationState {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  emotion: EmotionType | null;
}

// Analytics Types
export interface EmotionData {
  date: string;
  emotions: Record<EmotionType, number>;
}

export interface AnalyticsData {
  totalAnalyses: number;
  averageEmotionsPerDay: number;
  mostCommonEmotion: EmotionType;
  positiveVsNegative: {
    positive: number;
    negative: number;
    neutral: number;
  };
  weeklyData: {
    date: string;
    count: number;
  }[];
  emotionTrends: EmotionData[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Component Props Types
export interface EmotionDisplayProps {
  emotions: EmotionResult[];
  primaryEmotion: EmotionType;
  confidence: number;
}

export interface MusicPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export interface RecommendationListProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  loading: boolean;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}