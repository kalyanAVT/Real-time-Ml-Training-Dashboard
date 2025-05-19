"use client";

import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import type { Config } from "../types";
import { TrainingAPI } from "../services/api";

interface DatasetSelectorProps {
  config: Config;
  onChange: (dataset: Config["dataset"]) => void;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  config,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection and send the path to backend
  const handleFile = async (file: File) => {
    if (!file) return;
    let datasetPath =
      (file as any).path || file.webkitRelativePath || file.name;
    if (!datasetPath || datasetPath === file.name) {
      datasetPath = file.name;
    }
    // Send the file path to the backend
    const response = await fetch(
      `${TrainingAPI.API_BASE_URL}/dataset-location`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: datasetPath,
          name: file.name,
          size: file.size,
          type: file.type,
        }),
      }
    );
    const result = await response.json();
    let datasetType: "csv" | "images" | "text" | "custom" = "custom";
    if (file.name.endsWith(".csv")) datasetType = "csv";
    else if (file.name.endsWith(".zip") && file.name.includes("image"))
      datasetType = "images";
    else if (file.name.endsWith(".txt") || file.name.endsWith(".json"))
      datasetType = "text";
    const dataset = {
      name: file.name,
      path: result.path || datasetPath,
      type: datasetType,
      size: file.size,
      format: file.type,
    };
    onChange(dataset);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Select Dataset
      </label>
      <div
        className={`flex flex-col items-center justify-center border-2 rounded-md border-dashed cursor-pointer transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        } py-6 px-4`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragLeave}
        tabIndex={0}
        role="button"
        aria-label="Select or drop dataset file"
      >
        <Upload size={24} className="mb-2 text-gray-500 dark:text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
          Drag & drop your dataset here, or{" "}
          <span className="underline">click to select</span>
        </span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv,.txt,.json,.zip"
        />
      </div>
      {config.dataset && (
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Selected: <span className="font-medium">{config.dataset.name}</span>
        </div>
      )}
    </div>
  );
};
