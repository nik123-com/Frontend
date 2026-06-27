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
    <div style={{ position: "fixed", bottom: "80px", right: "20px", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      {text && (
        <div className="bg-dark text-white p-2 rounded mb-2 shadow">
          {text}
        </div>
      )}
      <button 
        onClick={startListening}
        className={`btn rounded-circle shadow-lg d-flex align-items-center justify-content-center ${listening ? "btn-danger" : "btn-primary"}`}
        style={{ width: "60px", height: "60px", fontSize: "24px" }}
        title="Voice Search"
      >
        <i className={`fas fa-microphone${listening ? "" : "-slash"}`}></i>
      </button>
    </div>
  );
}

export default VoiceSearch;