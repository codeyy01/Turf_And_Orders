'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Clock } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'bot'
  type: 'text' | 'interactive_button' | 'interactive_list'
  content: string
  buttons?: { id: string, title: string }[]
  listOptions?: { id: string, title: string }[]
}

export default function SimulatorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', type: 'text', content: 'Hi! Type "book" to start the simulation.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const mockPhone = '919999999999'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendWebhook = async (mockEntry: any) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/webhooks/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockEntry)
      })
      const data = await res.json()
      
      if (data.responses) {
        const newBotMsgs: Message[] = data.responses.map((r: any, idx: number) => {
          if (r.type === 'text') {
            return { id: `bot-${Date.now()}-${idx}`, role: 'bot', type: 'text', content: r.text.body }
          }
          if (r.type === 'interactive' && r.interactive.type === 'button') {
            return {
              id: `bot-${Date.now()}-${idx}`,
              role: 'bot',
              type: 'interactive_button',
              content: r.interactive.body.text,
              buttons: r.interactive.action.buttons.map((b: any) => ({ id: b.reply.id, title: b.reply.title }))
            }
          }
          if (r.type === 'interactive' && r.interactive.type === 'list') {
             return {
              id: `bot-${Date.now()}-${idx}`,
              role: 'bot',
              type: 'interactive_list',
              content: r.interactive.body.text,
              listOptions: r.interactive.action.sections[0].rows.map((r: any) => ({ id: r.id, title: r.title }))
            }
          }
          return { id: `bot-${Date.now()}-${idx}`, role: 'bot', type: 'text', content: 'Unsupported message type' }
        })
        setMessages(prev => [...prev, ...newBotMsgs])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', type: 'text', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: mockPhone,
              type: 'text',
              text: { body: userMsg.content }
            }]
          }
        }]
      }]
    }

    await sendWebhook(payload)
  }

  const handleButtonReply = async (replyId: string, title: string) => {
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', type: 'text', content: title }
    setMessages(prev => [...prev, userMsg])

    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: mockPhone,
              type: 'interactive',
              interactive: {
                type: 'button_reply',
                button_reply: { id: replyId, title: title }
              }
            }]
          }
        }]
      }]
    }

    await sendWebhook(payload)
  }
  
  const handleListReply = async (replyId: string, title: string) => {
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', type: 'text', content: title }
    setMessages(prev => [...prev, userMsg])

    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: mockPhone,
              type: 'interactive',
              interactive: {
                type: 'list_reply',
                list_reply: { id: replyId, title: title, description: '' }
              }
            }]
          }
        }]
      }]
    }

    await sendWebhook(payload)
  }

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 max-w-2xl mx-auto shadow-sm">
      <div className="bg-[#075e54] p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full"><Bot className="w-6 h-6" /></div>
          <div>
            <h2 className="font-bold">TurfManager AI</h2>
            <p className="text-[#d9fdd3] text-xs">WhatsApp Simulator</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2]">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${m.role === 'user' ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-sm' : 'bg-white text-gray-900 rounded-tl-sm'}`}>
              
              {m.content.includes('http') ? (
                 <p className="whitespace-pre-wrap text-[15px] break-words leading-relaxed">
                   {m.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => 
                     part.startsWith('http') ? <a key={i} href={part} target="_blank" rel="noreferrer" className="text-blue-600 underline">{part}</a> : part
                   )}
                 </p>
              ) : (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.content}</p>
              )}

              {m.type === 'interactive_button' && m.buttons && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                  {m.buttons.map(b => (
                    <button key={b.id} onClick={() => handleButtonReply(b.id, b.title)} className="bg-transparent text-[#00a884] px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors w-full text-center">
                      {b.title}
                    </button>
                  ))}
                </div>
              )}

              {m.type === 'interactive_list' && m.listOptions && (
                <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                  {m.listOptions.map(l => (
                    <button key={l.id} onClick={() => handleListReply(l.id, l.title)} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors text-left border border-gray-200">
                       <span className="text-[15px] font-medium">{l.title}</span>
                       <Clock className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
              
              <div className="text-[10px] text-gray-400 text-right mt-1.5 flex items-center justify-end space-x-1">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {m.role === 'user' && <span className="text-[#53bdeb]">✓✓</span>}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm flex space-x-1">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-[#f0f2f5] p-3 border-t border-gray-200">
        <form onSubmit={handleSendText} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-white border-0 rounded-full px-4 py-3 text-[15px] focus:outline-none focus:ring-0 shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#00a884] text-white p-3 rounded-full hover:bg-[#008f6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  )
}
