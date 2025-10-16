/**
 * Emotion fixtures for testing emotion detection and related features
 */

export const validEmotions = {
  happy: {
    emotion: 'happy',
    confidence: 0.85,
    allEmotions: {
      happy: 0.85,
      sad: 0.05,
      angry: 0.03,
      surprised: 0.04,
      neutral: 0.02,
      fear: 0.005,
      disgust: 0.005,
    },
  },
  sad: {
    emotion: 'sad',
    confidence: 0.78,
    allEmotions: {
      happy: 0.02,
      sad: 0.78,
      angry: 0.08,
      surprised: 0.01,
      neutral: 0.05,
      fear: 0.04,
      disgust: 0.02,
    },
  },
  angry: {
    emotion: 'angry',
    confidence: 0.82,
    allEmotions: {
      happy: 0.01,
      sad: 0.06,
      angry: 0.82,
      surprised: 0.03,
      neutral: 0.04,
      fear: 0.02,
      disgust: 0.02,
    },
  },
  surprised: {
    emotion: 'surprised',
    confidence: 0.76,
    allEmotions: {
      happy: 0.12,
      sad: 0.02,
      angry: 0.01,
      surprised: 0.76,
      neutral: 0.05,
      fear: 0.03,
      disgust: 0.01,
    },
  },
  neutral: {
    emotion: 'neutral',
    confidence: 0.65,
    allEmotions: {
      happy: 0.15,
      sad: 0.08,
      angry: 0.04,
      surprised: 0.03,
      neutral: 0.65,
      fear: 0.03,
      disgust: 0.02,
    },
  },
  fear: {
    emotion: 'fear',
    confidence: 0.71,
    allEmotions: {
      happy: 0.01,
      sad: 0.12,
      angry: 0.05,
      surprised: 0.08,
      neutral: 0.03,
      fear: 0.71,
      disgust: 0.00,
    },
  },
  disgust: {
    emotion: 'disgust',
    confidence: 0.68,
    allEmotions: {
      happy: 0.01,
      sad: 0.04,
      angry: 0.15,
      surprised: 0.02,
      neutral: 0.10,
      fear: 0.00,
      disgust: 0.68,
    },
  },
}

export const invalidEmotions = {
  invalidEmotionType: {
    emotion: 'invalid_emotion',
    confidence: 0.8,
    allEmotions: {
      happy: 0.8,
      sad: 0.2,
      angry: 0,
      surprised: 0,
      neutral: 0,
      fear: 0,
      disgust: 0,
    },
  },
  confidenceOutOfRange: {
    emotion: 'happy',
    confidence: 1.5, // Should be between 0 and 1
    allEmotions: {
      happy: 0.8,
      sad: 0.2,
      angry: 0,
      surprised: 0,
      neutral: 0,
      fear: 0,
      disgust: 0,
    },
  },
  missingAllEmotions: {
    emotion: 'happy',
    confidence: 0.8,
    // Missing allEmotions field
  },
  incompleteAllEmotions: {
    emotion: 'happy',
    confidence: 0.8,
    allEmotions: {
      happy: 0.8,
      sad: 0.2,
      // Missing other emotions
    },
  },
  negativeConfidence: {
    emotion: 'happy',
    confidence: -0.5,
    allEmotions: {
      happy: 0.8,
      sad: 0.2,
      angry: 0,
      surprised: 0,
      neutral: 0,
      fear: 0,
      disgust: 0,
    },
  },
}

