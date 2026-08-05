import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { baseUrl } from "../endpoints";

const blockedKeywords = [
  "hack",
  "hacking",
  "ddos",
  "sql injection",
  "xss",
  "csrf",
  "exploit",
  "admin password",
  "admin panel",
  "free products",
  "free order",
  "bypass payment",
  "steal account",
  "refund abuse",
  "coupon exploit",
  "crack",
  "phishing",
  "database access",
  "steal data",
  "customer data",
  "credential stuffing",
  "bot attack"
];

function isBlocked(message) {
  const text = message.toLowerCase();
  return blockedKeywords.some(word => text.includes(word));
}

async function askSana(customerName, userMessage) {
  const prompt = `
You are Sana, a professional AI Shopping Assistant for an eCommerce platform similar to Amazon, Flipkart, Blinkit and Myntra.

Customer Name: ${customerName}

Customer Message:
${userMessage}

ROLE:
- Act as a personal shopping assistant.
- Help customers discover products.
- Recommend products.
- Compare products.
- Suggest budget alternatives.
- Explain features and benefits.
- Assist with orders, shipping, returns and refunds.
- Always address the customer by name.

SECURITY POLICY:
Never assist with:
- Hacking
- Exploiting the website
- Free products
- Payment bypassing
- Coupon abuse
- Refund abuse
- Data theft
- Scraping customer information
- Fraud
- Server attacks
- Admin access
- Security bypasses

If asked, politely refuse and redirect to legitimate shopping assistance.

RECOMMENDATION FORMAT:

Hello {Customer Name},

Based on your requirements:

🥇 Best Overall
- Product
- Why it is recommended

💰 Best Value
- Product
- Why it is recommended

⭐ Premium Choice
- Product
- Why it is recommended

Keep responses professional and concise.
`;

  const response = await axios.post(`${baseUrl}/api/aiCall`, {
    prompt: prompt,
  });

  if (response.data && response.data.success) {
    return response.data.message;
  } else {
    throw new Error(response.data?.message || "Failed to get response from Gemini");
  }
}

