import React, { useState, useEffect, useRef } from 'react'

export default function PrivateChat({ target, messages = [], onSend, typing }) {
  const [text, setText] = useState('')
  const ref = useRef()

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [messages])

  const submit = (e) => {
    e && e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }

  return (
    <div className="private-chat">
      <div className="private-header">Private: {target}</div>
      <div className="messages" ref={ref}>
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.from === target ? 'from-them' : 'from-me'}`}>
            <div className="meta">
              <span className="from">{m.from}</span>
              <span className="time">{new Date(m.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text">{m.text}</div>
          </div>
        ))}
        {typing && <div className="typing">{target} is typing...</div>}
      </div>
      <form className="send-row" onSubmit={submit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${target}`} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
