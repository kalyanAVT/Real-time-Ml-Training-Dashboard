"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Terminal } from "lucide-react"
import { useDashboard } from "../context/DashboardContext"
import type { ChatMessage } from "../types"
import { useTheme } from "../context/ThemeContext"

export const ChatInterface: React.FC = () => {
  const { chatMessages, sendChatMessage, isChatOpen, toggleChat } = useDashboard()
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

  if (!isChatOpen) return null

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-gray-800 dark:bg-gray-900 text-white shadow-lg flex flex-col z-50 transition-colors duration-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center">
          <Terminal size={18} className="mr-2" />
          <h3 className="font-medium">Agent Console</h3>
        </div>
        <button
          onClick={toggleChat}
          className="p-1 rounded hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label="Close chat"
        >
          <span className="sr-only">Close</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length > 0 ? (
          chatMessages.map((msg) => <ChatMessageItem key={msg.id} message={msg} />)
        ) : (
          <div className="text-center text-gray-400 mt-8">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Type a message to start chatting with the agent</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 dark:border-gray-800">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 dark:bg-gray-800 text-white rounded-l-md focus:outline-none transition-colors duration-200"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none transition-colors duration-200"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}

export const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-700 dark:bg-gray-800 text-white rounded-bl-none"
        } transition-colors duration-200`}
      >
        <p>{message.content}</p>
        <div className={`text-xs mt-1 ${isUser ? "text-blue-200" : "text-gray-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
