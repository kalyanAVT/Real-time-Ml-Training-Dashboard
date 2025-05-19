"use client"

import type React from "react"
import { useDashboard } from "../context/DashboardContext"
import { Sidebar } from "./Sidebar"
import { MetricsCards } from "./MetricsCards"
import { Charts } from "./Charts"
import { ControlButtons } from "./ControlButtons"
import { InlineChatInterface } from "./InlineChatInterface"
import { ConfigModal } from "./ConfigModal"

export const Dashboard: React.FC = () => {
  const { isSidebarCollapsed } = useDashboard()

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />

      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
              Model Training Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Monitor your model training in real-time
            </p>
          </div>

          <ControlButtons />
          <MetricsCards />
          <Charts />
          <InlineChatInterface />
        </div>
      </main>

      <ConfigModal />
    </div>
  )
}
