"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import type { Config } from "../types";
import { TrainingAPI } from "../services/api";

export const ConfigModal: React.FC = () => {
  const { config, isConfigOpen, toggleConfig, updateConfig } = useDashboard();
  const [formData, setFormData] = useState<Config>({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    optimizer: "adam",
    modelType: "resnet50",
    modelName: "default",
  });

  // Update form when config changes
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  // Add dataset file location integration
  const handleDatasetFile = async (file: File) => {
    // Try to get the full path if available (Electron, some browsers), else fallback to file.name
    // For web browsers, only file.name is available, so instruct user to upload or select from backend directory
    let path = (file as any).path || file.webkitRelativePath || file.name;
    // If the file was uploaded, backend will save it in its working directory, so use only the filename
    if (!path || path === file.name) {
      path = file.name;
    }
    try {
      const response = await fetch(
        `${TrainingAPI.API_BASE_URL}/dataset-location`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path,
            name: file.name,
            size: file.size,
            type: file.type,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to send dataset location");
      const result = await response.json();
      setFormData((prev) => ({
        ...prev,
        dataset: {
          name: file.name,
          path: result.path || path,
          type: file.name.endsWith(".csv")
            ? "csv"
            : file.name.endsWith(".zip") || file.name.includes("images")
            ? "images"
            : file.name.endsWith(".txt") || file.name.endsWith(".json")
            ? "text"
            : "custom",
          size: file.size,
        },
      }));
    } catch (err) {
      setFormData((prev) => ({
        ...prev,
        dataset: {
          name: file.name,
          path,
          type: file.name.endsWith(".csv")
            ? "csv"
            : file.name.endsWith(".zip") || file.name.includes("images")
            ? "images"
            : file.name.endsWith(".txt") || file.name.endsWith(".json")
            ? "text"
            : "custom",
          size: file.size,
        },
      }));
    }
  };

  if (!isConfigOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md transition-colors duration-200">
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

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
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
                Dataset Path
              </label>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add("border-blue-500");
                  e.currentTarget.classList.add("bg-blue-50");
                  e.currentTarget.classList.add("dark:bg-blue-900/20");
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove("border-blue-500");
                  e.currentTarget.classList.remove("bg-blue-50");
                  e.currentTarget.classList.remove("dark:bg-blue-900/20");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove("border-blue-500");
                  e.currentTarget.classList.remove("bg-blue-50");
                  e.currentTarget.classList.remove("dark:bg-blue-900/20");
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    handleDatasetFile(files[0]);
                  }
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".csv,.txt,.json,.zip";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleDatasetFile(file);
                    }
                  };
                  input.click();
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <svg
                    className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.dataset?.path ? (
                      <>
                        Selected:{" "}
                        <span className="font-medium">
                          {formData.dataset.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Click to browse</span> or
                        drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Supported file types: CSV, TXT, JSON, ZIP
                  </p>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter the full path to your dataset file on the server
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
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
  );
};
