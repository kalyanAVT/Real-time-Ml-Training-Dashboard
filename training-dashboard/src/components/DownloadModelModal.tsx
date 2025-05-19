"use client"

import type React from "react"
import { useState } from "react"
import { X, Download, Loader2, Check } from "lucide-react"
import { useDashboard } from "../context/DashboardContext"
import { TrainingAPI } from "../services/api"

// Add type definitions for the File System Access API
interface FileSystemFileHandle {
  createWritable: () => Promise<FileSystemWritableFileStream>
}

interface FileSystemWritableFileStream {
  write: (data: any) => Promise<void>
  close: () => Promise<void>
}

interface SaveFilePickerOptions {
  suggestedName?: string
  types?: Array<{
    description: string
    accept: Record<string, string[]>
  }>
}

// Extend the Window interface to include the File System Access API
declare global {
  interface Window {
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>
  }
}

interface DownloadModelModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DownloadModelModal: React.FC<DownloadModelModalProps> = ({ isOpen, onClose }) => {
  const { config } = useDashboard()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<"pytorch" | "onnx" | "tensorflow">("pytorch")
  const [includeWeights, setIncludeWeights] = useState(true)
  const [includeOptimizer, setIncludeOptimizer] = useState(false)
  const [customFilename, setCustomFilename] = useState("")

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      setDownloadSuccess(false)

      // Get the model data as a blob
      const blob = await TrainingAPI.downloadModel()

      // Set the filename based on user input or defaults
      const modelName = config?.modelName || "model"
      const modelType = config?.modelType || "custom"
      let filename = customFilename.trim() || (modelType === "custom" ? modelName : modelType)

      // Add file extension based on format
      switch (selectedFormat) {
        case "pytorch":
          filename += ".pt"
          break
        case "onnx":
          filename += ".onnx"
          break
        case "tensorflow":
          filename += ".h5"
          break
      }

      // Check if the File System Access API is available
      if (window.showSaveFilePicker) {
        try {
          // Define the file types to accept
          const fileTypes = [
            {
              description: "Model File",
              accept: {
                "application/octet-stream": [
                  `.${selectedFormat === "pytorch" ? "pt" : selectedFormat === "onnx" ? "onnx" : "h5"}`,
                ],
              },
            },
          ]

          // Show the file picker dialog
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: fileTypes,
          })

          // Create a writable stream and write the blob to it
          const writableStream = await fileHandle.createWritable()
          await writableStream.write(blob)
          await writableStream.close()

          setDownloadSuccess(true)
        } catch (error: any) {
          // User cancelled the save dialog or other error
          if (error.name !== "AbortError") {
            console.error("Error saving file:", error)
            // Fall back to the traditional download method
            downloadWithFallback(blob, filename)
          }
        }
      } else {
        // Fall back to the traditional download method for browsers without File System Access API
        downloadWithFallback(blob, filename)
      }
    } catch (error) {
      console.error("Error downloading model:", error)
      alert("Failed to download model. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Fallback download method using the traditional approach
  const downloadWithFallback = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
    setDownloadSuccess(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md transition-colors duration-200">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
            Download Model
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
            aria-label="Close download modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as "pytorch" | "onnx" | "tensorflow")}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              >
                <option value="pytorch">PyTorch (.pt)</option>
                <option value="onnx">ONNX (.onnx)</option>
                <option value="tensorflow">TensorFlow (.h5)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filename (optional)
              </label>
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder={config?.modelType === "custom" ? config?.modelName : config?.modelType}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="include-weights"
                checked={includeWeights}
                onChange={(e) => setIncludeWeights(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="include-weights" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Include model weights
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="include-optimizer"
                checked={includeOptimizer}
                onChange={(e) => setIncludeOptimizer(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="include-optimizer" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Include optimizer state
              </label>
            </div>

            {downloadSuccess && (
              <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <Check size={16} className="mr-2" />
                <span>Model downloaded successfully!</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 border rounded-md dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