export default function MyChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("sana-chat-messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved messages:", e);
      }
    }
    return [
      {
        id: "welcome",
        sender: "bot",
        text: "👋 Welcome to Aventra!\n\nI'm Sana, your personal shopping assistant.\n\nWhat's your name?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem("sana-chat-username") || "";
  });

  const [step, setStep] = useState(() => {
    return sessionStorage.getItem("sana-chat-step") || "ask_name";
  });

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem("sana-chat-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("sana-chat-username", userName);
  }, [userName]);

  useEffect(() => {
    sessionStorage.setItem("sana-chat-step", step);
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    setInputText("");

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp
    };

    setMessages((prev) => [...prev, userMsg]);

    if (step === "ask_name") {
      setIsTyping(true);
      const name = userText;
      setUserName(name);
      setStep("chat");

      setTimeout(() => {
        const greetingMsg = {
          id: `bot-greet-${Date.now()}`,
          sender: "bot",
          text: `Nice to meet you, ${name}! 😊`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, greetingMsg]);

        setTimeout(() => {
          const capabilitiesMsg = {
            id: `bot-cap-${Date.now()}`,
            sender: "bot",
            text: `I can help you with:\n\n📱 Smartphones\n💻 Laptops\n⌚ Smart Watches\n🎧 Headphones\n📺 Electronics\n👕 Fashion\n👟 Footwear\n🎮 Gaming\n🏠 Home Appliances\n\nWhat are you looking for today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, capabilitiesMsg]);
          setIsTyping(false);
        }, 800);
      }, 600);

    } else {
      setIsTyping(true);

      // Check blocked keywords
      if (isBlocked(userText)) {
        setTimeout(() => {
          const blockedMsg = {
            id: `bot-blocked-${Date.now()}`,
            sender: "bot",
            text: `Hello,\n\nI can't assist with activities that could harm the platform, customers, or services.\n\nI can help with:\n🛒 Product recommendations\n📦 Orders\n🚚 Shipping\n🔄 Returns\n💰 Deals & offers`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, blockedMsg]);
          setIsTyping(false);
        }, 500);
        return;
      }

      try {
        const responseText = await askSana(userName || "Customer", userText);
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        console.error("Chatbot response error:", error);
        const errorMsg = {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: `Sorry, I'm having trouble connecting right now.\n\nPlease try again in a moment.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleReset = () => {
    Swal.fire({
      title: "Clear Chat History?",
      text: "Are you sure you want to clear your chat history?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear it!"
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("sana-chat-messages");
        sessionStorage.removeItem("sana-chat-username");
        sessionStorage.removeItem("sana-chat-step");
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: "👋 Welcome to Aventra!\n\nI'm Sana, your personal shopping assistant.\n\nWhat's your name?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setUserName("");
        setStep("ask_name");
      }
    });
  };

  return (
    <>
      <style>{`
        /* Sana Chatbot Styles */
        .sana-chatbot-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a4e226, #81c408);
          opacity: 0.75;
          box-shadow: 0 4px 12px rgba(129, 196, 8, 0.3);
          border: none;
          cursor: pointer;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .sana-chatbot-button:hover {
          background: linear-gradient(135deg, #5b9309, #3f6602);
          opacity: 1;
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          z-index: 10005;
        }
        .sana-chatbot-button:active {
          transform: scale(0.95);
        }

        .sana-chat-window {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 380px;
          height: 550px;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          animation: sanaFadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes sanaFadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .sana-chat-header {
          background: #81c408;
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .sana-chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sana-chat-avatar-container {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .sana-chat-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sana-chat-avatar-placeholder {
          font-weight: bold;
          color: #81c408;
          font-size: 18px;
        }
        .sana-status-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background: #4ade80;
          border: 2px solid #81c408;
          border-radius: 50%;
          animation: sanaPulse 2s infinite;
        }
        @keyframes sanaPulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(74, 222, 128, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
        .sana-chat-title-container {
          display: flex;
          flex-direction: column;
        }
        .sana-chat-title {
          font-weight: 700;
          font-size: 16px;
          margin: 0;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }
        .sana-chat-subtitle {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }
        .sana-chat-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sana-chat-action-btn {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .sana-chat-action-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .sana-chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-color: #fbfbfb;
        }
        .sana-chat-messages::-webkit-scrollbar {
          width: 6px;
        }
        .sana-chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .sana-chat-messages::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 10px;
        }

        .sana-message-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }
        .sana-message-wrapper.bot {
          align-self: flex-start;
        }
        .sana-message-wrapper.user {
          align-self: flex-end;
        }
        .sana-message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          word-break: break-word;
        }
        .sana-message-wrapper.bot .sana-message-bubble {
          background: #81c408;
          color: white;
          border-top-left-radius: 4px;
        }
        .sana-message-wrapper.user .sana-message-bubble {
          background: #f1f1f1;
          color: #333;
          border-top-right-radius: 4px;
        }
        .sana-message-time {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
          margin-left: 4px;
        }
        .sana-message-wrapper.user .sana-message-time {
          align-self: flex-end;
          margin-right: 4px;
        }

        .sana-typing-container {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: #81c408;
          border-radius: 18px;
          border-top-left-radius: 4px;
          width: fit-content;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }
        .sana-typing-dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: sanaTypingDot 1.4s infinite both;
        }
        .sana-typing-dot:nth-child(2) {
          animation-delay: .2s;
        }
        .sana-typing-dot:nth-child(3) {
          animation-delay: .4s;
        }
        @keyframes sanaTypingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        .sana-chat-footer {
          padding: 12px 16px;
          background: white;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sana-input-container {
          display: flex;
          align-items: center;
          background: #f7f7f7;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 24px;
          padding: 6px 14px;
          gap: 8px;
          transition: all 0.2s;
        }
        .sana-input-container:focus-within {
          background: white;
          border-color: #81c408;
          box-shadow: 0 0 0 3px rgba(129, 196, 8, 0.15);
        }
        .sana-chat-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: #333;
          padding: 6px 0;
        }
        .sana-chat-input::placeholder {
          color: #aaa;
        }
        .sana-send-btn {
          background: #81c408;
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .sana-send-btn:hover {
          background: #6fa606;
          transform: scale(1.05);
        }
        .sana-send-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        .sana-chat-powered {
          font-size: 9px;
          color: #bbb;
          text-align: center;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        @media (max-width: 480px) {
          .sana-chat-window {
            bottom: 0;
            right: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
            border: none;
          }
        }
      `}</style>

      {/* Floating Chat Button */}
      <button
        className="sana-chatbot-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Sana"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{ color: "white" }}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{ color: "white" }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="sana-chat-window">
          {/* Header */}
          <div className="sana-chat-header">
            <div className="sana-chat-header-info">
              <div className="sana-chat-avatar-container">
                <img
                  className="sana-chat-avatar"
                  src="/images/sana.png"
                  alt="Sana"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="sana-chat-avatar-placeholder" style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>S</span>
                <span className="sana-status-dot"></span>
              </div>
              <div className="sana-chat-title-container">
                <h3 className="sana-chat-title">Sana</h3>
                <span className="sana-chat-subtitle">Shopping Assistant</span>
              </div>
            </div>
            <div className="sana-chat-header-actions">
              <button
                className="sana-chat-action-btn"
                onClick={() => setIsReversed(!isReversed)}
                title={isReversed ? "Standard Order (Oldest First)" : "Reverse Order (Newest First)"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isReversed ? "#ffd700" : "currentColor"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="7 16 3 12 7 8"></polyline>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <polyline points="17 8 21 12 17 16"></polyline>
                </svg>
              </button>
              <button
                className="sana-chat-action-btn"
                onClick={handleReset}
                title="Reset Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </button>
              <button
                className="sana-chat-action-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="sana-chat-messages">
            {(isReversed ? [...messages].reverse() : messages).map((msg) => (
              <div key={msg.id} className={`sana-message-wrapper ${msg.sender}`}>
                <div className="sana-message-bubble">
                  {msg.text}
                </div>
                <span className="sana-message-time">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="sana-message-wrapper bot">
                <div className="sana-typing-container">
                  <span className="sana-typing-dot"></span>
                  <span className="sana-typing-dot"></span>
                  <span className="sana-typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <form className="sana-chat-footer" onSubmit={handleSend}>
            <div className="sana-input-container">
              <input
                type="text"
                className="sana-chat-input"
                placeholder={step === "ask_name" ? "Enter your name..." : "Ask Sana something..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="sana-send-btn"
                disabled={!inputText.trim() || isTyping}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            <p className="sana-chat-powered">
              <span>Powered by Gemini AI</span>
            </p>
          </form>
        </div>
      )}
    </>
  );
}