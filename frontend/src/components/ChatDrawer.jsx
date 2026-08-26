import { useState, useRef, useEffect } from 'react'
import { Send, Bot, X, MessageSquare, Sparkles } from 'lucide-react'
import API from '../api'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatDrawer({ contractId, lang, isOpen, setIsOpen, profile }) {
  const firstQ = profile?.question
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

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
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg z-40 flex items-center gap-2">
          <MessageSquare size={20} />
          <span className="text-sm font-medium hidden sm:inline">Ask simply</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            className="fixed top-0 right-0 w-full sm:w-[420px] h-screen bg-gray-900 border-l border-gray-800 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Bot size={18} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Simple explainer</h3>
                  <p className="text-xs text-gray-400">Short answers. No legal jargon.</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl p-4 ${
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.citations?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50 flex flex-wrap gap-2">
                        {msg.citations.map(cit => (
                          <span key={cit} className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md">Part {cit}</span>
                        ))}
                      </div>
                    )}
                    {msg.role === 'assistant' && msg.id !== 1 && (
                      <button onClick={() => {
                        const lastUser = [...messages].reverse().find(m => m.role === 'user')
                        send(lastUser?.content || 'Explain the last answer even more simply', true)
                      }}
                        className="mt-3 text-[11px] text-blue-300 hover:text-white flex items-center gap-1">
                        <Sparkles size={12} /> Even simpler
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 w-20 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestions.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs bg-gray-800 text-gray-300 hover:text-white px-3 py-1.5 rounded-full border border-gray-700">
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask in plain words…"
                  className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500" />
                <button onClick={() => send()} disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 text-blue-500 disabled:opacity-50"><Send size={18} /></button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 text-center">Not legal advice. Check with a licensed professional for important decisions.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
