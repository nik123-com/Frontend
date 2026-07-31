import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../server/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // CAPTCHA STATE
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const nav = useNavigate();

  const ChangeEmail = (e) => setEmail(e.target.value);
  const ChangePassword = (e) => setPassword(e.target.value);

  // ================= CAPTCHA LOGIC =================

  function randomText() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  }

  function drawCaptcha(text) {
    const canvas = document.getElementById("captchaCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Light background matching design
    ctx.fillStyle = "#eef2f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise lines
    const lineColors = ["#e53e3e", "#dd6b20", "#319795", "#3182ce", "#805ad5", "#d53f8c", "#38a169"];
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = lineColors[Math.floor(Math.random() * lineColors.length)];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Text styling
    ctx.font = "bold 26px Arial, sans-serif";
    ctx.textBaseline = "middle";

    const totalWidth = canvas.width;
    const startX = 20;
    const spacing = (totalWidth - 40) / text.length;

    for (let i = 0; i < text.length; i++) {
      let x = startX + i * spacing;
      let y = canvas.height / 2 + (Math.random() * 6 - 3);
      let angle = Math.random() * 0.4 - 0.2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = randomDarkColor();
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // Noise dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = randomColor();
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function randomColor() {
    return `rgb(${rand(0, 255)},${rand(0, 255)},${rand(0, 255)})`;
  }

  function randomDarkColor() {
    return `rgb(${rand(0, 150)},${rand(0, 150)},${rand(0, 150)})`;
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function generateCaptcha() {
    const newCaptcha = randomText();
    setCaptchaText(newCaptcha);
    // Timeout ensures canvas node is rendered before drawing
    setTimeout(() => drawCaptcha(newCaptcha), 10);
  }

  function validateCaptcha() {
    return captchaInput.trim().toUpperCase() === captchaText.toUpperCase();
  }

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Form Submission
  const handleForm = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please Fill your email");
      return;
    }
    if (!password.trim()) {
      toast.error("Please Enter Password");
      return;
    }
    if (!captchaInput.trim()) {
      toast.error("Please enter captcha to proceed");
      return;
    }
    if (!validateCaptcha()) {
      toast.error("Wrong Captcha");
      generateCaptcha();
      setPassword("");
      setCaptchaInput("");
      return;
    }

    let data = { email, password };

    setLoading(true);

    login(data)
      .then((res) => {
        if (res.data.success) {
          sessionStorage.setItem("userId", res.data.data.userId);
          sessionStorage.setItem("userId.name", res.data.data.name);
          sessionStorage.setItem("email", res.data.data.email);
          sessionStorage.setItem("userType", res.data.data.userType);
          sessionStorage.setItem("token", res.data.token);
          sessionStorage.setItem("isLogin", true);

          toast.success("Login Successfully");

          if (res.data.data.userType == 1) {
            nav("/admin");
          } else if (res.data.data.userType == 3) {
            nav("/vendor");
          } else {
            nav("/");
          }
        } else {
          toast.error(res.data.massage || res.data.message || "User not Found");
        }
      })
      .catch(() => {
        toast.error("Server is not Running");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ================= UI =================

  return (
    <div
      className="container-fluid py-2 py-md-3"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="container" style={{ maxWidth: "1000px" }}>
        <div
          className="p-4 p-md-5 shadow-sm"
          style={{ backgroundColor: "#f4f6f8", borderRadius: "18px" }}
        >
          <div className="mx-auto" style={{ maxWidth: "750px" }}>
            {/* Logo */}
            <div className="text-center mb-3">
              <img
                src="/assets/img/Logo.png"
                alt="Aventra Logo"
                style={{ height: "50px", objectFit: "contain" }}
              />
            </div>

            {/* Title */}
            <h1
              className="text-center fw-bold mb-4"
              style={{ color: "#78c214", fontSize: "38px", letterSpacing: "-0.5px" }}
            >
              Login
            </h1>

            <form onSubmit={handleForm}>
              {/* Email Input */}
              <div className="position-relative mb-3">
                <input
                  type="email"
                  className="form-control shadow-sm border-0 py-3 px-4 w-100"
                  placeholder="Enter Your Email"
                  onChange={ChangeEmail}
                  value={email}
                  required
                  style={{
                    borderRadius: "10px",
                    fontSize: "15px",
                    paddingRight: "50px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)"
                  }}
                />
                <span
                  className="position-absolute end-0 top-50 translate-middle-y me-3 d-flex align-items-center"
                  style={{ pointerEvents: "none" }}
                >
                  <i className="fa-solid fa-envelope" style={{ color: "#00a884", fontSize: "16px" }}></i>
                </span>
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <input
                  type="password"
                  className="form-control shadow-sm border-0 py-3 px-4 w-100"
                  placeholder="Enter Your Password"
                  onChange={ChangePassword}
                  value={password}
                  required
                  style={{
                    borderRadius: "10px",
                    fontSize: "15px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)"
                  }}
                />
              </div>

              {/* Captcha Box */}
              <div className="d-flex justify-content-center mb-4">
                <div
                  className="card shadow-sm p-4 text-center"
                  style={{
                    borderRadius: "16px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    width: "320px",
                    maxWidth: "100%"
                  }}
                >
                  <div className="d-flex justify-content-center mb-3">
                    <canvas
                      id="captchaCanvas"
                      width={210}
                      height={55}
                      style={{
                        borderRadius: "10px",
                        display: "block"
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn fw-bold px-4 py-2"
                      style={{
                        backgroundColor: "#ffaa00",
                        color: "#000000",
                        borderRadius: "50px",
                        border: "none",
                        fontSize: "14px",
                        boxShadow: "0 2px 4px rgba(255, 170, 0, 0.2)"
                      }}
                      onClick={generateCaptcha}
                    >
                      Refresh Captcha
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      className="form-control text-center py-2"
                      placeholder="Enter Captcha"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="d-flex justify-content-end mb-3">
                <Link
                  to="/forgot-password"
                  className="fw-semibold text-decoration-none"
                  style={{ color: "#78c214", fontSize: "15px" }}
                >
                  Forgot Password
                </Link>
              </div>

              {/* Login Button */}
              <button
                className="w-100 btn py-3 text-white fw-bold shadow-sm mb-3"
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#78c214",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <hr style={{ borderColor: "#e5e7eb", margin: "25px 0 20px 0" }} />

            {/* Footer Link */}
            <div className="text-center d-flex flex-column gap-2" style={{ fontSize: "15px", color: "#6b7280" }}>
              <div>
                Don't have an account?{" "}
                <Link
                  to="/customerReg"
                  className="fw-bold text-decoration-none"
                  style={{ color: "#78c214" }}
                >
                  Register as Customer
                </Link>
              </div>
              <div>
                Want to sell with us?{" "}
                <Link
                  to="/vendor/register"
                  className="fw-bold text-decoration-none"
                  style={{ color: "#0d6efd" }}
                >
                  Become a Vendor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
