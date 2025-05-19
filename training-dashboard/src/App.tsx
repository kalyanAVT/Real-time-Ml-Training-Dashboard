import type React from "react"
import { DashboardProvider } from "./context/DashboardContext"
import { ThemeProvider } from "./context/ThemeContext"
import { Dashboard } from "./components/Dashboard"

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <Dashboard />
      </DashboardProvider>
    </ThemeProvider>
  )
}

export default App
