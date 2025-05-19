import type { TrainingMetrics, AgentTip, ChatMessage } from "../types"
import { TrainingAPI } from "./api"

type MessageHandler<T> = (data: T) => void

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

class WebSocketService {
  private trainingSocket: WebSocket | null = null
  private agentSocket: WebSocket | null = null
  private trainingMetricsHandlers: MessageHandler<TrainingMetrics>[] = []
  private agentTipHandlers: MessageHandler<AgentTip>[] = []
  private chatMessageHandlers: MessageHandler<ChatMessage>[] = []
  private reconnectTimeout: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private demoMode = false

  constructor() {
    // Only initialize WebSockets in browser environment
    if (!isBrowser) return

    this.demoMode = TrainingAPI.isDemoMode()
    this.initializeSampleChat()

    // If in demo mode, initialize demo data
    if (this.demoMode) {
      this.initializeDemoData()
    }
  }

  // Initialize training WebSocket
  connectTraining() {
    if (!isBrowser) return

    if (this.demoMode) {
      console.log("Demo mode: Training WebSocket simulation active")
      return
    }

    if (this.trainingSocket?.readyState === WebSocket.OPEN) return

    this.trainingSocket = new WebSocket("ws://localhost:8000/ws/train")

    this.trainingSocket.onopen = () => {
      console.log("Training WebSocket connected")
      this.reconnectAttempts = 0
    }

    this.trainingSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "metrics") {
          this.trainingMetricsHandlers.forEach((handler) => handler(data.payload))
        } else if (data.type === "tip") {
          this.agentTipHandlers.forEach((handler) => handler(data.payload))
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    this.trainingSocket.onclose = () => {
      console.log("Training WebSocket disconnected")
      this.handleReconnect("training")
    }

    this.trainingSocket.onerror = (error) => {
      console.error("Training WebSocket error:", error)
    }
  }

  // Initialize agent WebSocket
  connectAgent() {
    if (!isBrowser) return

    if (this.demoMode) {
      console.log("Demo mode: Agent WebSocket simulation active")
      return
    }

    if (this.agentSocket?.readyState === WebSocket.OPEN) return

    this.agentSocket = new WebSocket("ws://localhost:8000/ws/agent")

    this.agentSocket.onopen = () => {
      console.log("Agent WebSocket connected")
      this.reconnectAttempts = 0
    }

    this.agentSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // Ensure the sender is either "agent" or "user", defaulting to "agent" if invalid
        const validatedData: ChatMessage = {
          ...data,
          sender: data.sender === "user" ? "user" : "agent",
          id: data.id || Date.now().toString(),
          timestamp: data.timestamp || new Date().toISOString(),
        }
        this.chatMessageHandlers.forEach((handler) => handler(validatedData))
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    this.agentSocket.onclose = () => {
      console.log("Agent WebSocket disconnected")
      this.handleReconnect("agent")
    }

    this.agentSocket.onerror = (error) => {
      console.error("Agent WebSocket error:", error)
    }
  }

