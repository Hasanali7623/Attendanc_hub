import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { sendMessageToGemini } from "../config/gemini";

const GeminiChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "model",
      text: "👋 Hello! I'm your intelligent AI assistant for the Smart Attendance Management System. I have complete knowledge of this project including:\n\n✅ Backend (Spring Boot, Java, MySQL, JWT)\n✅ Frontend (React, Vite, Tailwind CSS)\n✅ Features (Attendance, Leave, Subjects, Reports)\n✅ Database Schema & API Endpoints\n✅ Architecture & Technologies\n\nAsk me anything about this project - features, code, troubleshooting, or improvements!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: inputMessage.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Prepare chat history for context (last 10 messages)
      const chatHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

      // Get response from Gemini
      const botResponse = await sendMessageToGemini(
        userMessage.text,
        chatHistory
      );

      // Add bot response to chat
      const botMessage = {
        id: Date.now() + 1,
        role: "model",
        text: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: "model",
        text: "❌ Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-white/30">
                  <Sparkles className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white drop-shadow-lg flex items-center gap-2">
                  Gemini AI Assistant
                  <span className="px-3 py-1 text-xs bg-white/20 backdrop-blur-sm text-white rounded-full font-bold border border-white/30">
                    ✨ Online
                  </span>
                </h1>
                <p className="text-white/90 text-sm mt-1 font-medium">
                  🚀 Powered by Google Gemini 2.0 Flash - Your Project Expert
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <Bot className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">AI Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Enhanced Avatar */}
              <div className="flex-shrink-0">
                {message.role === "user" ? (
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-purple-200 dark:ring-purple-800">
                    <User className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-200 dark:ring-blue-800">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Enhanced Message Bubble */}
              <div
                className={`flex-1 max-w-2xl animate-slide-up ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white"
                      : message.isError
                      ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-700"
                      : "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 border-2 border-purple-200 dark:border-purple-800/50"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                  <p
                    className={`text-xs mt-2 flex items-center gap-1 ${
                      message.role === "user"
                        ? "text-purple-100 justify-end"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.role === "user" ? "You" : "Gemini"} •
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Enhanced Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 animate-slide-up">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-200 dark:ring-blue-800">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-purple-200 dark:border-purple-800/50 px-5 py-3 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"></span>
                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="💬 Ask me anything about your Smart Attendance System..."
                disabled={isLoading}
                rows="1"
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                style={{ minHeight: "52px", maxHeight: "120px" }}
              />
              <MessageSquare className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 font-bold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            💡 AI responses may not always be accurate. Please verify important
            information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeminiChatbot;
