import { useState } from "react";
import { useNavigate } from "react-router-dom";

function VoiceSearch() {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "info" });
  const [listening, setListening] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const commandList = [
    { category: "Navigation", commands: ["Home", "Products / Shop", "Categories", "Brands", "Cart", "Checkout", "My Orders", "Wishlist", "Addresses"] },
    { category: "Account & Auth", commands: ["Login / Sign In", "Register / Sign Up", "Change Password", "Forgot Password", "Vendor Portal", "Admin Dashboard"] },
    { category: "Voice Search", commands: ["Search [item] (e.g., 'Search shoes')", "Find [item] (e.g., 'Find laptop')", "Look for [item]"] },
    { category: "Page Actions", commands: ["Scroll Up / Top", "Scroll Down / Bottom", "Go Back", "Go Forward", "Reload / Refresh"] }
  ];

  const executeCommand = (rawCommand) => {
    const command = rawCommand.toLowerCase().trim();

    // 1. Search Query Handling (Search shoes, find laptop, look for shirt)
    if (command.startsWith("search for ")) {
      const query = command.replace("search for ", "").trim();
      if (query) {
        setFeedback({ message: `Searching for "${query}"`, type: "success" });
        navigate(`/cardProduct?q=${encodeURIComponent(query)}`);
        return;
      }
    } else if (command.startsWith("search ")) {
      const query = command.replace("search ", "").trim();
      if (query) {
        setFeedback({ message: `Searching for "${query}"`, type: "success" });
        navigate(`/cardProduct?q=${encodeURIComponent(query)}`);
        return;
      }
    } else if (command.startsWith("find ")) {
      const query = command.replace("find ", "").trim();
      if (query) {
        setFeedback({ message: `Searching for "${query}"`, type: "success" });
        navigate(`/cardProduct?q=${encodeURIComponent(query)}`);
        return;
      }
    } else if (command.startsWith("look for ")) {
      const query = command.replace("look for ", "").trim();
      if (query) {
        setFeedback({ message: `Searching for "${query}"`, type: "success" });
        navigate(`/cardProduct?q=${encodeURIComponent(query)}`);
        return;
      }
    }

    // 2. Navigation Commands
    if (command.includes("open cart") || command.includes("cart") || command.includes("my cart") || command.includes("shopping bag")) {
      setFeedback({ message: "Opening Shopping Cart", type: "success" });
      navigate("/cart");
    }
    else if (command.includes("checkout") || command.includes("pay") || command.includes("buy now")) {
      setFeedback({ message: "Redirecting to Checkout", type: "success" });
      navigate("/Checkout");
    }
    else if (command.includes("my orders") || command.includes("orders") || command.includes("order history") || command.includes("track order")) {
      setFeedback({ message: "Opening My Orders", type: "success" });
      navigate("/myorders");
    }
    else if (command.includes("home") || command.includes("main page") || command.includes("index")) {
      setFeedback({ message: "Going to Home Page", type: "success" });
      navigate("/");
    }
    else if (command.includes("category") || command.includes("categories")) {
      setFeedback({ message: "Opening Categories", type: "success" });
      navigate("/CardCategory");
    }
    else if (command.includes("product") || command.includes("products") || command.includes("shop") || command.includes("store")) {
      setFeedback({ message: "Opening Products Catalog", type: "success" });
      navigate("/cardProduct");
    }
    else if (command.includes("brand") || command.includes("brands")) {
      setFeedback({ message: "Opening Brands", type: "success" });
      navigate("/CardBrand");
    }
    else if (command.includes("wishlist") || command.includes("favorites") || command.includes("saved items")) {
      setFeedback({ message: "Opening Wishlist", type: "success" });
      navigate("/viewWishlist");
    }
    else if (command.includes("address") || command.includes("my address") || command.includes("addresses")) {
      setFeedback({ message: "Opening Address Settings", type: "success" });
      navigate("/address/add");
    }
    else if (command.includes("contact") || command.includes("support") || command.includes("queries") || command.includes("help")) {
      setFeedback({ message: "Opening Contact Support", type: "success" });
      navigate("/Contact");
    }
    else if (command.includes("change password") || command.includes("update password")) {
      setFeedback({ message: "Opening Change Password", type: "success" });
      navigate("/changepass");
    }
    else if (command.includes("forgot password") || command.includes("reset password")) {
      setFeedback({ message: "Opening Forgot Password", type: "success" });
      navigate("/forgot-password");
    }
    else if (command.includes("login") || command.includes("log in") || command.includes("sign in")) {
      setFeedback({ message: "Opening Login", type: "success" });
      navigate("/login");
    }
    else if (command.includes("register") || command.includes("sign up") || command.includes("create account")) {
      setFeedback({ message: "Opening Registration", type: "success" });
      navigate("/customerReg");
    }
    else if (command.includes("vendor") || command.includes("seller")) {
      setFeedback({ message: "Opening Vendor Portal", type: "success" });
      navigate("/vendor/register");
    }
    else if (command.includes("admin") || command.includes("admin panel")) {
      setFeedback({ message: "Opening Admin Dashboard", type: "success" });
      navigate("/admin");
    }

    // 3. Page Controls
    else if (command.includes("scroll to top") || command.includes("scroll top") || command.includes("scroll up") || command.includes("go to top") || command === "top") {
      setFeedback({ message: "Scrolling to Top", type: "success" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    else if (command.includes("scroll to bottom") || command.includes("scroll bottom") || command.includes("scroll down") || command.includes("go to bottom") || command === "bottom") {
      setFeedback({ message: "Scrolling to Bottom", type: "success" });
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
    else if (command.includes("go back") || command === "back" || command.includes("previous page")) {
      setFeedback({ message: "Going Back", type: "success" });
      navigate(-1);
    }
    else if (command.includes("go forward") || command === "forward" || command.includes("next page")) {
      setFeedback({ message: "Going Forward", type: "success" });
      navigate(1);
    }
    else if (command.includes("reload") || command.includes("refresh")) {
      setFeedback({ message: "Reloading Page...", type: "success" });
      window.location.reload();
    }

    // 4. Fallback Unrecognized Command
    else {
      setFeedback({ message: `Command not recognized: "${rawCommand}"`, type: "warning" });
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    setListening(true);
    setFeedback({ message: "Listening... speak now", type: "info" });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      executeCommand(transcript);
    };

    recognition.onend = () => {
      setListening(false);
      setTimeout(() => {
        setText("");
        setFeedback({ message: "", type: "info" });
      }, 4000);
    };

    recognition.onerror = (event) => {
      setListening(false);
      setFeedback({ message: `Voice recognition error: ${event.error}`, type: "danger" });
    };
  };

  const handleMicClick = () => {
    setIsExpanded((prev) => !prev);
    if (showGuide) {
      setShowGuide(false);
    }
    startListening();
  };

  return (
    <>
      <style>{`
        .voice-search-wrapper {
          position: fixed;
          bottom: 24px;
          right: 96px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .voice-feedback-pill {
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(10px);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideInUp 0.3s ease-out;
        }

        .voice-feedback-pill.type-success {
          border-left: 4px solid #a4e226;
        }
        .voice-feedback-pill.type-warning {
          border-left: 4px solid #ffc107;
        }
        .voice-feedback-pill.type-danger {
          border-left: 4px solid #dc3545;
        }

        .voice-btn-group {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .voice-guide-trigger {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.85);
          color: #a4e226;
          border: 1px solid rgba(164, 226, 38, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 1;
          position: relative;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, background 0.2s ease;
        }

        .voice-guide-trigger.collapsed {
          transform: translateX(58px) scale(0.4);
          opacity: 0;
          pointer-events: none;
        }

        .voice-guide-trigger.expanded {
          transform: translateX(0) scale(1);
          opacity: 1;
          pointer-events: auto;
        }

        .voice-guide-trigger.expanded:hover {
          background: #a4e226;
          color: #0f172a;
          transform: translateX(0) scale(1.1);
        }

        .voice-search-button {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a4e226, #81c408);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(129, 196, 8, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 2;
          position: relative;
        }
        .voice-search-button:hover {
          background: linear-gradient(135deg, #5b9309, #3f6602);
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
        }
        .voice-search-button.listening {
          background: linear-gradient(135deg, #ff4d4d, #dc3545) !important;
          animation: voicePulse 1.5s infinite;
        }

        .voice-guide-modal {
          position: fixed;
          bottom: 95px;
          right: 96px;
          width: 320px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          z-index: 10006;
          padding: 18px;
          border: 1px solid #e2e8f0;
          animation: guideFade 0.25s ease-out;
        }
        .voice-guide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        @keyframes voicePulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(220, 53, 69, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes guideFade {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div className="voice-search-wrapper">
        {/* Feedback / Heard Text Toast */}
        {(feedback.message || text) && (
          <div className={`voice-feedback-pill type-${feedback.type}`}>
            <i className={`fas ${listening ? "fa-wave-square text-warning" : "fa-info-circle"}`}></i>
            <span>{feedback.message || `Heard: "${text}"`}</span>
          </div>
        )}

        {/* Buttons Group */}
        <div className="voice-btn-group">
          <button
            onClick={() => {
              setShowGuide(!showGuide);
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`voice-guide-trigger ${isExpanded ? "expanded" : "collapsed"}`}
            title="Voice Commands Help"
          >
            <i className="fas fa-question-circle"></i>
          </button>

          <button
            onClick={handleMicClick}
            className={`voice-search-button ${listening ? "listening" : ""}`}
            title="Click to speak a voice command"
          >
            <i className={`fas fa-microphone${listening ? "" : "-slash"}`}></i>
          </button>
        </div>

        {/* Interactive Voice Guide Modal */}
        {showGuide && (
          <div className="voice-guide-modal">
            <div className="voice-guide-header">
              <h6 className="m-0 fw-bold text-dark">
                <i className="fas fa-microphone text-success me-2"></i>
                Voice Commands
              </h6>
              <button
                type="button"
                className="btn-close btn-sm"
                onClick={() => setShowGuide(false)}
              ></button>
            </div>
            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
              {commandList.map((sec, idx) => (
                <div key={idx} className="mb-2">
                  <small className="text-uppercase fw-bold text-muted" style={{ fontSize: "11px" }}>
                    {sec.category}
                  </small>
                  <ul className="list-unstyled mb-2 mt-1">
                    {sec.commands.map((cmd, cIdx) => (
                      <li key={cIdx} className="text-secondary small py-1 border-bottom" style={{ fontSize: "12px" }}>
                        <i className="fas fa-angle-right text-success me-1"></i> {cmd}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default VoiceSearch;