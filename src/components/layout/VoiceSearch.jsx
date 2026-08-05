import { useState } from "react";
import { useNavigate } from "react-router-dom";

function VoiceSearch() {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();

  const executeCommand = (command) => {
    command = command.toLowerCase();

    if (command.includes("search")) {
      const query = command.replace("search", "").trim();
      // alert(`Searching Product: ${query}`);
      // navigate(`/products?q=${query}`);
    }
    else if (command.includes("open cart") || command.includes("cart")) {
      // alert("Opening Cart");
      navigate("/cart");
    }
    else if (command.includes("checkout")) {
      // alert("Redirecting to Checkout");
      navigate("/Checkout");
    }
    else if (command.includes("my orders") || command.includes("orders")) {
      // alert("Opening Orders");
      navigate("/myorders");
    }
    else if (command.includes("home")) {
      // alert("Going to Home Page");
      navigate("/");
    }
    else if (command.includes("category")) {
      // alert("Opening Fashion Category");
      navigate("/CardCategory");
    }
    else if (command.includes("product")) {
      navigate("/cardProduct");
    }
    else if (command.includes("brand")) {
      navigate("/CardBrand");
    }
    else {
      // alert("Command Not Recognized: " + command);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    setListening(true);

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setText(transcript);
      executeCommand(transcript);
    };

    recognition.onend = () => {
      setListening(false);
      setTimeout(() => setText(""), 3000);
    };

    recognition.onerror = (event) => {
      setListening(false);
      alert("Error occurred in recognition: " + event.error);
    };
  };

  return (
    <>
      <style>{`
        .voice-search-container {
          position: fixed;
          bottom: 24px;
          right: 96px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          transition: z-index 0.2s ease;
        }
        .voice-search-container:hover {
          z-index: 10005;
        }
        .voice-search-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a4e226, #81c408);
          opacity: 0.75;
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(129, 196, 8, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .voice-search-button:hover {
          background: linear-gradient(135deg, #5b9309, #3f6602);
          opacity: 1;
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          color: white;
        }
        .voice-search-button.listening {
          background: linear-gradient(135deg, #ff4d4d, #dc3545) !important;
          opacity: 1 !important;
          animation: voicePulse 1.5s infinite;
        }
        @keyframes voicePulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
      `}</style>
      <div className="voice-search-container">
        {text && (
          <div className="bg-dark text-white p-2 rounded mb-2 shadow">
            {text}
          </div>
        )}
        <button 
          onClick={startListening}
          className={`voice-search-button ${listening ? "listening" : ""}`}
          title="Voice Search"
        >
          <i className={`fas fa-microphone${listening ? "" : "-slash"}`}></i>
        </button>
      </div>
    </>
  );
}

export default VoiceSearch;