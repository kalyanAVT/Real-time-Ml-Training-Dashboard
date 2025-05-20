"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, FolderOpen } from "lucide-react"
import { useDashboard } from "../context/DashboardContext"
import type { Config } from "../types"

export const ConfigModal: React.FC = () => {
  const { config, isConfigOpen, toggleConfig, updateConfig } = useDashboard()
  const [formData, setFormData] = useState<Config>({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    optimizer: "adam",
    modelType: "resnet50",
    modelName: "default",
    dataset: undefined, // Ensure dataset is initialized properly
  })

  // Update form when config changes
  useEffect(() => {
    if (config) {
      setFormData(config)
    }
  }, [config])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting config with dataset:", formData.dataset)
    updateConfig(formData)
  }

  // Function to handle direct file selection
  const handleFileSelection = (file: File) => {
    // Get just the filename
    const fileName = file.name

    // Construct the path relative to the dataset folder
    // This is the path that will be sent to the backend
    const datasetPath = `dataset/${fileName}`

    // Determine dataset type based on file extension
    let datasetType: "csv" | "images" | "text" | "custom" = "custom"
    if (fileName.endsWith(".csv")) datasetType = "csv"
    else if (fileName.endsWith(".zip") || fileName.includes("images")) datasetType = "images"
    else if (fileName.endsWith(".txt") || fileName.endsWith(".json")) datasetType = "text"

    // Update the form data with the dataset information
    const newDataset = {
      name: fileName,
      path: datasetPath,
      type: datasetType,
      size: file.size,
    }

    console.log("Setting dataset:", newDataset)

    setFormData((prev) => ({
      ...prev,
      dataset: newDataset,
    }))
  }

  if (!isConfigOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col transition-colors duration-200">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
            Training Configuration
          </h3>
          <button
            onClick={toggleConfig}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
            aria-label="Close config"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                Learning Rate
              </label>
              <input
                type="number"
                name="learningRate"
                value={formData.learningRate}
                onChange={handleChange}
                step="0.0001"
                min="0.0001"
                max="1"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                Batch Size
              </label>
              <input
                type="number"
                name="batchSize"
                value={formData.batchSize}
                onChange={handleChange}
                min="1"
                max="1024"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                Epochs
              </label>
              <input
                type="number"
                name="epochs"
                value={formData.epochs}
                onChange={handleChange}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                Optimizer
              </label>
              <select
                name="optimizer"
                value={formData.optimizer}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option value="adam">Adam</option>
                <option value="sgd">SGD</option>
                <option value="rmsprop">RMSprop</option>
                <option value="adagrad">Adagrad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                Model Type
              </label>
              <select
                name="modelType"
                value={formData.modelType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option value="resnet50">ResNet50</option>
                <option value="bert-base-uncased">BERT Base Uncased</option>
                <option value="gpt2">GPT-2</option>
                <option value="vit-base">Vision Transformer Base</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {formData.modelType === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                  Custom Model Name
                </label>
                <input
                  type="text"
                  name="modelName"
                  value={formData.modelName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200"
                  placeholder="Enter custom model name"
                />
              </div>
            )}

            <div className="border-t pt-4 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dataset Selection
              </label>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.currentTarget.classList.add("border-blue-500")
                  e.currentTarget.classList.add("bg-blue-50")
                  e.currentTarget.classList.add("dark:bg-blue-900/20")
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.currentTarget.classList.remove("border-blue-500")
                  e.currentTarget.classList.remove("bg-blue-50")
                  e.currentTarget.classList.remove("dark:bg-blue-900/20")
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.currentTarget.classList.remove("border-blue-500")
                  e.currentTarget.classList.remove("bg-blue-50")
                  e.currentTarget.classList.remove("dark:bg-blue-900/20")

                  // Get the file from the drop event
                  const files = e.dataTransfer.files
                  if (files && files.length > 0) {
                    handleFileSelection(files[0])
                  }
                }}
                onClick={() => {
                  // Create a file input and trigger it
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = ".csv,.txt,.json,.zip"
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      handleFileSelection(file)
                    }
                  }
                  input.click()
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.dataset?.path ? (
                      <>
                        Selected: <span className="font-medium">{formData.dataset.name}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Click to browse</span> or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Select a file from your dataset folder
                  </p>
                </div>
              </div>
              {formData.dataset?.path && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                    <span className="font-medium">Path:</span> {formData.dataset.path}
                  </p>
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Files will be referenced from your project's dataset folder
              </p>
            </div>
          </div>

          <div className="p-4 border-t dark:border-gray-700 flex justify-end">
            <button
              type="button"
              onClick={toggleConfig}
              className="px-4 py-2 mr-2 border rounded-md dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
