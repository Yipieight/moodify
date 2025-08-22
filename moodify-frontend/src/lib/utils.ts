import { type ClassValue, clsx } from "clsx"
import { EmotionType } from "@/types"

/**
 * Utility function for merging CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Get the color class for a given emotion
 */
export function getEmotionColor(emotion: EmotionType): string {
  const emotionColors: Record<EmotionType, string> = {
    happy: "text-yellow-500",
    sad: "text-blue-500", 
    angry: "text-red-500",
    surprised: "text-orange-500",
    neutral: "text-gray-500",
    fear: "text-purple-500",
    disgust: "text-green-500"
  }
  
  return emotionColors[emotion] || "text-gray-500"
}

/**
 * Get the background color class for a given emotion
 */
export function getEmotionBgColor(emotion: EmotionType): string {
  const emotionBgColors: Record<EmotionType, string> = {
    happy: "bg-yellow-100 border-yellow-200",
    sad: "bg-blue-100 border-blue-200",
    angry: "bg-red-100 border-red-200", 
    surprised: "bg-orange-100 border-orange-200",
    neutral: "bg-gray-100 border-gray-200",
    fear: "bg-purple-100 border-purple-200",
    disgust: "bg-green-100 border-green-200"
  }
  
  return emotionBgColors[emotion] || "bg-gray-100 border-gray-200"
}

/**
 * Format confidence percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

/**
 * Get emotion emoji
 */
export function getEmotionEmoji(emotion: EmotionType): string {
  const emotionEmojis: Record<EmotionType, string> = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    surprised: "😲", 
    neutral: "😐",
    fear: "😨",
    disgust: "🤢"
  }
  
  return emotionEmojis[emotion] || "😐"
}

/**
 * Get emotion description
 */
export function getEmotionDescription(emotion: EmotionType): string {
  const descriptions: Record<EmotionType, string> = {
    happy: "Feeling joyful and positive",
    sad: "Feeling down or melancholic", 
    angry: "Feeling irritated or frustrated",
    surprised: "Feeling amazed or shocked",
    neutral: "Feeling calm and balanced",
    fear: "Feeling anxious or worried",
    disgust: "Feeling repulsed or uncomfortable"
  }
  
  return descriptions[emotion] || "Unknown emotion"
}

/**
 * Determine if an emotion is positive, negative, or neutral
 */
export function getEmotionValence(emotion: EmotionType): "positive" | "negative" | "neutral" {
  const positiveEmotions: EmotionType[] = ["happy", "surprised"]
  const negativeEmotions: EmotionType[] = ["sad", "angry", "fear", "disgust"]
  
  if (positiveEmotions.includes(emotion)) return "positive"
  if (negativeEmotions.includes(emotion)) return "negative"
  return "neutral"
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(d)
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}