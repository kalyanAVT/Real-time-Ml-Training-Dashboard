// WebSocket message types
export interface TrainingMetrics {
  epoch: number
  accuracy: number
  loss: number
  status: "Ongoing" | "Idle" | "Completed"
  timestamp: string
}

export interface AgentTip {
  id: string
  message: string
  timestamp: string
  type: "info" | "warning" | "error" | "success"
}

export interface ChatMessage {
  id: string
  sender: "user" | "agent"
  content: string
  timestamp: string
}

export interface Config {
  learningRate: number
  batchSize: number
  epochs: number
  optimizer: string
  modelType: string
  modelName: string
  dataset?: {
    name: string
    path: string
    type: "csv" | "images" | "text" | "custom"
    size?: number
    format?: string
  }
}
