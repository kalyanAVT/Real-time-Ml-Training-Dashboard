"use client"

import type React from "react"
import { useState } from "react"
import { useDashboard } from "../context/DashboardContext"
import { useTheme } from "../context/ThemeContext"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceArea,
  ReferenceLine,
  Brush,
} from "recharts"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

export const Charts: React.FC = () => {
  const { metricsHistory } = useDashboard()
  const { theme } = useTheme()

  // State for zooming and panning
  const [lineChartState, setLineChartState] = useState({
    leftIndex: "dataMin",
    rightIndex: "dataMax",
    refAreaLeft: "",
    refAreaRight: "",
    isZooming: false,
  })

  // Generate sample data if no metrics history
  const chartData =
    metricsHistory.length > 0
      ? metricsHistory
      : Array.from({ length: 20 }, (_, i) => ({
          epoch: i + 1,
          accuracy: 0, // Set to zero for default state
          loss: 0, // Set to zero for default state
          status: "Idle" as const,
          timestamp: new Date().toISOString(),
        }))

  // Prepare data for radar chart - using zero values when no data is available
  const latestMetrics = chartData.length > 0 ? chartData[chartData.length - 1] : null

  const radarData = latestMetrics
    ? [
        { subject: "Accuracy", A: latestMetrics.accuracy, fullMark: 1 },
        { subject: "Loss", A: Math.min(latestMetrics.loss, 1), fullMark: 1 },
        { subject: "Progress", A: latestMetrics.epoch / 100, fullMark: 1 }, // Assuming 100 epochs total
        { subject: "Speed", A: 0.75, fullMark: 1 }, // Placeholder value
        { subject: "Memory", A: 0.6, fullMark: 1 }, // Placeholder value
      ]
    : [
        { subject: "Accuracy", A: 0, fullMark: 1 },
        { subject: "Loss", A: 0, fullMark: 1 },
        { subject: "Progress", A: 0, fullMark: 1 },
        { subject: "Speed", A: 0, fullMark: 1 },
        { subject: "Memory", A: 0, fullMark: 1 },
      ]

  // Theme-aware colors
  const colors = {
    background: theme === "light" ? "#ffffff" : "#1f2937",
    text: theme === "light" ? "#374151" : "#f9fafb",
    grid: theme === "light" ? "#e5e7eb" : "#374151",
    tooltip: {
      bg: theme === "light" ? "#ffffff" : "#1f2937",
      border: theme === "light" ? "#d1d5db" : "#374151",
      text: theme === "light" ? "#1f2937" : "#f9fafb",
    },
    accuracy: "#10B981", // green
    loss: "#EF4444", // red
    radar: "#3B82F6", // blue
  }

  // Zoom handling functions
  const handleZoomIn = () => {
    if (!lineChartState.refAreaLeft || !lineChartState.refAreaRight) {
      return
    }

    const left = Math.min(Number(lineChartState.refAreaLeft), Number(lineChartState.refAreaRight))

    const right = Math.max(Number(lineChartState.refAreaLeft), Number(lineChartState.refAreaRight))

    setLineChartState({
      ...lineChartState,
      refAreaLeft: "",
      refAreaRight: "",
      leftIndex: left.toString(), // Convert number to string
      rightIndex: right.toString(), // Convert number to string
      isZooming: false,
    })
  }

  const handleZoomOut = () => {
    setLineChartState({
      ...lineChartState,
      leftIndex: "dataMin",
      rightIndex: "dataMax",
      refAreaLeft: "",
      refAreaRight: "",
      isZooming: false,
    })
  }

  const handleMouseDown = (e: any) => {
    if (!e) return
    setLineChartState({
      ...lineChartState,
      refAreaLeft: e.activeLabel,
      isZooming: true,
    })
  }

  const handleMouseMove = (e: any) => {
    if (!e || !lineChartState.isZooming) return
    setLineChartState({
      ...lineChartState,
      refAreaRight: e.activeLabel,
    })
  }

  const handleMouseUp = () => {
    if (lineChartState.refAreaLeft && lineChartState.refAreaRight) {
      handleZoomIn()
    } else {
      setLineChartState({
        ...lineChartState,
        refAreaLeft: "",
        refAreaRight: "",
        isZooming: false,
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md lg:col-span-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium dark:text-white">Training Metrics</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              title="Reset zoom"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={!lineChartState.refAreaLeft || !lineChartState.refAreaRight}
              className={`p-1 rounded-md ${
                !lineChartState.refAreaLeft || !lineChartState.refAreaRight
                  ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              } text-gray-800 dark:text-gray-200`}
              title="Zoom to selection"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
        <div className="h-[calc(60vw*0.6/3*2)]" style={{ maxHeight: "500px", minHeight: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="epoch"
                label={{
                  value: "Epochs",
                  position: "insideBottomRight",
                  offset: -10,
                  fill: colors.text,
                }}
                stroke={colors.text}
                domain={[lineChartState.leftIndex, lineChartState.rightIndex]}
                allowDataOverflow
                // Ensure axis is visible even with empty data
                allowDecimals={false}
                minTickGap={0}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Accuracy",
                  angle: -90,
                  position: "insideLeft",
                  fill: colors.text,
                }}
                domain={[0, 1]}
                stroke={colors.text}
                tickFormatter={(value) => value.toFixed(2)}
                // Ensure axis is visible even with empty data
                allowDecimals={true}
                minTickGap={0}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Loss",
                  angle: 90,
                  position: "insideRight",
                  fill: colors.text,
                }}
                domain={[0, "dataMax + 0.5"]}
                stroke={colors.text}
                tickFormatter={(value) => value.toFixed(2)}
                // Ensure axis is visible even with empty data
                allowDecimals={true}
                minTickGap={0}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.tooltip.bg,
                  borderColor: colors.tooltip.border,
                  color: colors.tooltip.text,
                }}
                labelStyle={{ color: colors.tooltip.text }}
                formatter={(value: number) => [value.toFixed(4), ""]}
              />
              <Legend />

              {/* Reference lines for target values */}
              <ReferenceLine
                y={0.9}
                yAxisId="left"
                stroke={colors.accuracy}
                strokeDasharray="3 3"
                label={{
                  value: "Target Accuracy",
                  position: "insideTopRight",
                  fill: colors.accuracy,
                }}
              />
              <ReferenceLine
                y={0.1}
                yAxisId="right"
                stroke={colors.loss}
                strokeDasharray="3 3"
                label={{
                  value: "Target Loss",
                  position: "insideTopRight",
                  fill: colors.loss,
                }}
              />

              {/* Zoom selection area */}
              {lineChartState.refAreaLeft && lineChartState.refAreaRight ? (
                <ReferenceArea
                  yAxisId="left"
                  x1={lineChartState.refAreaLeft}
                  x2={lineChartState.refAreaRight}
                  strokeOpacity={0.3}
                  fill={theme === "light" ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.5)"}
                />
              ) : null}

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                stroke={colors.accuracy}
                activeDot={{ r: 8 }}
                name="Accuracy"
                dot={{ r: 2 }}
                isAnimationActive={true}
                animationDuration={500}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="loss"
                stroke={colors.loss}
                name="Loss"
                dot={{ r: 2 }}
                isAnimationActive={true}
                animationDuration={500}
              />

              {/* Brush for timeline navigation */}
              <Brush
                dataKey="epoch"
                height={30}
                stroke={colors.grid}
                fill={colors.background}
                tickFormatter={(value) => `Epoch ${value}`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md lg:col-span-2">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Performance Radar</h3>
        <div className="h-[300px]" style={{ maxHeight: "400px", minHeight: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="65%" data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke={colors.grid} />
              <PolarAngleAxis
                dataKey="subject"
                stroke={colors.text}
                tick={{ fill: colors.text, fontSize: 12 }}
                tickLine={true}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 1]}
                stroke={colors.text}
                tick={{ fill: colors.text }}
                tickFormatter={(value) => value.toFixed(1)}
                axisLine={true}
                tickCount={6}
              />
              <Radar
                name="Current Model"
                dataKey="A"
                stroke={colors.radar}
                fill={colors.radar}
                fillOpacity={0.6}
                isAnimationActive={true}
                animationDuration={500}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.tooltip.bg,
                  borderColor: colors.tooltip.border,
                  color: colors.tooltip.text,
                }}
                labelStyle={{ color: colors.tooltip.text }}
                formatter={(value: number) => [value.toFixed(2), ""]}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
