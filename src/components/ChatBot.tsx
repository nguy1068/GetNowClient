import { useState, useRef, useEffect } from 'react'
import { Close, SendFilled } from '@carbon/icons-react'
import './ChatBot.scss'

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  time: string
}

function BotAvatar() {
  return (
    <svg
      className="chatbot__avatar"
      width="24"
      height="24"
      viewBox="0 0 35 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 17.6794C0.210765 17.2013 0.538227 16.671 0.804122 16.2145L2.01495 14.1226C3.51484 11.4938 5.02789 8.87261 6.55404 6.25904L8.99617 2.01569C9.29968 1.49498 9.82148 0.49609 10.1922 0.0883329C10.3363 0.0474051 10.7109 0.0188841 10.8618 0.0183378C12.3876 0.0128366 13.917 0.0161532 15.4424 0.015685L24.0484 0.00733538L28.1952 0.00604767C28.7413 0.00596963 29.954 -0.0253209 30.4365 0.0552083C30.8166 0.473227 31.8182 2.27468 32.0947 2.82812C32.73 3.84866 33.2755 4.9664 33.8814 6.00848C34.2099 6.61081 34.6149 7.21033 34.8989 7.83158C35.0039 8.06131 34.9649 8.59521 34.7261 8.69384C34.181 8.91916 33.2177 8.82864 32.6236 8.83554C31.4823 8.85973 30.3407 8.8675 29.1991 8.8588L26.4263 8.85872C26.0313 8.85884 25.3941 8.8785 25.0158 8.85482C23.6045 8.95357 15.8765 8.70441 15.3512 8.94588C15.1893 9.02032 15.0125 9.3094 14.9147 9.46242C14.4924 10.1236 14.1187 10.8273 13.7249 11.5067C12.9384 12.8571 12.1603 14.2123 11.3906 15.5724C11.0374 16.1966 10.5741 16.8862 10.2969 17.5405C10.1812 17.8137 10.6837 18.5473 10.8383 18.8123C12.0875 20.9546 13.2998 23.1253 14.5864 25.2455C15.2233 26.2231 15.683 25.6913 16.1037 24.92C16.2478 24.6559 16.4954 24.2535 16.6553 23.9803L19.0075 19.936C19.3503 19.3484 19.6683 18.7283 20.0418 18.1605C20.135 18.019 20.2726 17.8118 20.4207 17.7268C20.6674 17.5852 29.1176 17.5854 29.595 17.6934L29.6119 17.6974C29.9109 17.9612 29.9416 18.0089 30.0552 18.3912C29.9515 18.726 29.276 19.8267 29.0507 20.2272C28.3607 21.4468 27.6634 22.6621 26.9588 23.8734C26.6043 24.4888 25.8058 26.0286 25.3249 26.4653C24.6277 26.5737 22.8939 26.5235 22.1195 26.5239L15.7338 26.5229L8.56547 26.5252L6.57698 26.5354C6.16099 26.5377 5.57501 26.5559 5.17556 26.494C4.64955 26.0123 0.526522 18.7393 0 17.6794Z"
        fill="url(#chatbot_grad)"
      />
      <defs>
        <linearGradient id="chatbot_grad" x1="25.1231" y1="8.10934" x2="17.3157" y2="26.4711" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F62FE" />
          <stop offset="1" stopColor="#ACC9FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: "Please provide your Pharmacies's name, phone number and current issues for better supports",
    time: '8:30 PM',
  },
]

interface ChatBotProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: formatTime(new Date()),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // Simulated bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Thank you! A support representative will follow up with you shortly.',
          time: formatTime(new Date()),
        },
      ])
    }, 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  if (!isOpen) return null

  return (
    <div className="chatbot" role="dialog" aria-label="GetNow Customer Support Chat">
      {/* Header */}
      <div className="chatbot__header">
        <div className="chatbot__header-text">
          <p className="chatbot__label">Virtual Customer Support</p>
          <p className="chatbot__title">Let's Chat</p>
        </div>
        <button
          className="chatbot__close"
          onClick={onClose}
          aria-label="Close chat"
        >
          <Close size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="chatbot__messages">
        {messages.map((msg) =>
          msg.sender === 'bot' ? (
            <div key={msg.id} className="chatbot__message chatbot__message--bot">
              <div className="chatbot__message-meta">
                <BotAvatar />
                <span className="chatbot__message-time">Watson {msg.time}</span>
              </div>
              <div className="chatbot__message-bubble-row">
                <BotAvatar />
                <p className="chatbot__message-text">{msg.text}</p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="chatbot__message chatbot__message--user">
              <div className="chatbot__message-user-bubble">
                <p className="chatbot__message-text">{msg.text}</p>
                <span className="chatbot__message-time chatbot__message-time--user">{msg.time}</span>
              </div>
            </div>
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chatbot__input-row">
        <input
          className="chatbot__input"
          placeholder="Send Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Type a message"
        />
        <button
          className="chatbot__send"
          onClick={handleSend}
          aria-label="Send message"
          disabled={!input.trim()}
        >
          <SendFilled size={16} />
        </button>
      </div>
    </div>
  )
}
