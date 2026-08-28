import { useState, useRef, useEffect } from 'react'
import { Send, Bot, X, MessageSquare, Sparkles } from 'lucide-react'
import API from '../api'
import { motion, AnimatePresence } from 'framer-motion'

// Pulse ring style injected once
const PULSE_STYLE = `
  @keyframes fabPulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.45); opacity: 0; }
  }
  .fab-pulse-ring {
    animation: fabPulse 2.2s ease-in-out infinite;
  }
`

export default function ChatDrawer({ contractId, lang, isOpen, setIsOpen, profile }) {
  const firstQ = profile?.question
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const messagesEndRef = useRef(null)

  const handleOpen = () => {
    setIsOpen(true)
    setHasOpened(true)
  }

  useEffect(() => {
    const role = profile?.role || 'someone reading this paper'
    const worry = profile?.worry || 'hidden risks'
    const asked = firstQ || 'what to watch out for'
    setMessages([{
      id: 1,
      role: 'assistant',
      content: `Hi. I will talk like a friend, not a lawyer.\n\nI see you as: ${role}.\nYou care most about: ${worry}.\nYou asked: “${asked}”\n\nAsk anything in simple words. I only use this document. I never keep names or phone numbers.`,
      citations: []
    }])
  }, [contractId, profile?.role, profile?.worry, firstQ])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const send = async (text, simpler = false) => {
    const q = (text || input).trim()
    if (!q) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: q, citations: [] }])
    setInput('')
    setIsTyping(true)
    try {
      const res = await API.post(`/chat/${contractId}`, { query: q, lang, simpler })
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.answer,
        citations: res.data.citations || []
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I hit a snag. Try a shorter question, like “Can they end this early?”',
        citations: []
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const suggestions = [
    firstQ || 'What should I watch out for?',
    'Explain the scariest part in 3 lines',
    'What must I pay or do?',
    'How can this end badly for me?'
  ]

  return (
    <>
      <style>{PULSE_STYLE}</style>
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 3, type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-40"
        >
          {/* Pulse rings */}
          {!hasOpened && (
            <>
              <span className="fab-pulse-ring absolute inset-0 rounded-full bg-orange-500/40 pointer-events-none" />
              <span className="fab-pulse-ring absolute inset-0 rounded-full bg-orange-500/20 pointer-events-none" style={{ animationDelay: '0.6s' }} />
            </>
          )}
          <div className="group relative">
            <button
              onClick={handleOpen}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white px-5 py-3.5 rounded-full shadow-xl flex items-center gap-2.5 transition-all hover:shadow-orange-500/30 hover:scale-105"
            >
              <MessageSquare size={19} />
              <span className="text-sm font-bold hidden sm:inline">Ask AI Assistant</span>
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2.5 w-52 bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium rounded-xl px-3.5 py-2.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl">
              Ask anything about this contract in plain words
              <div className="absolute top-full right-5 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            className="fixed top-0 right-0 w-full sm:w-[420px] h-screen bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-100 border border-orange-200 rounded-xl flex items-center justify-center text-orange-600">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Contract Explainer</h3>
                  <p className="text-xs text-slate-500 font-medium">Short answers. Zero legal jargon.</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/30">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user' ? 'bg-orange-600 text-white rounded-br-none font-medium' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.citations?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                        {msg.citations.map(cit => (
                          <span key={cit} className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">Part {cit}</span>
                        ))}
                      </div>
                    )}
                    {msg.role === 'assistant' && msg.id !== 1 && (
                      <button onClick={() => {
                        const lastUser = [...messages].reverse().find(m => m.role === 'user')
                        send(lastUser?.content || 'Explain the last answer even more simply', true)
                      }}
                        className="mt-3 text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1">
                        <Sparkles size={13} /> Even simpler
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 w-20 flex gap-1.5 items-center shadow-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {suggestions.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-700 px-3 py-1.5 rounded-full border border-slate-200 transition-colors font-medium">
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask in plain words…"
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
                <button onClick={() => send()} disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 text-orange-600 disabled:opacity-40 hover:text-orange-700 transition-colors"><Send size={18} /></button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">Not formal legal advice. Grounded strictly in your uploaded document.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
