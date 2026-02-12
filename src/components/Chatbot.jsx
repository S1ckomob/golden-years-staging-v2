import { useState, useRef, useEffect } from 'react'

const QUICK_ACTIONS = [
  'What services do you offer?',
  'How much does it cost?',
  'I need help with a transition',
  'Book a consultation'
]

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Lisa, your Golden Years assistant. I can answer questions about our senior transition services, help you understand pricing, or book a free consultation.\n\nHow can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [leadCaptured, setLeadCaptured] = useState(false)
  const messagesEnd = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function sendMessage(text) {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          leadCaptured
        })
      })
      const data = await res.json()
      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: "I'm sorry, I'm having trouble right now. Please call us at (705) 555-1234 or email hello@goldenyearsseniorservices.ca and we'll be happy to help!" }])
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }])
        if (data.leadSaved) setLeadCaptured(true)
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "I'm having connection issues. Please reach out to us directly at (705) 555-1234 or hello@goldenyearsseniorservices.ca." }])
    }
    setLoading(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  function formatMessage(text) {
    return text.split('\n').map((line, i) => (
      <span key={i}>{line}{i < text.split('\n').length - 1 && <br />}</span>
    ))
  }

  return (
    <>
      <style>{`
        .gy-chatbot-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: 'Outfit', sans-serif;
        }

        .gy-chatbot-window {
          width: 400px;
          max-width: calc(100vw - 48px);
          height: 560px;
          max-height: calc(100vh - 120px);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(44, 44, 44, 0.18), 0 8px 24px rgba(44, 44, 44, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--warm-white, #FFFDF9);
          border: 1px solid var(--cream-dark, #F0EDE7);
          margin-bottom: 16px;
          animation: gy-chat-fade-up 0.3s ease-out;
        }

        @keyframes gy-chat-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gy-chat-header {
          background: linear-gradient(135deg, var(--gold, #C9A227), var(--gold-dark, #8B7118));
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .gy-chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gy-chat-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 18px;
          color: white;
        }

        .gy-chat-title {
          font-weight: 500;
          font-size: 14px;
          color: white;
        }

        .gy-chat-status {
          font-size: 12px;
          color: rgba(255,255,255,0.75);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .gy-chat-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #90EE90;
        }

        .gy-chat-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }

        .gy-chat-close:hover { color: white; }

        .gy-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gy-chat-messages::-webkit-scrollbar { width: 4px; }
        .gy-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .gy-chat-messages::-webkit-scrollbar-thumb { background: var(--cream-dark, #F0EDE7); border-radius: 4px; }

        .gy-msg-bot {
          background: var(--cream, #FAF8F5);
          color: var(--charcoal, #2C2C2C);
          padding: 12px 16px;
          border-radius: 14px 14px 14px 4px;
          max-width: 85%;
          align-self: flex-start;
          font-size: 14px;
          line-height: 1.55;
          font-weight: 300;
          border: 1px solid var(--cream-dark, #F0EDE7);
        }

        .gy-msg-user {
          background: var(--gold, #C9A227);
          color: white;
          padding: 12px 16px;
          border-radius: 14px 14px 4px 14px;
          max-width: 85%;
          align-self: flex-end;
          font-size: 14px;
          line-height: 1.55;
          font-weight: 400;
        }

        .gy-typing {
          display: flex;
          gap: 5px;
          padding: 14px 18px;
          background: var(--cream, #FAF8F5);
          border: 1px solid var(--cream-dark, #F0EDE7);
          border-radius: 14px 14px 14px 4px;
          align-self: flex-start;
        }

        .gy-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--charcoal-light, #4A4A4A);
          opacity: 0.5;
          animation: gy-bounce 1.2s ease-in-out infinite;
        }

        .gy-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .gy-typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes gy-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }

        .gy-chat-chips {
          padding: 0 16px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .gy-chip {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid var(--cream-dark, #F0EDE7);
          background: white;
          font-size: 12px;
          font-weight: 400;
          color: var(--charcoal-light, #4A4A4A);
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Outfit', sans-serif;
        }

        .gy-chip:hover {
          background: var(--gold, #C9A227);
          color: white;
          border-color: var(--gold, #C9A227);
        }

        .gy-chat-input-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid var(--cream-dark, #F0EDE7);
          background: white;
          flex-shrink: 0;
        }

        .gy-chat-input {
          flex: 1;
          background: var(--cream, #FAF8F5);
          border: 1px solid var(--cream-dark, #F0EDE7);
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          font-weight: 300;
          color: var(--charcoal, #2C2C2C);
          outline: none;
          transition: border-color 0.2s;
        }

        .gy-chat-input:focus {
          border-color: var(--gold, #C9A227);
        }

        .gy-chat-input::placeholder {
          color: #aaa;
        }

        .gy-chat-send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gold, #C9A227);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .gy-chat-send:hover { background: var(--gold-dark, #8B7118); }
        .gy-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

        .gy-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold, #C9A227), var(--gold-dark, #8B7118));
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.35);
          transition: all 0.3s ease;
          position: relative;
        }

        .gy-toggle:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(201, 162, 39, 0.45);
        }

        .gy-pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid var(--gold, #C9A227);
          animation: gy-pulse 2s ease-out infinite;
        }

        @keyframes gy-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        @media (max-width: 640px) {
          .gy-chatbot-window {
            width: calc(100vw - 24px);
            height: calc(100vh - 100px);
          }
          .gy-chatbot-container {
            bottom: 16px;
            right: 12px;
          }
        }
      `}</style>

      <div className="gy-chatbot-container">
        {open && (
          <div className="gy-chatbot-window">
            <div className="gy-chat-header">
              <div className="gy-chat-header-info">
                <div className="gy-chat-avatar">GY</div>
                <div>
                  <div className="gy-chat-title">Lisa — Golden Years</div>
                  <div className="gy-chat-status">
                    <span className="gy-chat-status-dot" />
                    Online now
                  </div>
                </div>
              </div>
              <button className="gy-chat-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="gy-chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'gy-msg-user' : 'gy-msg-bot'}>
                  {formatMessage(m.content)}
                </div>
              ))}
              {loading && (
                <div className="gy-typing">
                  <div className="gy-typing-dot" />
                  <div className="gy-typing-dot" />
                  <div className="gy-typing-dot" />
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            {messages.length <= 1 && !loading && (
              <div className="gy-chat-chips">
                {QUICK_ACTIONS.map(qa => (
                  <button key={qa} className="gy-chip" onClick={() => sendMessage(qa)}>{qa}</button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="gy-chat-input-bar">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                className="gy-chat-input"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()} className="gy-chat-send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        )}

        <button className="gy-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close chat' : 'Open chat'}>
          {!open && <div className="gy-pulse-ring" />}
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}
