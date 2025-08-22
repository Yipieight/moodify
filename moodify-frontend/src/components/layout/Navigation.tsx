"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ChartBarIcon,
  CameraIcon,
  ClockIcon,
  HomeIcon
} from "@heroicons/react/24/outline"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Capture", href: "/capture", icon: CameraIcon },
    { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
    { name: "History", href: "/history", icon: ClockIcon },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center touch-target">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 hidden xs:inline sm:inline">Moodify</span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {session && navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                } px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {session.user?.image ? (
                    <img
                      className="w-8 h-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || "User"}
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {session && navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`${
                  isActive(item.href)
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } block px-3 py-2 text-base font-medium rounded-md flex items-center space-x-2`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            {session ? (
              <button
                onClick={() => {
                  setIsOpen(false)
                  signOut()
                }}
                className="w-full text-left text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 text-base font-medium rounded-md"
              >
                Sign out
              </button>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 text-base font-medium rounded-md"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white block px-3 py-2 text-base font-medium rounded-md"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}