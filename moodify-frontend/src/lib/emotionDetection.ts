"use client"

import * as faceapi from 'face-api.js'
import { EmotionResult, EmotionType, FaceDetection } from '@/types'

export class EmotionDetectionService {
  private static instance: EmotionDetectionService
  private isInitialized = false
  private modelsLoaded = false

  private constructor() {}

  public static getInstance(): EmotionDetectionService {
    if (!EmotionDetectionService.instance) {
      EmotionDetectionService.instance = new EmotionDetectionService()
    }
    return EmotionDetectionService.instance
  }

  /**
   * Initialize face-api.js and load required models
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load models from public directory
      const MODEL_URL = '/models'
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ])

      this.modelsLoaded = true
      this.isInitialized = true
      console.log('Face-api.js models loaded successfully')
    } catch (error) {
      console.error('Failed to load face-api.js models:', error)
      throw new Error('Failed to initialize emotion detection')
    }
  }

  /**
   * Check if the service is ready for emotion detection
   */
  public isReady(): boolean {
    return this.isInitialized && this.modelsLoaded
  }

  /**
   * Detect emotions from an image element
   */
  public async detectEmotions(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<EmotionResult | null> {
    if (!this.isReady()) {
      throw new Error('Emotion detection service not initialized')
    }

    try {
      const detections = await faceapi
        .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

      if (detections.length === 0) {
        throw new Error('No face detected in the image')
      }

      // Use the first detected face
      const detection = detections[0]
      const expressions = detection.expressions

      // Find the emotion with highest confidence
      const emotions = Object.entries(expressions) as [string, number][]
      const [primaryEmotion, confidence] = emotions.reduce((max, current) => 
        current[1] > max[1] ? current : max
      )

      // Map face-api.js emotion names to our EmotionType
      const emotionMap: Record<string, EmotionType> = {
        'happy': 'happy',
        'sad': 'sad',
        'angry': 'angry',
        'surprised': 'surprised',
        'neutral': 'neutral',
        'fearful': 'fear',
        'disgusted': 'disgust'
      }

      const mappedEmotion = emotionMap[primaryEmotion] || 'neutral'

      const result: EmotionResult = {
        emotion: mappedEmotion,
        confidence: confidence,
        timestamp: new Date(),
      }

      return result
    } catch (error) {
      console.error('Emotion detection failed:', error)
      throw error
    }
  }

  /**
   * Detect emotions from a base64 image string
   */
  public async detectEmotionsFromBase64(base64Image: string): Promise<EmotionResult | null> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = async () => {
        try {
          const result = await this.detectEmotions(img)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = base64Image
    })
  }

  /**
   * Detect emotions from a file
   */
  public async detectEmotionsFromFile(file: File): Promise<EmotionResult | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string
          const result = await this.detectEmotionsFromBase64(base64)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Get detailed emotion data with all confidence scores
   */
  public async getDetailedEmotions(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<FaceDetection | null> {
    if (!this.isReady()) {
      throw new Error('Emotion detection service not initialized')
    }

    try {
      const detections = await faceapi
        .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

      if (detections.length === 0) {
        return null
      }

      const detection = detections[0]
      
      // Map face-api.js emotions to our types
      const emotionMap: Record<string, EmotionType> = {
        'happy': 'happy',
        'sad': 'sad',
        'angry': 'angry',
        'surprised': 'surprised',
        'neutral': 'neutral',
        'fearful': 'fear',
        'disgusted': 'disgust'
      }

      const mappedExpressions: Record<EmotionType, number> = {
        happy: detection.expressions.happy,
        sad: detection.expressions.sad,
        angry: detection.expressions.angry,
        surprised: detection.expressions.surprised,
        neutral: detection.expressions.neutral,
        fear: detection.expressions.fearful,
        disgust: detection.expressions.disgusted
      }

      return {
        expressions: mappedExpressions,
        detection: {
          box: {
            x: detection.detection.box.x,
            y: detection.detection.box.y,
            width: detection.detection.box.width,
            height: detection.detection.box.height,
          }
        }
      }
    } catch (error) {
      console.error('Detailed emotion detection failed:', error)
      throw error
    }
  }

  /**
   * Validate if an image contains a detectable face
   */
  public async validateFaceInImage(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<boolean> {
    if (!this.isReady()) {
      throw new Error('Emotion detection service not initialized')
    }

    try {
      const detections = await faceapi
        .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())

      return detections.length > 0
    } catch (error) {
      console.error('Face validation failed:', error)
      return false
    }
  }

  /**
   * Reset the service state - for testing purposes only
   */
  public resetForTest(): void {
    this.isInitialized = false;
    this.modelsLoaded = false;
  }
}

// Export a singleton instance
export const emotionDetectionService = EmotionDetectionService.getInstance()

// Create a legacy API for compatibility with tests
let modelsAlreadyLoaded = false;
export const emotionService = {
  /**
   * Load models for face detection (wrapper for initialize)
   */
  async loadModels(): Promise<void> {
    if (modelsAlreadyLoaded) {
      // Models already loaded, return early to prevent duplicate loading
      return;
    }
    await emotionDetectionService.initialize();
    modelsAlreadyLoaded = true;
  },

  /**
   * Reset the service state - for testing purposes only
   */
  resetServiceState(): void {
    modelsAlreadyLoaded = false;
    // Reset the underlying service as well using a new method
    emotionDetectionService.resetForTest();
  },

  /**
   * Analyze image for emotions (wrapper for detectEmotions)
   */
  async analyzeImage(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{ emotion: string; confidence: number; allEmotions: Record<string, number> }> {
    const result = await emotionDetectionService.detectEmotions(imageElement);
    if (!result) throw new Error('No emotion detected');
    
    // Get detailed expressions to return all emotions
    const detailed = await emotionDetectionService.getDetailedEmotions(imageElement);
    if (!detailed) throw new Error('Could not get detailed emotions');
    
    // Map the expressions to the format expected by tests
    const allEmotions: Record<string, number> = {
      happy: detailed.expressions.happy,
      sad: detailed.expressions.sad,
      angry: detailed.expressions.angry,
      surprised: detailed.expressions.surprised,
      neutral: detailed.expressions.neutral,
      fearful: detailed.expressions.fear,
      disgusted: detailed.expressions.disgust
    };
    
    return {
      emotion: result.emotion,
      confidence: result.confidence,
      allEmotions
    };
  },

  /**
   * Get dominant emotion from expressions
   */
  getDominantEmotion(expressions: Record<string, number>): { emotion: string; confidence: number } {
    const entries = Object.entries(expressions);
    if (entries.length === 0) {
      return { emotion: 'neutral', confidence: 0 };
    }
    
    const [emotion, confidence] = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    return { emotion, confidence };
  },

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return emotionDetectionService.isReady();
  }
};

// Helper function to download and setup face-api.js models
export const setupFaceApiModels = async (): Promise<void> => {
  // This function can be used to download models if they're not in public folder
  // For now, we assume models are placed in public/models directory
  console.log('Face-api.js models should be placed in /public/models directory')
  console.log('Required models:')
  console.log('- tiny_face_detector_model-weights_manifest.json')
  console.log('- face_landmark_68_model-weights_manifest.json')
  console.log('- face_recognition_model-weights_manifest.json')
  console.log('- face_expression_model-weights_manifest.json')
}