export const emotionToGenreMapping = {
  happy: {
    genres: ['pop', 'dance', 'upbeat', 'electronic'],
    audioFeatures: {
      valence: { min: 0.7, max: 1.0 },
      energy: { min: 0.6, max: 1.0 },
      danceability: { min: 0.6, max: 1.0 },
    },
  },
  sad: {
    genres: ['acoustic', 'indie', 'blues', 'singer-songwriter'],
    audioFeatures: {
      valence: { min: 0.0, max: 0.3 },
      energy: { min: 0.2, max: 0.4 },
      danceability: { min: 0.2, max: 0.5 },
    },
  },
  angry: {
    genres: ['rock', 'metal', 'punk', 'hard-rock'],
    audioFeatures: {
      valence: { min: 0.3, max: 0.6 },
      energy: { min: 0.7, max: 1.0 },
      danceability: { min: 0.4, max: 0.7 },
    },
  },
  surprised: {
    genres: ['electronic', 'experimental', 'indie-pop'],
    audioFeatures: {
      valence: { min: 0.5, max: 0.8 },
      energy: { min: 0.6, max: 0.9 },
      danceability: { min: 0.5, max: 0.8 },
    },
  },
  neutral: {
    genres: ['alternative', 'chill', 'ambient', 'indie'],
    audioFeatures: {
      valence: { min: 0.4, max: 0.6 },
      energy: { min: 0.3, max: 0.6 },
      danceability: { min: 0.4, max: 0.6 },
    },
  },
  fear: {
    genres: ['ambient', 'dark', 'electronic', 'soundtrack'],
    audioFeatures: {
      valence: { min: 0.1, max: 0.4 },
      energy: { min: 0.2, max: 0.5 },
      danceability: { min: 0.2, max: 0.4 },
    },
  },
  disgust: {
    genres: ['grunge', 'alternative', 'industrial', 'punk'],
    audioFeatures: {
      valence: { min: 0.2, max: 0.5 },
      energy: { min: 0.5, max: 0.7 },
      danceability: { min: 0.3, max: 0.6 },
    },
  },
}

export const faceApiMockResponses = {
  successfulDetection: [
    {
      detection: {
        box: {
          x: 100,
          y: 100,
          width: 200,
          height: 200,
        },
        score: 0.99,
      },
      expressions: {
        happy: 0.85,
        sad: 0.05,
        angry: 0.03,
        surprised: 0.04,
        neutral: 0.02,
        fear: 0.005,
        disgust: 0.005,
      },
    },
  ],
  noFaceDetected: [],
  multipleFaces: [
    {
      detection: {
        box: { x: 50, y: 50, width: 150, height: 150 },
        score: 0.98,
      },
      expressions: {
        happy: 0.7,
        sad: 0.1,
        angry: 0.05,
        surprised: 0.05,
        neutral: 0.08,
        fear: 0.01,
        disgust: 0.01,
      },
    },
    {
      detection: {
        box: { x: 300, y: 100, width: 180, height: 180 },
        score: 0.96,
      },
      expressions: {
        happy: 0.6,
        sad: 0.15,
        angry: 0.08,
        surprised: 0.07,
        neutral: 0.08,
        fear: 0.01,
        disgust: 0.01,
      },
    },
  ],
  lowConfidenceDetection: [
    {
      detection: {
        box: { x: 100, y: 100, width: 200, height: 200 },
        score: 0.45, // Low confidence
      },
      expressions: {
        happy: 0.3,
        sad: 0.25,
        angry: 0.15,
        surprised: 0.1,
        neutral: 0.15,
        fear: 0.03,
        disgust: 0.02,
      },
    },
  ],
}

export const emotionDetectionResults = {
  happy: {
    type: 'emotion',
    data: validEmotions.happy,
  },
  sad: {
    type: 'emotion',
    data: validEmotions.sad,
  },
  angry: {
    type: 'emotion',
    data: validEmotions.angry,
  },
  surprised: {
    type: 'emotion',
    data: validEmotions.surprised,
  },
  neutral: {
    type: 'emotion',
    data: validEmotions.neutral,
  },
  fear: {
    type: 'emotion',
    data: validEmotions.fear,
  },
  disgust: {
    type: 'emotion',
    data: validEmotions.disgust,
  },
}

export const emotionsList = [
  'happy',
  'sad',
  'angry',
  'surprised',
  'neutral',
  'fear',
  'disgust',
] as const

export type EmotionType = (typeof emotionsList)[number]
