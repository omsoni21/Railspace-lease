"use client";
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const defaultWelcome = 'Hi! I am your assistant. How can I help you today?';

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: defaultWelcome },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    const userInput = input;
    setInput('');
    // Show loading bot message
    setMessages((msgs) => [...msgs, { sender: 'bot', text: 'Thinking...' }]);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs.slice(0, -1), // remove 'Thinking...'
        { sender: 'bot', text: data.answer || 'Sorry, I could not generate a response.' }
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { sender: 'bot', text: 'Sorry, there was an error connecting to the AI.' }
      ]);
    }
  }

  // getBotReply removed; now using real AI

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend();
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
          borderRadius: '50%',
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, #2563eb 60%, #60a5fa 100%)',
          color: 'white',
          fontSize: 32,
          boxShadow: '0 6px 32px 0 rgba(37,99,235,0.18)',
          border: 'none',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
        aria-label="Open chat bot"
      >
        <span style={{ filter: 'drop-shadow(0 2px 4px #1e3a8a44)' }}>💬</span>
      </button>
      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 110,
            right: 32,
            width: 370,
            maxHeight: 540,
            background: 'rgba(255,255,255,0.98)',
            borderRadius: 18,
            boxShadow: '0 8px 40px 0 rgba(30,64,175,0.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001,
            animation: 'fadeInUp 0.35s cubic-bezier(.4,1.4,.6,1)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '18px 20px',
            borderBottom: '1px solid #e0e7ef',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
            color: 'white',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            letterSpacing: 0.2,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
                boxShadow: '0 2px 8px #2563eb22',
                fontSize: 20,
              }}>🤖</span>
              <span>RailSpace Assistant</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: 'white',
                cursor: 'pointer',
                fontWeight: 400,
                marginLeft: 8,
                transition: 'color 0.2s',
              }}
              aria-label="Close chat bot"
            >
              ×
            </button>
          </div>
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '22px 18px 12px 18px',
            background: 'linear-gradient(120deg, #f1f5fa 80%, #e0e7ef 100%)',
            transition: 'background 0.3s',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 18,
                display: 'flex',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 10,
              }}>
                {/* Avatar */}
                <span style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #2563eb 60%, #60a5fa 100%)' : '#e0e7ef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: msg.sender === 'user' ? 'white' : '#2563eb',
                  fontWeight: 700,
                  fontSize: 18,
                  boxShadow: msg.sender === 'user' ? '0 2px 8px #2563eb22' : 'none',
                  marginBottom: 2,
                }}>
                  {msg.sender === 'user' ? '🧑' : '🤖'}
                </span>
                {/* Bubble */}
                <span
                  style={{
                    display: 'inline-block',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, #2563eb 60%, #60a5fa 100%)'
                      : 'white',
                    color: msg.sender === 'user' ? 'white' : '#1e293b',
                    borderRadius: 18,
                    padding: '10px 18px',
                    maxWidth: '75%',
                    wordBreak: 'break-word',
                    fontSize: 15.5,
                    boxShadow: msg.sender === 'user'
                      ? '0 2px 8px #2563eb22'
                      : '0 1px 4px #e0e7ef88',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e0e7ef',
                    marginLeft: msg.sender === 'user' ? 0 : 2,
                    marginRight: msg.sender === 'user' ? 2 : 0,
                    transition: 'background 0.2s',
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div style={{
            padding: '16px 18px',
            borderTop: '1px solid #e0e7ef',
            background: 'white',
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                outline: 'none',
                fontSize: 15.5,
                background: '#f8fafc',
                transition: 'border 0.2s',
              }}
              aria-label="Type your message"
            />
            <button
              onClick={handleSend}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb 60%, #60a5fa 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15.5,
                boxShadow: '0 2px 8px #2563eb22',
                transition: 'background 0.2s',
              }}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      )}
      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
