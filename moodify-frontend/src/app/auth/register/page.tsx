"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (status === "authenticated") {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to home link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-500 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to home
          </Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="ml-2 text-2xl font-bold text-gray-900">Moodify</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Start discovering music that matches your mood
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <RegisterForm />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-purple-600 hover:text-purple-500">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-purple-600 hover:text-purple-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}