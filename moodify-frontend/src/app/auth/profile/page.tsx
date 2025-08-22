"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { ProfileForm } from "@/components/auth/ProfileForm"
import { Loading } from "@/components/ui/Loading"
import { UserIcon, ChartBarIcon, ClockIcon } from "@heroicons/react/24/outline"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profileUpdated, setProfileUpdated] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <MainLayout>
        <Loading message="Loading profile..." />
      </MainLayout>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect
  }

  const handleProfileUpdate = () => {
    setProfileUpdated(true)
    setTimeout(() => setProfileUpdated(false), 3000)
  }

  const handleProfileError = (error: string) => {
    console.error("Profile update error:", error)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account information and music preferences
          </p>
        </div>

        {/* Success message */}
        {profileUpdated && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">Profile updated successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-purple-600 bg-purple-50 rounded-lg p-3">
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Profile Information</span>
                </div>
                
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center space-x-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg p-3 transition-colors"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => router.push("/history")}
                  className="w-full flex items-center space-x-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg p-3 transition-colors"
                >
                  <ClockIcon className="w-5 h-5" />
                  <span>History</span>
                </button>
              </div>

              {/* Account Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Account Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span><br />
                    {session?.user?.email}
                  </p>
                  <p>
                    <span className="font-medium">Member since:</span><br />
                    {new Date().toLocaleDateString()} {/* TODO: Use actual join date */}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Personal Information
                </h2>
                <p className="text-gray-600">
                  Update your personal details and music preferences to get better recommendations.
                </p>
              </div>

              <ProfileForm 
                onSuccess={handleProfileUpdate}
                onError={handleProfileError}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}