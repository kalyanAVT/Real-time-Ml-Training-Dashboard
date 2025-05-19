"use client";

import type React from "react";
import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import type { AgentTip } from "../types";

export const Sidebar: React.FC = () => {
  const { agentTips, isSidebarCollapsed, toggleSidebar } = useDashboard();
  const [isTipsCollapsed, setIsTipsCollapsed] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-800 dark:bg-gray-900 text-white transition-all duration-300 ${
        isSidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-800">
        <h2
          className={`font-semibold ${isSidebarCollapsed ? "hidden" : "block"}`}
        >
          Training Dashboard
        </h2>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <button
            onClick={() =>
              !isSidebarCollapsed && setIsTipsCollapsed(!isTipsCollapsed)
            }
            className="flex items-center justify-between w-full text-left"
            disabled={isSidebarCollapsed}
          >
            <div className="flex items-center">
              <MessageSquare size={18} className="mr-2" />
              {!isSidebarCollapsed && <span>Agent Tips Logs</span>}
            </div>
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isTipsCollapsed ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {!isSidebarCollapsed && !isTipsCollapsed && (
            <div className="mt-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {agentTips.length > 0 ? (
                agentTips
                  .filter((tip) => tip && tip.id && tip.type)
                  .map((tip) => <AgentTipItem key={tip.id} tip={tip} />)
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No tips available yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AgentTipItem: React.FC<{ tip: AgentTip }> = ({ tip }) => {
  const getTypeColor = () => {
    switch (tip.type) {
      case "info":
        return "text-blue-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "success":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="p-2 bg-gray-700 dark:bg-gray-800 rounded text-sm transition-colors duration-200">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-medium ${getTypeColor()}`}>
          {(tip.type || "TIP").toUpperCase()}
        </span>
        <span className="text-xs text-gray-400">
          {tip.timestamp
            ? new Date(tip.timestamp).toLocaleTimeString()
            : "--:--:--"}
        </span>
      </div>
      <p className="text-gray-200">{tip.message}</p>
    </div>
  );
};

// Missing ChevronLeft icon, let's create it
const ChevronLeft: React.FC<{ size: number }> = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
