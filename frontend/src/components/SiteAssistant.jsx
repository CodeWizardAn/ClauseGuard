import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, Trash2, ArrowRight, Shield, Zap, HelpCircle } from 'lucide-react'
import API from '../api'

const QUICK_PROMPTS = [
  'How do I audit or upload a contract?',
  'How does the Affordability Calculator work?',
  'What does "Indemnity" or "Force Majeure" mean?',
  'How does the 4-digit PIN Vault protect my data?',
  'Can my landlord deduct my security deposit without notice?',
  'What is the rule for Non-Compete clauses in India?',
]

export default function SiteAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 **Hi there! I'm your ClauseGuard AI Copilot.**\n\nI can help you navigate the platform, explore features, or clarify **any legal jargon, Indian consumer laws, tenant protections, or contract doubts** in plain English.\n\nWhat would you like to know?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [isOpen, messages])

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    const userMsg = { id: Date.now().toString(), sender: 'user', text: query }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setInput('')
    setLoading(true)

    try {
      const res = await API.post('/assistant/chat', {
        query,
        chat_history: updatedHistory.slice(-6),
      })
      const botReply = res.data?.reply || "I'm here to help. Could you please rephrase your question?"
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'assistant', text: botReply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'I ran into a temporary connection issue. Please feel free to ask again or try one of the quick suggestions below!',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "👋 **Chat cleared!** How can I assist you with ClauseGuard or legal contract questions?",
      },
    ])
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] select-none">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/25 backdrop-blur-xl"
          title="Ask ClauseGuard AI Assistant"
        >
          <Sparkles size={16} className="text-yellow-300 animate-pulse" />
          <span className="tracking-wide">Ask AI Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
        </button>
      )}


      {/* Expanded Chat Modal */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[560px] max-h-[85vh] rounded-3xl bg-[#0a0d22]/95 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                <Sparkles size={14} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  ClauseGuard Copilot
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </p>
                <p className="text-[10px] text-slate-400">Site Navigator & Legal Simplifier</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Close Assistant"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield size={12} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'bg-white/[0.05] border border-white/10 text-slate-200'
                  }`}
                >
                  <div 
                    className="space-y-1.5 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/`(.*?)`/g, '<code class="bg-black/30 px-1 py-0.5 rounded text-purple-300">$1</code>')
                    }}
                  />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0">
                  <Sparkles size={12} className="text-purple-400 animate-spin" />
                </div>
                <span className="animate-pulse">Analyzing legal principles…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3.5 py-2 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Common Doubts & Suggestions:</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/30 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about website features or legal terms..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
