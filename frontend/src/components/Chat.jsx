import React, { useState, useEffect, useRef } from 'react'
import OnlineUsers from './OnlineUsers'
import PrivateChat from './PrivateChat'

const DEFAULT_WS = (import.meta.env.VITE_WS_URL) || 'ws://localhost:8000/ws'

function useWebSocket(username, handlers) {
  const wsRef = useRef(null)
  const reconnectRef = useRef({ attempts: 0, timer: null })

  useEffect(() => {
    let mounted = true

    const connect = () => {
      const ws = new WebSocket(DEFAULT_WS)
      wsRef.current = ws

      ws.onopen = () => {
        reconnectRef.current.attempts = 0
        ws.send(JSON.stringify({ type: 'join', username }))
        handlers.onOpen && handlers.onOpen()
      }

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data)
          handlers.onMessage && handlers.onMessage(data)
        } catch (e) {}
      }

      ws.onclose = () => {
        handlers.onClose && handlers.onClose()
        // reconnect with backoff while preserving username in-memory (not persisted)
        if (!mounted) return
        const next = Math.min(30000, 1000 * 2 ** reconnectRef.current.attempts)
        reconnectRef.current.attempts += 1
        reconnectRef.current.timer = setTimeout(connect, next)
      }

      ws.onerror = () => {
        // errors handled by onclose
      }
    }

    connect()

    return () => {
      mounted = false
      if (reconnectRef.current.timer) clearTimeout(reconnectRef.current.timer)
      try {
        wsRef.current && wsRef.current.close()
      } catch (e) {}
    }
  }, [username])

  const send = (obj) => {
    try {
      wsRef.current && wsRef.current.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify(obj))
    } catch (e) {}
  }

  return { send, ws: wsRef.current }
}

export default function Chat({ username, onLogout }) {
  const [messages, setMessages] = useState([]) // global
  const [privateMessages, setPrivateMessages] = useState({})
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [typingState, setTypingState] = useState({})

  const handlers = {
    onOpen: () => setConnectionStatus('connected'),
    onClose: () => setConnectionStatus('disconnected'),
    onMessage: (data) => {
      const t = data.type
      if (t === 'message') {
        setMessages((m) => [...m, data])
      } else if (t === 'private_message') {
        const other = data.from === username ? data.to : data.from
        setPrivateMessages((p) => ({ ...(p || {}), [other]: [...((p || {})[other] || []), data] }))
      } else if (t === 'presence') {
        setUsers(data.users)
      } else if (t === 'join') {
        setMessages((m) => [...m, { system: true, text: `${data.username} joined`, timestamp: data.timestamp }])
      } else if (t === 'leave') {
        setMessages((m) => [...m, { system: true, text: `${data.username} left`, timestamp: data.timestamp }])
      } else if (t === 'typing') {
        const who = data.from
        const to = data.to
        if (to) {
          setTypingState((s) => ({ ...s, [who]: true }))
          setTimeout(() => setTypingState((s) => ({ ...s, [who]: false })), 2000)
        } else {
          setTypingState((s) => ({ ...s, [who]: true }))
          setTimeout(() => setTypingState((s) => ({ ...s, [who]: false })), 1500)
        }
      } else if (t === 'error') {
        if (data.reason === 'username_taken') {
          alert('Username already taken. Choose another name.')
          onLogout()
        }
      }
    },
  }

  const { send } = useWebSocket(username, handlers)

  const sendGlobal = (text) => {
    send({ type: 'message', text })
  }

  const sendPrivate = (to, text) => {
    send({ type: 'private_message', to, text })
  }

  const sendTyping = (to) => {
    send({ type: 'typing', to })
  }

  return (
    <div className="chat-root">
      <aside className="sidebar">
        <OnlineUsers users={users} onSelect={(u)=>setSelected(u)} current={username} connectionStatus={connectionStatus} />
        <div className="controls">
          <button onClick={() => onLogout()}>Leave</button>
        </div>
      </aside>

      <main className="main">
        <section className="global-chat">
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={m.system ? 'system' : m.from === username ? 'message me' : 'message'}>
                {m.system ? (
                  <div className="sys">{m.text} <span className="t">{new Date(m.timestamp).toLocaleTimeString()}</span></div>
                ) : (
                  <>
                    <div className="meta"><b>{m.from}</b> <span className="t">{new Date(m.timestamp).toLocaleTimeString()}</span></div>
                    <div className="text">{m.text}</div>
                  </>
                )}
              </div>
            ))}
          </div>
          <GlobalComposer onSend={sendGlobal} onTyping={()=>sendTyping(null)} typing={Object.keys(typingState).length>0} />
        </section>

        <section className="private-area">
          {selected ? (
            <PrivateChat
              target={selected}
              messages={privateMessages[selected] || []}
              onSend={(text) => sendPrivate(selected, text)}
              typing={typingState[selected]}
            />
          ) : (
            <div className="hint">Select a user to start a private chat</div>
          )}
        </section>
      </main>
    </div>
  )
}

function GlobalComposer({ onSend, onTyping, typing }) {
  const [text, setText] = useState('')
  const ref = useRef()

  const submit = (e) => {
    e && e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }

  useEffect(() => {
    const id = setInterval(()=>{}, 1000)
    return ()=>clearInterval(id)
  }, [])

  return (
    <form className="composer" onSubmit={submit}>
      <input
        ref={ref}
        value={text}
        onChange={(e)=>{ setText(e.target.value); onTyping() }}
        placeholder="Send message to global room"
      />
      <button type="submit">Send</button>
    </form>
  )
}
