import type { Config } from "../types"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Allow configuring the API URL from environment variables or localStorage
const getApiBaseUrl = () => {
  // Only access localStorage in browser environment
  if (isBrowser) {
    // Check if we have a stored API URL in localStorage
    const storedUrl = localStorage.getItem("api_base_url")
    if (storedUrl) return storedUrl
  }

  // Default to localhost:8000
  return "http://localhost:8000"
}

// Check if demo mode is enabled
const isDemoMode = () => {
  if (isBrowser) {
    return localStorage.getItem("demo_mode") === "true"
  }
  return false
}

const API_BASE_URL = getApiBaseUrl()
const DEMO_MODE = isDemoMode()

export const TrainingAPI = {
  API_BASE_URL,

  setApiBaseUrl: (url: string) => {
    if (isBrowser) {
      localStorage.setItem("api_base_url", url)
      window.location.reload() // Reload to apply the new URL
    }
  },

  toggleDemoMode: (enabled: boolean) => {
    if (isBrowser) {
      localStorage.setItem("demo_mode", enabled.toString())
      window.location.reload() // Reload to apply the demo mode
    }
  },

  isDemoMode: () => DEMO_MODE,

  getApiBaseUrl: () => API_BASE_URL,

  startTraining: async () => {
    const response = await fetch(`${API_BASE_URL}/start-training`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to start training: ${response.statusText}`)
    }

    return await response.json()
  },

  stopTraining: async () => {
    const response = await fetch(`${API_BASE_URL}/stop-training`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to stop training: ${response.statusText}`)
    }

    return await response.json()
  },

  restartTraining: async () => {
    const response = await fetch(`${API_BASE_URL}/restart-training`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to restart training: ${response.statusText}`)
    }

    return await response.json()
  },

  getConfig: async (): Promise<Config> => {
    // If in demo mode, return mock data
    if (DEMO_MODE) {
      console.log("Running in demo mode - using mock config data")
      return {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
        optimizer: "adam",
        modelType: "resnet50",
        modelName: "default",
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/config`)

      if (!response.ok) {
        throw new Error(`Failed to get config: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching config:", error)
      // Return default config if fetch fails
      return {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
        optimizer: "adam",
        modelType: "resnet50",
        modelName: "default",
      }
    }
  },

  updateConfig: async (config: Config) => {
    const response = await fetch(`${API_BASE_URL}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      throw new Error(`Failed to update config: ${response.statusText}`)
    }

    return await response.json()
  },

  uploadDataset: async (file: File): Promise<{ path: string; name: string; type: string; size: number }> => {
    // If in demo mode, return mock data
    if (DEMO_MODE) {
      console.log("Running in demo mode - simulating file upload")
      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Determine dataset type based on file extension
      let datasetType = "custom"
      if (file.name.endsWith(".csv")) datasetType = "csv"
      else if (file.name.endsWith(".zip") && file.name.includes("image")) datasetType = "images"
      else if (file.name.endsWith(".txt") || file.name.endsWith(".json")) datasetType = "text"

      return {
        path: `/mock/datasets/${file.name}`,
        name: file.name,
        type: datasetType,
        size: file.size,
      }
    }

    try {
      const formData = new FormData()
      formData.append("dataset", file)

      const response = await fetch(`${API_BASE_URL}/upload-dataset`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to upload dataset: ${errorText || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Dataset upload error:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check if the backend is running or enable demo mode.",
        )
      }
      throw error
    }
  },

  uploadDatasetPath: async (path: string): Promise<{ path: string; name: string; type: string; size: number }> => {
    // If in demo mode, return mock data
    if (DEMO_MODE) {
      console.log("Running in demo mode - simulating path upload")
      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Extract filename from path
      const filename = path.split("/").pop() || "dataset"

      // Determine dataset type based on file extension
      let datasetType = "custom"
      if (path.endsWith(".csv")) datasetType = "csv"
      else if (path.endsWith(".zip") || path.includes("image")) datasetType = "images"
      else if (path.endsWith(".txt") || path.endsWith(".json")) datasetType = "text"

      return {
        path: path,
        name: filename,
        type: datasetType,
        size: 1024 * 1024, // Mock 1MB size
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload-dataset-path`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to use dataset path: ${errorText || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Dataset path error:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check if the backend is running or enable demo mode.",
        )
      }
      throw error
    }
  },

  getAvailableDatasets: async (): Promise<Array<{ name: string; path: string; type: string; size: number }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/available-datasets`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get available datasets: ${errorText || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching datasets:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Network error: Unable to connect to the server. Please check if the backend is running.")
      }
      throw error
    }
  },

  downloadModel: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/download-model`, {
        method: "GET",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to download model: ${errorText || response.statusText}`)
      }

      return response.blob()
    } catch (error) {
      console.error("Model download error:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Network error: Unable to connect to the server. Please check if the backend is running.")
      }
      throw error
    }
  },
}
