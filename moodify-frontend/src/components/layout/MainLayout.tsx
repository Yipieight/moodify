"use client"

import { ReactNode } from "react"
import { Navigation } from "./Navigation"
import { Footer } from "./Footer"

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

export function MainLayout({ children, className = "" }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}