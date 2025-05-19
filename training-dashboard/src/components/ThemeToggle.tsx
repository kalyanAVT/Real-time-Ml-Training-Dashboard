"use client"

import type React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useEffect, useState } from "react"

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show the toggle after component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, render a placeholder with the same dimensions to avoid layout shift
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Theme toggle"
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  )
}
