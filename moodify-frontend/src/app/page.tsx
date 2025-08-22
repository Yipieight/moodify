"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { MainLayout } from "@/components/layout/MainLayout"
import { 
  CameraIcon, 
  ChartBarIcon, 
  ClockIcon, 
  MusicalNoteIcon, 
  UserGroupIcon, 
  FaceSmileIcon 
} from "@heroicons/react/24/outline"

export default function Home() {
  const { data: session } = useSession()

  const features = [
    {
      name: "Emotion Detection",
      description: "Advanced facial recognition technology to detect your current emotional state",
      icon: FaceSmileIcon,
    },
    {
      name: "Smart Recommendations",
      description: "Get personalized music suggestions based on your mood and preferences",
      icon: MusicalNoteIcon,
    },
    {
      name: "Track Your History",
      description: "View your emotion patterns and music discovery journey over time",
      icon: ClockIcon,
    },
    {
      name: "Analytics Dashboard",
      description: "Understand your emotional trends with beautiful charts and insights",
      icon: ChartBarIcon,
    },
  ]

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Music That Matches Your
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Mood</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover the perfect soundtrack for your emotions. Moodify uses advanced facial recognition 
              to analyze your mood and recommend music that resonates with how you feel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <>
                  <Link
                    href="/capture"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <CameraIcon className="w-5 h-5" />
                    <span>Start Mood Analysis</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-white hover:bg-gray-50 text-purple-600 font-semibold py-3 px-8 rounded-lg text-lg border-2 border-purple-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>View Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/auth/login"
                    className="bg-white hover:bg-gray-50 text-purple-600 font-semibold py-3 px-8 rounded-lg text-lg border-2 border-purple-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Moodify Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, powerful, and personalized music discovery through emotion recognition
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Three Simple Steps
            </h2>
            <p className="text-lg text-gray-600">
              From emotion to music in seconds
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Capture Your Mood
              </h3>
              <p className="text-gray-600">
                Take a photo or use your webcam to capture your current expression
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-600">
                Our AI analyzes your facial expressions to detect your emotional state
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Music
              </h3>
              <p className="text-gray-600">
                Receive personalized music recommendations that match your mood
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!session && (
        <div className="bg-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to discover your soundtrack?
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Join thousands of users who have discovered their perfect mood music
              </p>
              <Link
                href="/auth/register"
                className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-3 px-8 rounded-lg text-lg transition-colors inline-flex items-center space-x-2"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>Start Your Journey</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