  // Handle reconnection logic
  private handleReconnect(socketType: "training" | "agent") {
    if (!isBrowser) return

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnect attempts reached for ${socketType} socket`)
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect ${socketType} socket...`)
      if (socketType === "training") {
        this.connectTraining()
      } else {
        this.connectAgent()
      }
    }, delay)
  }

  // Send message to agent
  sendChatMessage(message: string) {
    if (!isBrowser) return

    if (this.demoMode) {
      // In demo mode, simulate a response
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "user",
        content: message,
        timestamp: new Date().toISOString(),
      }

      // Notify handlers about the user message
      this.chatMessageHandlers.forEach((handler) => handler(userMessage))

      // Generate a response after a delay
      setTimeout(() => {
        const responses = [
          "I understand your question about the training process.",
          "The model is progressing well based on the metrics.",
          "You might want to adjust the learning rate for better results.",
          "The current dataset seems appropriate for this model type.",
          "Let me analyze the training metrics for you.",
        ]

        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toISOString(),
        }

        this.chatMessageHandlers.forEach((handler) => handler(agentMessage))
      }, 1000)

      return
    }

    if (this.agentSocket?.readyState === WebSocket.OPEN) {
      this.agentSocket.send(JSON.stringify({ content: message }))
    } else {
      console.error("Agent WebSocket not connected")
      this.connectAgent()
    }
  }

  // Subscribe to training metrics updates
  onTrainingMetrics(handler: MessageHandler<TrainingMetrics>) {
    this.trainingMetricsHandlers.push(handler)
    return () => {
      this.trainingMetricsHandlers = this.trainingMetricsHandlers.filter((h) => h !== handler)
    }
  }

  // Subscribe to agent tips
  onAgentTip(handler: MessageHandler<AgentTip>) {
    this.agentTipHandlers.push(handler)
    return () => {
      this.agentTipHandlers = this.agentTipHandlers.filter((h) => h !== handler)
    }
  }

  // Subscribe to chat messages
  onChatMessage(handler: MessageHandler<ChatMessage>) {
    this.chatMessageHandlers.push(handler)
    return () => {
      this.chatMessageHandlers = this.chatMessageHandlers.filter((h) => h !== handler)
    }
  }

  // Clean up connections
  disconnect() {
    if (!isBrowser) return

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.trainingSocket) {
      this.trainingSocket.close()
    }

    if (this.agentSocket) {
      this.agentSocket.close()
    }
  }

  // Initialize sample chat messages
  initializeSampleChat() {
    if (!isBrowser) return

    // Sample agent messages
    setTimeout(() => {
      const sampleMessages: ChatMessage[] = [
        {
          id: "agent-1",
          sender: "agent",
          content: "Hello! I'm your AI training assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ]

      sampleMessages.forEach((message) => {
        this.chatMessageHandlers.forEach((handler) => handler(message))
      })
    }, 1000)
  }

  // Add this method to initialize demo data
  private initializeDemoData() {
    if (!isBrowser) return

    console.log("Running in demo mode - using mock WebSocket data")

    // Generate sample training metrics
    let epoch = 0
    const maxEpochs = 100

    const generateMetrics = () => {
      if (epoch >= maxEpochs) return

      epoch++
      const accuracy = Math.min(0.5 + (epoch / maxEpochs) * 0.45 + Math.random() * 0.05, 1)
      const loss = Math.max(0.5 - (epoch / maxEpochs) * 0.45 + Math.random() * 0.05, 0.05)

      const metrics: TrainingMetrics = {
        epoch,
        accuracy,
        loss,
        status: epoch < maxEpochs ? "Ongoing" : ("Completed" as "Ongoing" | "Completed" | "Idle"),
        timestamp: new Date().toISOString(),
      }

      this.trainingMetricsHandlers.forEach((handler) => handler(metrics))

      // Generate a tip occasionally
      if (epoch % 10 === 0) {
        const tipTypes = ["info", "warning", "success"] as const
        const tipType = tipTypes[Math.floor(Math.random() * tipTypes.length)]
        const tip = {
          id: `tip-${Date.now()}`,
          message: `Demo tip at epoch ${epoch}: ${
            tipType === "info"
              ? "Model is training well"
              : tipType === "warning"
                ? "Learning rate might be too high"
                : "Good convergence observed"
          }`,
          timestamp: new Date().toISOString(),
          type: tipType,
        }

        this.agentTipHandlers.forEach((handler) => handler(tip))
      }

      // Continue if not at max epochs
      if (epoch < maxEpochs) {
        setTimeout(generateMetrics, 1000)
      }
    }

    // Start generating metrics after a delay
    setTimeout(generateMetrics, 2000)
  }
}

// Create singleton instance
const websocketService = new WebSocketService()
export default websocketService
