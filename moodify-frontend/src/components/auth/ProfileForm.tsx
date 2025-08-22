"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSession } from "next-auth/react"
import { LoadingSpinner } from "@/components/ui/Loading"
import { CameraIcon, UserCircleIcon } from "@heroicons/react/24/outline"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  musicPreferences: z.array(z.string()).optional(),
  favoriteGenres: z.array(z.string()).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

const MUSIC_GENRES = [
  "Rock", "Pop", "Hip Hop", "Electronic", "Classical", "Jazz", "Blues", 
  "Country", "Folk", "R&B", "Reggae", "Punk", "Metal", "Alternative", 
  "Indie", "Soul", "Funk", "House", "Techno", "Ambient"
]

export function ProfileForm({ onSuccess, onError }: ProfileFormProps) {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      bio: "",
      favoriteGenres: [],
    }
  })

  useEffect(() => {
    if (session?.user) {
      setValue("name", session.user.name || "")
      setValue("email", session.user.email || "")
      setProfileImage(session.user.image || null)
    }
  }, [session, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      // Update the profile data
      const updatedData = {
        ...data,
        favoriteGenres: selectedGenres,
      }

      // In a real application, you would call your profile update API here
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      // Update the session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          email: data.email,
        }
      })

      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile"
      setError("root", { message: errorMessage })
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real application, you would upload this to your storage service
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="w-24 h-24 text-gray-400" />
            )}
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-700 transition-colors"
            >
              <CameraIcon className="w-4 h-4 text-white" />
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-600">Click the camera icon to update your profile picture</p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            {...register("bio")}
            id="bio"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
              errors.bio ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Tell us a bit about yourself and your music taste..."
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        {/* Favorite Genres */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Favorite Music Genres
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MUSIC_GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  selectedGenres.includes(genre)
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Selected: {selectedGenres.length} genre{selectedGenres.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Global error */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : null}
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}