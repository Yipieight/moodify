"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Loading } from "@/components/ui/Loading"
import { HistoryList } from "@/components/history/HistoryList"

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <MainLayout>
        <Loading message="Loading history..." />
      </MainLayout>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your History
          </h1>
          <p className="text-gray-600">
            Browse through your past emotion analyses and music discoveries
          </p>
        </div>

        {/* History List Component */}
        <HistoryList />
      </div>
    </MainLayout>
  )
}