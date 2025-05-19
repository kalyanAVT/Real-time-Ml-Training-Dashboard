"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with a default theme that will be the same on server and client
  const [theme, setTheme] = useState<Theme>("dark")

  // Use a separate state to track if we've loaded the theme from storage/preferences
  const [themeLoaded, setThemeLoaded] = useState(false)

  // Initialize theme from localStorage or system preference after mount
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // Check system preference
      setTheme("dark")
    } else {
      setTheme("light")
    }

    setThemeLoaded(true)
  }, [])

  // Update document with current theme
  useEffect(() => {
    if (!themeLoaded) return

    const root = window.document.documentElement

    root.classList.remove("light", "dark")
    root.classList.add(theme)

    localStorage.setItem("theme", theme)
  }, [theme, themeLoaded])

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
