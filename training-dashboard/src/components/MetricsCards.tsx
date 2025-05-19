import type React from "react"
import { useDashboard } from "../context/DashboardContext"
import { Activity, BarChart2, Clock, AlertCircle, Database } from "lucide-react"

export const MetricsCards: React.FC = () => {
  const { metrics, config } = useDashboard()

  // Generate sample data if no metrics
  const displayMetrics = metrics || {
    epoch: 0,
    accuracy: 0,
    loss: 0,
    status: "Idle" as const,
    timestamp: new Date().toISOString(),
  }

  const getStatusColor = () => {
    switch (displayMetrics.status) {
      case "Ongoing":
        return "bg-green-500 dark:bg-green-600"
      case "Idle":
        return "bg-yellow-500 dark:bg-yellow-600"
      case "Completed":
        return "bg-blue-500 dark:bg-blue-600"
      default:
        return "bg-gray-500 dark:bg-gray-600"
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <MetricCard
        title="Epochs"
        value={displayMetrics.epoch.toString()}
        icon={<Clock size={20} />}
        color="bg-blue-500 dark:bg-blue-600"
      />

      <MetricCard
        title="Accuracy"
        value={(displayMetrics.accuracy * 100).toFixed(2) + "%"}
        icon={<Activity size={20} />}
        color="bg-green-500 dark:bg-green-600"
      />

      <MetricCard
        title="Loss"
        value={displayMetrics.loss.toFixed(4)}
        icon={<BarChart2 size={20} />}
        color="bg-red-500 dark:bg-red-600"
      />

      <MetricCard
        title="Status"
        value={displayMetrics.status}
        icon={<AlertCircle size={20} />}
        color={getStatusColor()}
      />

      <MetricCard
        title="Dataset"
        value={config?.dataset ? `${config.dataset.name} (${formatFileSize(config.dataset.size)})` : "Not selected"}
        icon={<Database size={20} />}
        color="bg-purple-500 dark:bg-purple-600"
      />
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center transition-colors duration-200">
      <div className={`${color} p-3 rounded-full mr-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}
