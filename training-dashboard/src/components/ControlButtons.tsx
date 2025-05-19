"use client"

import type React from "react"
import { useState } from "react"
import { Play, Square, RefreshCw, Settings, Download } from "lucide-react"
import { useDashboard } from "../context/DashboardContext"
import { ThemeToggle } from "./ThemeToggle"
import { DownloadModelModal } from "./DownloadModelModal"

export const ControlButtons: React.FC = () => {
  const { metrics, startTraining, stopTraining, restartTraining, toggleConfig } = useDashboard()
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)

  const isTraining = metrics?.status === "Ongoing"

  return (
    <div className="flex flex-wrap items-center justify-between mb-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={startTraining}
          disabled={isTraining}
          className={`flex items-center px-4 py-2 rounded-md text-white ${
            isTraining ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          <Play size={16} className="mr-2" />
          Start Training
        </button>

        <button
          onClick={stopTraining}
          disabled={!isTraining}
          className={`flex items-center px-4 py-2 rounded-md text-white ${
            !isTraining ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          <Square size={16} className="mr-2" />
          Stop Training
        </button>

        <button
          onClick={restartTraining}
          className="flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw size={16} className="mr-2" />
          Restart Training
        </button>

        <button
          onClick={toggleConfig}
          className="flex items-center px-4 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700"
        >
          <Settings size={16} className="mr-2" />
          Config
        </button>

        <button
          onClick={() => setIsDownloadModalOpen(true)}
          className="flex items-center px-4 py-2 rounded-md text-white bg-teal-600 hover:bg-teal-700"
        >
          <Download size={16} className="mr-2" />
          Download Model
        </button>
      </div>

      <ThemeToggle />

      <DownloadModelModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} />
    </div>
  )
}
