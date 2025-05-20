"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, FileText, ImageIcon, Database, Loader2, AlertCircle } from "lucide-react"
import { TrainingAPI } from "../services/api"
import type { Config } from "../types"

interface DatasetSelectorProps {
  config: Config
  onChange: (dataset: Config["dataset"]) => void
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({ config, onChange }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [availableDatasets, setAvailableDatasets] = useState<
    Array<{ name: string; path: string; type: string; size: number }>
  >([])
  const [showAvailableDatasets, setShowAvailableDatasets] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [datasetSource, setDatasetSource] = useState<"upload" | "path">("upload")
  const [filePath, setFilePath] = useState("")

  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Initialize state after component mounts (client-side only)
  useEffect(() => {
    setIsDemoMode(TrainingAPI.isDemoMode())
  }, [])

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (isDemoMode) {
          setIsBackendConnected(false)
          return
        }

        // Try to fetch from the API to check connection
        const response = await fetch(`${TrainingAPI.API_BASE_URL}/health`, {
          method: "HEAD",
          // Short timeout to avoid long waits
          signal: AbortSignal.timeout(3000),
        })
        setIsBackendConnected(response.ok)
      } catch (error) {
        setIsBackendConnected(false)
      }
    }

    checkConnection()
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [isDemoMode])

  const toggleDemoMode = () => {
    TrainingAPI.toggleDemoMode(!isDemoMode)
  }

  const updateApiUrl = () => {
    const url = prompt("Enter the backend API URL:", TrainingAPI.getApiBaseUrl())
    if (url) {
      TrainingAPI.setApiBaseUrl(url)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      // Use a relative path to the dataset folder
      const datasetPath = `dataset/${file.name}`

      console.log("Selected dataset path:", datasetPath)

      // Determine dataset type based on file extension
      let datasetType: "csv" | "images" | "text" | "custom" = "custom"
      if (file.name.endsWith(".csv")) datasetType = "csv"
      else if (file.name.endsWith(".zip") && file.name.includes("image")) datasetType = "images"
      else if (file.name.endsWith(".txt") || file.name.endsWith(".json")) datasetType = "text"

      const dataset = {
        name: file.name,
        path: datasetPath,
        type: datasetType,
        size: file.size,
        format: file.type,
      }

      onChange(dataset)
    } catch (error) {
      console.error("Error selecting dataset:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to select dataset. Please try again."
      setUploadError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const loadAvailableDatasets = async () => {
    try {
      setUploadError(null)

      // Add timeout and better error handling
      const fetchPromise = TrainingAPI.getAvailableDatasets()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Server might be unavailable.")), 10000),
      )

      const datasets = (await Promise.race([fetchPromise, timeoutPromise])) as Array<{
        name: string
        path: string
        type: string
        size: number
      }>

      setAvailableDatasets(datasets)
      setShowAvailableDatasets(true)
    } catch (error) {
      console.error("Error loading available datasets:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load available datasets. Please check your network connection and try again."
      setUploadError(errorMessage)
    }
  }

  const selectDataset = (dataset: { name: string; path: string; type: string; size: number }) => {
    onChange({
      name: dataset.name,
      path: dataset.path,
      type: dataset.type as "csv" | "images" | "text" | "custom",
      size: dataset.size,
    })
    setShowAvailableDatasets(false)
  }

  const getDatasetIcon = (type: string) => {
    switch (type) {
      case "csv":
        return <FileText size={16} className="mr-2" />
      case "images":
        return <ImageIcon size={16} className="mr-2" />
      default:
        return <Database size={16} className="mr-2" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handlePathSubmit = async () => {
    if (!filePath.trim()) return

    setIsUploading(true)
    setUploadError(null)

    try {
      // Use the path directly instead of sending it to the backend
      const path = filePath.trim()

      // Extract filename from path
      const fileName = path.split(/[/\\]/).pop() || "dataset"

      // Determine dataset type based on file extension
      let datasetType: "csv" | "images" | "text" | "custom" = "custom"
      if (fileName.endsWith(".csv")) datasetType = "csv"
      else if (fileName.endsWith(".zip") || fileName.includes("images")) datasetType = "images"
      else if (fileName.endsWith(".txt") || fileName.endsWith(".json")) datasetType = "text"

      const dataset = {
        name: fileName,
        path: path,
        type: datasetType,
        size: 0, // Size unknown for path input
      }

      onChange(dataset)
      setFilePath("")
    } catch (error) {
      console.error("Error using dataset path:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to use dataset path. Please check if the path is accessible to the server."
      setUploadError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dataset</label>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                isBackendConnected === null ? "bg-gray-400" : isBackendConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isBackendConnected === null
                ? "Checking connection..."
                : isBackendConnected
                  ? "Connected to backend"
                  : "Backend unavailable"}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={toggleDemoMode}
              className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {isDemoMode ? "Disable Demo Mode" : "Enable Demo Mode"}
            </button>
            <button
              type="button"
              onClick={updateApiUrl}
              className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Set API URL
            </button>
          </div>
        </div>

        {config.dataset ? (
          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md mb-2">
            <div className="flex items-center">
              {getDatasetIcon(config.dataset.type)}
              <div>
                <p className="font-medium">{config.dataset.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {config.dataset.type.toUpperCase()} •{" "}
                  {config.dataset.size ? formatFileSize(config.dataset.size) : "Unknown size"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 text-sm"
              onClick={() => onChange(undefined)}
            >
              Remove
            </button>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="radio"
              id="upload-option"
              name="dataset-source"
              value="upload"
              checked={datasetSource === "upload"}
              onChange={() => setDatasetSource("upload")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="upload-option" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Select dataset file
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="path-option"
              name="dataset-source"
              value="path"
              checked={datasetSource === "path"}
              onChange={() => setDatasetSource("path")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="path-option" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Specify file path
            </label>
          </div>

          {datasetSource === "upload" ? (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setUploadError(null)
                  fileInputRef.current?.click()
                }}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Select Dataset File
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={loadAvailableDatasets}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Database size={16} />
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="dataset/data.csv"
                className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handlePathSubmit}
                disabled={!filePath.trim() || isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv,.txt,.json,.zip"
        />

        {uploadError && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle size={14} className="mr-2" />
            </div>
            <div className="flex-1">
              {uploadError}
              <button
                type="button"
                onClick={loadAvailableDatasets}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {showAvailableDatasets && availableDatasets.length > 0 && (
        <div className="mt-4 border rounded-md dark:border-gray-700 max-h-40 overflow-y-auto">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {availableDatasets.map((dataset, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => selectDataset(dataset)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                >
                  {getDatasetIcon(dataset.type)}
                  <div>
                    <p className="font-medium">{dataset.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {dataset.type.toUpperCase()} • {formatFileSize(dataset.size)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAvailableDatasets && availableDatasets.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No available datasets found.</p>
      )}
    </div>
  )
}
