"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { TrainingMetrics, AgentTip, ChatMessage, Config } from "../types"
import websocketService from "../services/websocket"
import { TrainingAPI } from "../services/api"

interface DashboardContextType {
  metrics: TrainingMetrics | null
  metricsHistory: TrainingMetrics[]
  agentTips: AgentTip[]
  chatMessages: ChatMessage[]
  config: Config | null
  isChatOpen: boolean
  isConfigOpen: boolean
  isSidebarCollapsed: boolean
  sendChatMessage: (message: string) => void
  startTraining: () => Promise<void>
  stopTraining: () => Promise<void>
  restartTraining: () => Promise<void>
  updateConfig: (config: Config) => Promise<void>
  toggleChat: () => void
  toggleConfig: () => void
  toggleSidebar: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null)
  const [metricsHistory, setMetricsHistory] = useState<TrainingMetrics[]>([])
  const [agentTips, setAgentTips] = useState<AgentTip[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [config, setConfig] = useState<Config | null>({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    optimizer: "adam",
    modelType: "resnet50",
    modelName: "default",
  })
  const [isChatOpen, setIsChatOpen] = useState(true) // Set to true by default
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Initialize WebSocket connections
  useEffect(() => {
    websocketService.connectTraining()
    websocketService.connectAgent()

    // Fetch initial config
    TrainingAPI.getConfig().then(setConfig).catch(console.error)

    // Clean up on unmount
    return () => {
      websocketService.disconnect()
    }
  }, [])

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeMetrics = websocketService.onTrainingMetrics((data) => {
      setMetrics(data)
      setMetricsHistory((prev) => {
        // Keep last 100 data points for performance
        const newHistory = [...prev, data]
        if (newHistory.length > 100) {
          return newHistory.slice(-100)
        }
        return newHistory
      })
    })

    const unsubscribeTips = websocketService.onAgentTip((data) => {
      setAgentTips((prev) => [data, ...prev])
    })

    const unsubscribeChat = websocketService.onChatMessage((data) => {
      setChatMessages((prev) => [...prev, data])
    })

    return () => {
      unsubscribeMetrics()
      unsubscribeTips()
      unsubscribeChat()
    }
  }, [])

  // Listen for keyboard shortcut to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        setIsChatOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // API functions
  const startTraining = async () => {
    try {
      await TrainingAPI.startTraining()
    } catch (error) {
      console.error("Failed to start training:", error)
    }
  }

  const stopTraining = async () => {
    try {
      await TrainingAPI.stopTraining()
    } catch (error) {
      console.error("Failed to stop training:", error)
    }
  }

  const restartTraining = async () => {
    try {
      await TrainingAPI.restartTraining()
    } catch (error) {
      console.error("Failed to restart training:", error)
    }
  }

  const updateConfig = async (newConfig: Config) => {
    try {
      await TrainingAPI.updateConfig(newConfig)
      setConfig(newConfig)
      setIsConfigOpen(false)
    } catch (error) {
      console.error("Failed to update config:", error)
    }
  }

  // UI toggle functions
  const toggleChat = () => setIsChatOpen((prev) => !prev)
  const toggleConfig = () => setIsConfigOpen((prev) => !prev)
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev)

  // Send chat message
  const sendChatMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }

    setChatMessages((prev) => [...prev, newMessage])
    websocketService.sendChatMessage(message)
  }

  const value = {
    metrics,
    metricsHistory,
    agentTips,
    chatMessages,
    config,
    isChatOpen,
    isConfigOpen,
    isSidebarCollapsed,
    sendChatMessage,
    startTraining,
    stopTraining,
    restartTraining,
    updateConfig,
    toggleChat,
    toggleConfig,
    toggleSidebar,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
