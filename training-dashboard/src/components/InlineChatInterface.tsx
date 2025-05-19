"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, MessageSquare } from "lucide-react"
import { useDashboard } from "../context/DashboardContext"
import { ChatMessageItem } from "./ChatInterface"
import { useTheme } from "../context/ThemeContext"

export const InlineChatInterface: React.FC = () => {
  const { chatMessages, sendChatMessage } = useDashboard()
  const { theme } = useTheme()
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      sendChatMessage(message)
      setMessage("")
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 transition-colors duration-200">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <MessageSquare className="mr-2 text-blue-500" size={20} />
        <h3 className="font-medium text-gray-900 dark:text-white">Agent Chat</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask the agent a question..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      <div className="p-4 max-h-60 overflow-y-auto space-y-4">
        {chatMessages.length > 0 ? (
          chatMessages.map((msg) => <ChatMessageItem key={msg.id} message={msg} />)
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Type a message above to start chatting with the agent</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
